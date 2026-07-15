"use client";

import AnimatedModal, {
  type AnimatedModalProps,
  type ModalCloseReason,
} from "@/app/components/ui/AnimatedModal";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  createPaymentSchema,
  isValidISODate,
} from "@/lib/validation/modalSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  editPermitRequest,
  getPermitsWithToken,
  postPermitRequest,
  type GetPermitResT,
  type PermitPayload,
  type PermitRequestT,
  type PermitTypeT,
} from "@/app/api/permit";
import { getApiErrorMessage, upsertApiRequest } from "@/app/api/base";
import SarAmount from "@/app/components/ui/SarAmount";
import {
  MdAddAPhoto,
  MdArrowBack,
  MdArrowForward,
  MdBadge,
  MdCheck,
  MdCheckCircle,
  MdCloudUpload,
  MdClose,
  MdDescription,
  MdExpandMore,
  MdFolderShared,
  MdInfo,
  MdPayment,
  MdPerson,
  MdPublic,
} from "react-icons/md";

export type PermitType = "hajj" | "umrah";

type PaymentMethod = "card" | "bank";

type CardData = {
  cardholder: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
};

type PaymentErrors = Partial<
  Record<
    "method" | "cardholder" | "cardNumber" | "expiry" | "cvc" | "receipt",
    string
  >
>;

type CountryValue = "sa" | "id" | "ms" | "tr" | "lk";

type CountryOption = {
  value: CountryValue;
  dial: string;
  flag: string;
  label: string;
};

const COUNTRY_OPTIONS: readonly Omit<CountryOption, "label">[] = [
  { value: "sa", dial: "+966", flag: "sa" },
  { value: "id", dial: "+62", flag: "id" },
  { value: "ms", dial: "+60", flag: "my" },
  { value: "tr", dial: "+90", flag: "tr" },
  { value: "lk", dial: "+94", flag: "lk" },
] as const;

type CountryDropdownMode = "dial" | "country";

function CountryDropdown({
  value,
  onChange,
  options,
  mode,
  placeholder,
  invalid,
  buttonClassName,
  dir,
}: {
  value: CountryValue | "";
  onChange: (value: CountryValue | "") => void;
  options: readonly CountryOption[];
  mode: CountryDropdownMode;
  placeholder?: string;
  invalid?: boolean;
  buttonClassName: string;
  dir?: "ltr" | "rtl";
}) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value],
  );

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (!rootRef.current?.contains(target)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const displayText =
    mode === "dial"
      ? (selected?.dial ?? placeholder ?? "")
      : (selected?.label ?? placeholder ?? "");

  return (
    <div ref={rootRef} className="relative" dir={dir}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((s) => !s)}
        className={buttonClassName}
        data-invalid={invalid ? "true" : "false"}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected ? (
            <span
              className={`fi fi-${selected.flag} inline-block size-4 shrink-0 overflow-hidden rounded-sm ring-1 ring-black/10`}
              aria-hidden
            />
          ) : null}
          <span className="truncate">{displayText}</span>
        </span>
        <span className="ml-3 text-gray-400" aria-hidden="true">
          ▾
        </span>
      </button>

      {open ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-2 w-full overflow-auto rounded-xl border border-gray-200 bg-background-light shadow-sm dark:border-[#332e25] dark:bg-background-dark max-h-64"
        >
          {mode === "country" && placeholder ? (
            <button
              type="button"
              role="option"
              aria-selected={value === ""}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-[#221d14]"
            >
              {placeholder}
            </button>
          ) : null}

          {options.map((o) => {
            const isSelected = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={joinClassNames(
                  "flex w-full items-center justify-between gap-3 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-[#221d14]",
                  isSelected
                    ? "bg-primary/5 text-gray-900 dark:text-white"
                    : "text-gray-700 dark:text-gray-200",
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className={`fi fi-${o.flag} inline-block size-4 shrink-0 overflow-hidden rounded-sm ring-1 ring-black/10`}
                    aria-hidden
                  />
                  <span className="truncate">{o.label}</span>
                </span>
                <span className="shrink-0" dir="ltr">
                  {mode === "dial" ? o.dial : o.value.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function joinClassNames(...values: Array<string | undefined | false | null>) {
  return values.filter(Boolean).join(" ");
}

function formatCardNumber(value: string) {
  const digits = value.replace(/\D+/g, "").slice(0, 19);
  const groups: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    groups.push(digits.slice(i, i + 4));
  }
  return groups.join(" ");
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D+/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function createStep1Schema(t: (key: string) => string) {
  return z.object({
    permitType: z
      .string()
      .trim()
      .min(1, t("validation.permitTypeRequired"))
      .refine(
        (v) => v === "hajj" || v === "umrah",
        t("validation.permitTypeRequired"),
      ),
    notes: z.string().trim().optional().or(z.literal("")),
  });
}

function createStep2Schema(
  tModal: (key: string) => string,
  tStep2: (key: string) => string,
) {
  const allowed = COUNTRY_OPTIONS.map((c) => c.value) as string[];
  return z.object({
    fullName: z.string().trim().min(1, tStep2("validation.fullNameRequired")),
    phoneCountry: z
      .string()
      .trim()
      .min(1, tStep2("validation.phoneCountryRequired"))
      .refine(
        (v) => allowed.includes(v),
        tStep2("validation.phoneCountryRequired"),
      ),
    phone: z
      .string()
      .trim()
      .min(1, tStep2("validation.phoneRequired"))
      .transform((value) => value.replace(/\s+/g, ""))
      .refine(
        (value) => /^\d{8,12}$/.test(value),
        tStep2("validation.phoneInvalid"),
      ),
    country: z
      .string()
      .trim()
      .min(1, tStep2("validation.countryRequired"))
      .refine((v) => allowed.includes(v), tStep2("validation.countryRequired")),
    email: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine(
        (v) => v == null || v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        tStep2("validation.emailInvalid"),
      ),
    idNumber: z
      .string()
      .trim()
      .min(6, tModal("validation.idNumberInvalid")),
    birthDate: z
      .string()
      .trim()
      .min(1, tStep2("validation.birthDateRequired"))
      .refine((v) => isValidISODate(v), tStep2("validation.birthDateInvalid")),
    nationality: z
      .string()
      .trim()
      .min(1, tModal("validation.nationalityRequired")),
  });
}

type PaymentValues = z.infer<ReturnType<typeof createPaymentSchema>>;

export type PermitsRequestPayload = {
  permitType: PermitType;
  notes?: string;
  applicant: {
    fullName: string;
    phoneCountry: string;
    phone: string;
    country: string;
    email?: string;
    idNumber: string;
    birthDate: string;
    nationality: string;
  };
  documents: {
    idFile: File;
    personalPhoto: File;
  };
  payment: PaymentValues;
};

type PermitSubmitArgs = {
  apiPayload: PermitPayload;
  apiResponse: unknown;
  mode: "create" | "update";
};

export type PermitsRequestModalProps = {
  open: boolean;
  onOpenChange: (open: boolean, reason: ModalCloseReason) => void;

  permits?: GetPermitResT;

  prefillRequest?: PermitRequestT | null;

  onComplete?: (args: PermitSubmitArgs) => void | Promise<void>;

  modalProps?: Omit<
    AnimatedModalProps,
    "open" | "onOpenChange" | "children" | "title" | "description"
  >;
};

type FormValues = z.infer<ReturnType<typeof createStep1Schema>> &
  z.infer<ReturnType<typeof createStep2Schema>>;

const DEFAULT_FORM_VALUES: FormValues = {
  permitType: "umrah",
  notes: "",
  fullName: "",
  phoneCountry: "sa",
  phone: "",
  country: "sa",
  email: "",
  idNumber: "",
  birthDate: "",
  nationality: "",
};

function toISODateOnly(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const match = /^\d{4}-\d{2}-\d{2}/.exec(trimmed);
  return match ? match[0] : "";
}

function buildPrefilledValues(req?: PermitRequestT | null): FormValues {
  const next: FormValues = { ...DEFAULT_FORM_VALUES };
  if (!req?.customer) return next;

  const c = req.customer;

  if (typeof c.name === "string") next.fullName = c.name;
  if (typeof c.email === "string") next.email = c.email;
  if (typeof c.country === "string") {
    const found = COUNTRY_OPTIONS.find((x) => x.value === c.country);
    if (found) next.country = found.value;
  }
  if (typeof c.dob === "string") next.birthDate = toISODateOnly(c.dob);
  if (typeof c.id_number === "string") next.idNumber = c.id_number;
  if (typeof c.nationality === "string") next.nationality = c.nationality;
  if (typeof c.additional_notes === "string") next.notes = c.additional_notes;

  const apiPermitType =
    (c.permit_type ?? req.permit_type) === "PermitHajj" ? "hajj" : "umrah";
  next.permitType = apiPermitType;

  if (typeof c.phone === "string") {
    const raw = c.phone.trim().replace(/\s+/g, "");
    const parsed = COUNTRY_OPTIONS.map((x) => ({
      value: x.value,
      dial: x.dial,
      dialDigits: x.dial.replace(/^\+/, ""),
    })).find((x) => raw.startsWith(x.dial) || raw.startsWith(x.dialDigits));

    if (parsed) {
      next.phoneCountry = parsed.value;
      const remainder = raw.startsWith(parsed.dial)
        ? raw.slice(parsed.dial.length)
        : raw.slice(parsed.dialDigits.length);
      next.phone = remainder.replace(/\D+/g, "");
    }
  }

  return next;
}

async function fetchFileFromUrl(
  url: string,
  fallbackName: string,
): Promise<File | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const fileName = (() => {
      try {
        const u = new URL(url);
        const pathName = u.pathname.split("/").filter(Boolean).pop();
        return pathName && pathName.includes(".") ? pathName : fallbackName;
      } catch {
        return fallbackName;
      }
    })();

    return new File([blob], fileName, {
      type: blob.type || undefined,
      lastModified: Date.now(),
    });
  } catch {
    return null;
  }
}

const NATIONALITY_KEYS = ["sa", "eg", "ae", "kw", "jo", "other"] as const;

function getCountryLabel(
  t: (key: string) => string,
  value: CountryValue,
): string {
  if (value === "sa") return t("options.phoneCountries.sa");
  return t(`options.countries.${value}`);
}

function getPermitLabel(
  t: (key: string) => string,
  type: PermitType,
) {
  return type === "hajj" ? t("permitLabels.hajj") : t("permitLabels.umrah");
}

export default function PermitsRequestModal({
  open,
  onOpenChange,
  permits,
  prefillRequest,
  onComplete,
  modalProps,
}: PermitsRequestModalProps) {
  const t = useTranslations("permits.modal");
  const tStep2 = useTranslations("cart.step2");
  const tStep3 = useTranslations("cart.step3");
  const tCommon = useTranslations("common");
  const formId = useId();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [personalPhoto, setPersonalPhoto] = useState<File | null>(null);
  const [docsError, setDocsError] = useState<string | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedRequest, setSavedRequest] = useState<PermitSubmitArgs | null>(
    null,
  );

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardData, setCardData] = useState<CardData>({
    cardholder: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });
  const [bankReceipt, setBankReceipt] = useState<File | null>(null);
  const [paymentErrors, setPaymentErrors] = useState<PaymentErrors>({});

  const formSchema = useMemo(
    () => createStep1Schema(t).merge(createStep2Schema(t, tStep2)),
    [t, tStep2],
  );
  const paymentSchema = useMemo(
    () => createPaymentSchema(tStep3),
    [tStep3],
  );
  const countryOptions = useMemo<CountryOption[]>(
    () =>
      COUNTRY_OPTIONS.map((opt) => ({
        ...opt,
        label: getCountryLabel(tStep2, opt.value),
      })),
    [tStep2],
  );

  const {
    register,
    trigger,
    watch,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onSubmit",
  });

  const canClose = !(isSubmitting || isSending);

  useEffect(() => {
    if (open) return;
    setStep(1);
    reset();
    setIdFile(null);
    setPersonalPhoto(null);
    setDocsError(null);
    setSubmitError(null);
    setIsSending(false);
    setSavedRequest(null);
    setPaymentMethod("card");
    setCardData({ cardholder: "", cardNumber: "", expiry: "", cvc: "" });
    setBankReceipt(null);
    setPaymentErrors({});
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function applyPrefill(req: PermitRequestT | null) {
      reset(buildPrefilledValues(req));

      const idUrl = req?.files?.customer_id_photo;
      const personalUrl = req?.files?.customer_personal_photo;

      if (typeof idUrl === "string" && idUrl.length > 0) {
        const file = await fetchFileFromUrl(idUrl, "id-photo");
        if (!cancelled && file) setIdFile(file);
      }

      if (typeof personalUrl === "string" && personalUrl.length > 0) {
        const file = await fetchFileFromUrl(personalUrl, "personal-photo");
        if (!cancelled && file) setPersonalPhoto(file);
      }

      if (!cancelled) {
        setDocsError(null);
      }
    }

    (async () => {
      // 1) Server-provided request (best quality / no extra network).
      if (prefillRequest) {
        await applyPrefill(prefillRequest);
        return;
      }

      // 2) Client fetch using cookie-based session.
      try {
        const json = await getPermitsWithToken();
        if (cancelled) return;
        await applyPrefill(json ?? null);
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, prefillRequest, reset]);

  const permitType = watch("permitType") as PermitType;

  const phoneCountry = watch("phoneCountry") as CountryValue | "";
  const selectedPhoneDial =
    countryOptions.find((c) => c.value === phoneCountry)?.dial ?? "";

  // currency display handled via <SarAmount />

  const permitPriceByType = useMemo(() => {
    const out: Partial<Record<PermitType, number>> = {};
    for (const p of permits?.permits ?? []) {
      if (p?.type === "PermitHajj") out.hajj = Number(p.price);
      if (p?.type === "PermitUmrah") out.umrah = Number(p.price);
    }
    return out;
  }, [permits]);

  function mapPermitTypeToApi(type: PermitType): PermitTypeT {
    return type === "hajj" ? "PermitHajj" : "PermitUmrah";
  }

  async function savePermitRequest(): Promise<PermitSubmitArgs> {
    if (!idFile || !personalPhoto) {
      throw new Error(t("step2.docsRequired"));
    }

    const values = getValues();

    const dial = COUNTRY_OPTIONS.find(
      (c) => c.value === values.phoneCountry,
    )?.dial;
    const safeDial = typeof dial === "string" ? dial : "";
    const phone = `${safeDial}${String(values.phone ?? "").replace(/\s+/g, "")}`;

    const apiPayload: PermitPayload = {
      customer: {
        name: values.fullName.trim(),
        phone,
        country: String(values.country ?? ""),
        email: values.email?.trim() ? values.email.trim() : "",
        dob: values.birthDate,
        id_number: values.idNumber.trim(),
        nationality: values.nationality,
        additional_notes: values.notes?.trim() ? values.notes.trim() : "",
        permit_type: mapPermitTypeToApi(values.permitType as PermitType),
      },
      files: {
        customer_personal_photo: idFile,
        customer_id_photo: personalPhoto,
      },
    };

    let mode: "create" | "update" = "create";

    const apiResponse = await upsertApiRequest({
      hasExistingRequest: Boolean(prefillRequest),
      update: async () => {
        mode = "update";
        return editPermitRequest(apiPayload);
      },
      create: async () => {
        mode = "create";
        return postPermitRequest(apiPayload);
      },
    });

    return { apiPayload, apiResponse, mode };
  }

  async function finalizeAndClose() {
    if (isSending || isSubmitting) return;

    setSubmitError(null);
    setIsSending(true);
    try {
      const args = savedRequest ?? (await savePermitRequest());
      await (onComplete?.(args) ?? Promise.resolve());
      onOpenChange(false, "programmatic");
    } catch (e) {
      setSubmitError(getApiErrorMessage(e));
    } finally {
      setIsSending(false);
    }
  }

  const inputBase =
    "w-full pr-10 pl-4 py-3 bg-input-fill dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-[#332e25] focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white placeholder-gray-400 transition-all";

  const inputBaseNoIcon =
    "w-full px-4 py-3 bg-input-fill dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-[#332e25] focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white placeholder-gray-400 transition-all";

  function validateDocuments() {
    if (!idFile || !personalPhoto) {
      setDocsError(t("step2.docsRequired"));
      return false;
    }
    setDocsError(null);
    return true;
  }

  async function goNext() {
    if (isSending || isSubmitting) return;

    if (step === 1) {
      const ok = await trigger(["permitType", "notes"]);
      if (ok) setStep(2);
      return;
    }

    if (step === 2) {
      const ok = await trigger([
        "fullName",
        "phoneCountry",
        "phone",
        "country",
        "email",
        "idNumber",
        "birthDate",
        "nationality",
      ]);
      if (!ok) return;
      if (!validateDocuments()) return;

      setSubmitError(null);
      setIsSending(true);
      try {
        const args = await savePermitRequest();
        setSavedRequest(args);
        setStep(3);
      } catch (e) {
        setSubmitError(getApiErrorMessage(e));
      } finally {
        setIsSending(false);
      }
      return;
    }

    if (step === 3) {
      // Payment integration isn't wired yet; allow moving forward,
      // but still compute inline validation errors for the UI.
      const values: unknown =
        paymentMethod === "card"
          ? { method: paymentMethod, ...cardData }
          : { method: paymentMethod, receipt: bankReceipt };

      const result = paymentSchema.safeParse(values);
      if (result.success) {
        setPaymentErrors({});
      } else {
        const nextErrors: PaymentErrors = {};
        for (const issue of result.error.issues) {
          const key = (issue.path[0] ?? "method") as keyof PaymentErrors;
          if (!nextErrors[key]) nextErrors[key] = issue.message;
        }
        setPaymentErrors(nextErrors);
      }

      setStep(4);
    }
  }

  function goBack() {
    if (isSending || isSubmitting) return;
    setDocsError(null);
    setPaymentErrors((s) => ({ ...s, method: undefined }));
    setStep((s) => (s === 1 ? 1 : ((s - 1) as 1 | 2 | 3 | 4)));
  }

  async function submitRequest() {
    await finalizeAndClose();
  }

  const steps = [
    { n: 1, label: t("steps.type"), icon: <MdDescription aria-hidden /> },
    {
      n: 2,
      label: t("steps.details"),
      icon: <MdFolderShared aria-hidden />,
    },
    { n: 3, label: t("steps.payment"), icon: <MdPayment aria-hidden /> },
    { n: 4, label: t("steps.review"), icon: <MdCheckCircle aria-hidden /> },
  ] as const;

  const stepPanel = (
    <AnimatePresence mode="wait" initial={false}>
      {step === 1 ? (
        <motion.div
          key="step-1"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="space-y-6"
        >
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {t("step1.title")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="cursor-pointer relative">
              <input
                type="radio"
                value="hajj"
                {...register("permitType")}
                className="sr-only"
              />
              <div
                className={joinClassNames(
                  "h-full p-6 border-2 rounded-xl transition-all flex flex-col items-center text-center gap-4 bg-white dark:bg-gray-800",
                  permitType === "hajj"
                    ? "border-primary/60"
                    : "border-gray-100 dark:border-gray-700 hover:border-primary/40",
                )}
              >
                <div className="w-16 h-16 rounded-full bg-input-fill dark:bg-gray-700 flex items-center justify-center text-primary mb-2">
                  <MdDescription className="text-3xl" aria-hidden />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    {t("step1.hajjTitle")}
                  </h3>
                  {typeof permitPriceByType.hajj === "number" &&
                  Number.isFinite(permitPriceByType.hajj) ? (
                    <p className="mt-2 text-sm font-bold text-primary">
                      <SarAmount value={permitPriceByType.hajj} />
                    </p>
                  ) : null}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                    {t("step1.hajjDesc")}
                  </p>
                </div>
              </div>
            </label>

            <label className="cursor-pointer relative">
              <input
                type="radio"
                value="umrah"
                {...register("permitType")}
                className="sr-only"
              />
              <div
                className={joinClassNames(
                  "h-full p-6 border-2 rounded-xl transition-all flex flex-col items-center text-center gap-4 bg-white dark:bg-gray-800",
                  permitType === "umrah"
                    ? "border-primary/60"
                    : "border-gray-100 dark:border-gray-700 hover:border-primary/40",
                )}
              >
                <div className="w-16 h-16 rounded-full bg-input-fill dark:bg-gray-700 flex items-center justify-center text-primary mb-2">
                  <MdDescription className="text-3xl" aria-hidden />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    {t("step1.umrahTitle")}
                  </h3>
                  {typeof permitPriceByType.umrah === "number" &&
                  Number.isFinite(permitPriceByType.umrah) ? (
                    <p className="mt-2 text-sm font-bold text-primary">
                      <SarAmount value={permitPriceByType.umrah} />
                    </p>
                  ) : null}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                    {t("step1.umrahDesc")}
                  </p>
                </div>
              </div>
            </label>
          </div>

          {errors.permitType?.message ? (
            <p className="text-sm text-red-500">{errors.permitType.message}</p>
          ) : null}

          <label className="space-y-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("step1.notesLabel")}
            </span>
            <textarea
              {...register("notes")}
              rows={3}
              className={joinClassNames(
                "w-full px-4 py-3 bg-input-fill dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-[#332e25] focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white placeholder-gray-400 transition-all",
              )}
              placeholder={t("step1.notesPlaceholder")}
            />
          </label>
        </motion.div>
      ) : step === 2 ? (
        <motion.div
          key="step-2"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="space-y-8"
        >
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full" />
              {t("step2.personalInfo")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("step2.fullNameLabel")}
                </label>
                <div className="relative">
                  <span className="absolute right-3 inset-y-0 flex items-center text-gray-400 pointer-events-none">
                    <MdPerson className="text-lg" aria-hidden />
                  </span>
                  <input
                    {...register("fullName")}
                    className={joinClassNames(
                      inputBase,
                      errors.fullName ? "ring-2 ring-red-500/40" : undefined,
                    )}
                    placeholder={t("step2.fullNamePlaceholder")}
                    type="text"
                    aria-invalid={Boolean(errors.fullName)}
                  />
                </div>
                {errors.fullName?.message ? (
                  <p className="text-sm text-red-500">
                    {errors.fullName.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("step2.phoneLabel")}
                </label>

                <div className="flex w-full min-w-0" dir="ltr">
                  <CountryDropdown
                    value={watch("phoneCountry") as CountryValue}
                    onChange={(next) =>
                      setValue("phoneCountry", next as CountryValue, {
                        shouldValidate: true,
                      })
                    }
                    options={countryOptions}
                    mode="dial"
                    invalid={Boolean(errors.phoneCountry)}
                    dir="ltr"
                    buttonClassName={joinClassNames(
                      "shrink-0 inline-flex items-center justify-between rounded-l-lg border bg-input-fill dark:bg-gray-800 px-3 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary border-gray-200 dark:border-[#332e25]",
                      errors.phoneCountry
                        ? "ring-2 ring-red-500/40"
                        : undefined,
                    )}
                  />

                  <input
                    {...register("phone")}
                    className={joinClassNames(
                      "flex-1 min-w-0 w-0 rounded-r-lg border-t border-r border-b bg-input-fill dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary border-gray-200 dark:border-[#332e25]",
                      errors.phone ? "ring-2 ring-red-500/40" : undefined,
                    )}
                    inputMode="numeric"
                    placeholder="5xxxxxxxx"
                    aria-invalid={Boolean(errors.phone)}
                  />
                </div>

                {(errors.phoneCountry?.message || errors.phone?.message) && (
                  <p className="text-sm text-red-500">
                    {errors.phoneCountry?.message ?? errors.phone?.message}
                  </p>
                )}

                {selectedPhoneDial ? (
                  <p
                    className="text-xs text-gray-500 dark:text-gray-400"
                    dir="ltr"
                  >
                    {t("step2.phoneFormat", { dial: selectedPhoneDial })}
                    {String(watch("phone") ?? "").replace(/\s+/g, "")}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("step2.countryLabel")}
                </label>
                <CountryDropdown
                  value={watch("country") as CountryValue | ""}
                  onChange={(next) =>
                    setValue("country", next as CountryValue, {
                      shouldValidate: true,
                    })
                  }
                  options={countryOptions}
                  mode="country"
                  placeholder={t("step2.countryPlaceholder")}
                  invalid={Boolean(errors.country)}
                  buttonClassName={joinClassNames(
                    inputBaseNoIcon,
                    "inline-flex items-center justify-between",
                    errors.country ? "ring-2 ring-red-500/40" : undefined,
                  )}
                />
                {errors.country?.message ? (
                  <p className="text-sm text-red-500">
                    {errors.country.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("step2.emailLabel")}
                </label>
                <div className="relative">
                  <input
                    {...register("email")}
                    className={joinClassNames(
                      inputBaseNoIcon,
                      errors.email ? "ring-2 ring-red-500/40" : undefined,
                    )}
                    placeholder="name@example.com"
                    type="email"
                    inputMode="email"
                    aria-invalid={Boolean(errors.email)}
                  />
                </div>
                {errors.email?.message ? (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("step2.idLabel")}
                </label>
                <div className="relative">
                  <span className="absolute right-3 inset-y-0 flex items-center text-gray-400 pointer-events-none">
                    <MdBadge className="text-lg" aria-hidden />
                  </span>
                  <input
                    {...register("idNumber")}
                    className={joinClassNames(
                      inputBase,
                      errors.idNumber ? "ring-2 ring-red-500/40" : undefined,
                    )}
                    placeholder="1234567890"
                    type="text"
                    aria-invalid={Boolean(errors.idNumber)}
                  />
                </div>
                {errors.idNumber?.message ? (
                  <p className="text-sm text-red-500">
                    {errors.idNumber.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("step2.birthDateLabel")}
                </label>
                <div className="relative">
                  <input
                    {...register("birthDate")}
                    className={joinClassNames(
                      inputBaseNoIcon,
                      errors.birthDate ? "ring-2 ring-red-500/40" : undefined,
                    )}
                    type="date"
                    aria-invalid={Boolean(errors.birthDate)}
                  />
                </div>
                {errors.birthDate?.message ? (
                  <p className="text-sm text-red-500">
                    {errors.birthDate.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("step2.nationalityLabel")}
                </label>
                <div className="relative">
                  <span className="absolute right-3 inset-y-0 flex items-center text-gray-400 pointer-events-none">
                    <MdPublic className="text-lg" aria-hidden />
                  </span>
                  <select
                    {...register("nationality")}
                    className={joinClassNames(
                      "w-full pr-10 pl-10 py-3 bg-input-fill dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-[#332e25] focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-900 dark:text-white transition-all appearance-none cursor-pointer",
                      errors.nationality ? "ring-2 ring-red-500/40" : undefined,
                    )}
                    aria-invalid={Boolean(errors.nationality)}
                  >
                    <option value="">{t("step2.nationalityPlaceholder")}</option>
                    {NATIONALITY_KEYS.map((key) => (
                      <option key={key} value={t(`nationalities.${key}`)}>
                        {t(`nationalities.${key}`)}
                      </option>
                    ))}
                  </select>
                  <span className="absolute left-3 inset-y-0 flex items-center text-gray-400 pointer-events-none">
                    <MdExpandMore className="text-lg" aria-hidden />
                  </span>
                </div>
                {errors.nationality?.message ? (
                  <p className="text-sm text-red-500">
                    {errors.nationality.message}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full" />
              {t("step2.attachments")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group relative">
                <label className="block w-full cursor-pointer">
                  <input
                    className="hidden"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setIdFile(f);
                      setDocsError(null);
                    }}
                  />
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all group-hover:border-primary/50 group-hover:bg-primary/5 bg-white dark:bg-gray-800">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 group-hover:text-primary mb-3 transition-colors">
                      <MdCloudUpload className="text-2xl" aria-hidden />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">
                      {t("step2.idPhoto")}
                    </span>
                    <span className="text-xs text-gray-400">
                      {t("step2.idPhotoHint")}
                    </span>
                    {idFile ? (
                      <span className="mt-2 text-xs text-primary truncate max-w-full">
                        {idFile.name}
                      </span>
                    ) : null}
                  </div>
                </label>
              </div>

              <div className="group relative">
                <label className="block w-full cursor-pointer">
                  <input
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setPersonalPhoto(f);
                      setDocsError(null);
                    }}
                  />
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all group-hover:border-primary/50 group-hover:bg-primary/5 bg-white dark:bg-gray-800">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 group-hover:text-primary mb-3 transition-colors">
                      <MdAddAPhoto className="text-2xl" aria-hidden />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">
                      {t("step2.personalPhoto")}
                    </span>
                    <span className="text-xs text-gray-400">
                      {t("step2.personalPhotoHint")}
                    </span>
                    {personalPhoto ? (
                      <span className="mt-2 text-xs text-primary truncate max-w-full">
                        {personalPhoto.name}
                      </span>
                    ) : null}
                  </div>
                </label>
              </div>
            </div>

            {docsError ? (
              <p className="mt-3 text-sm text-red-500">{docsError}</p>
            ) : null}
          </div>
        </motion.div>
      ) : step === 3 ? (
        <motion.div
          key="step-3"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="space-y-5"
        >
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {t("step3.title")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={joinClassNames(
                "relative flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all",
                paymentMethod === "card"
                  ? "border-2 border-primary bg-primary/5"
                  : "border border-gray-200 dark:border-[#332e25] hover:bg-gray-50 dark:hover:bg-[#221d14]",
              )}
            >
              <input
                type="radio"
                checked={paymentMethod === "card"}
                onChange={() => {
                  setPaymentMethod("card");
                  setPaymentErrors((s) => ({
                    ...s,
                    method: undefined,
                    receipt: undefined,
                  }));
                }}
                className="size-4 text-primary focus:ring-primary"
              />
              <span className="font-bold text-gray-900 dark:text-white">
                {tStep3("methods.card.title")}
              </span>
            </label>

            <label
              className={joinClassNames(
                "relative flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all",
                paymentMethod === "bank"
                  ? "border-2 border-primary bg-primary/5"
                  : "border border-gray-200 dark:border-[#332e25] hover:bg-gray-50 dark:hover:bg-[#221d14]",
              )}
            >
              <input
                type="radio"
                checked={paymentMethod === "bank"}
                onChange={() => {
                  setPaymentMethod("bank");
                  setPaymentErrors((s) => ({
                    ...s,
                    method: undefined,
                    cardholder: undefined,
                    cardNumber: undefined,
                    expiry: undefined,
                    cvc: undefined,
                  }));
                }}
                className="size-4 text-primary focus:ring-primary"
              />
              <span className="font-bold text-gray-900 dark:text-white">
                {tStep3("methods.bank.title")}
              </span>
            </label>
          </div>

          {paymentErrors.method ? (
            <p className="text-sm text-red-500">{paymentErrors.method}</p>
          ) : null}

          {paymentMethod === "card" ? (
            <div className="rounded-2xl border border-gray-100 dark:border-[#332e25] bg-background-light/60 dark:bg-background-dark/40 p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="sm:col-span-2 space-y-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {tStep3("card.fields.cardholder.label")}
                  </span>
                  <input
                    value={cardData.cardholder}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCardData((s) => ({ ...s, cardholder: v }));
                      setPaymentErrors((s) => ({
                        ...s,
                        cardholder: undefined,
                      }));
                    }}
                    className={joinClassNames(
                      "w-full rounded-xl border bg-background-light dark:bg-background-dark px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary",
                      paymentErrors.cardholder
                        ? "border-red-400 dark:border-red-500 focus:ring-red-500/30 focus:border-red-500"
                        : "border-gray-200 dark:border-[#332e25]",
                    )}
                    type="text"
                    aria-invalid={Boolean(paymentErrors.cardholder)}
                  />
                  {paymentErrors.cardholder ? (
                    <p className="text-sm text-red-500">
                      {paymentErrors.cardholder}
                    </p>
                  ) : null}
                </label>

                <label className="sm:col-span-2 space-y-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {tStep3("card.fields.cardNumber.label")}
                  </span>
                  <input
                    dir="ltr"
                    value={cardData.cardNumber}
                    onChange={(e) => {
                      const v = formatCardNumber(e.target.value);
                      setCardData((s) => ({ ...s, cardNumber: v }));
                      setPaymentErrors((s) => ({
                        ...s,
                        cardNumber: undefined,
                      }));
                    }}
                    className={joinClassNames(
                      "w-full rounded-xl border bg-background-light dark:bg-background-dark px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary",
                      paymentErrors.cardNumber
                        ? "border-red-400 dark:border-red-500 focus:ring-red-500/30 focus:border-red-500"
                        : "border-gray-200 dark:border-[#332e25]",
                    )}
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="0000 0000 0000 0000"
                    aria-invalid={Boolean(paymentErrors.cardNumber)}
                  />
                  {paymentErrors.cardNumber ? (
                    <p className="text-sm text-red-500">
                      {paymentErrors.cardNumber}
                    </p>
                  ) : null}
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {tStep3("card.fields.expiry.label")}
                  </span>
                  <input
                    dir="ltr"
                    value={cardData.expiry}
                    onChange={(e) => {
                      const v = formatExpiry(e.target.value);
                      setCardData((s) => ({ ...s, expiry: v }));
                      setPaymentErrors((s) => ({ ...s, expiry: undefined }));
                    }}
                    className={joinClassNames(
                      "w-full rounded-xl border bg-background-light dark:bg-background-dark px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary",
                      paymentErrors.expiry
                        ? "border-red-400 dark:border-red-500 focus:ring-red-500/30 focus:border-red-500"
                        : "border-gray-200 dark:border-[#332e25]",
                    )}
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    aria-invalid={Boolean(paymentErrors.expiry)}
                  />
                  {paymentErrors.expiry ? (
                    <p className="text-sm text-red-500">
                      {paymentErrors.expiry}
                    </p>
                  ) : null}
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    CVC
                  </span>
                  <input
                    dir="ltr"
                    value={cardData.cvc}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D+/g, "").slice(0, 4);
                      setCardData((s) => ({ ...s, cvc: v }));
                      setPaymentErrors((s) => ({ ...s, cvc: undefined }));
                    }}
                    className={joinClassNames(
                      "w-full rounded-xl border bg-background-light dark:bg-background-dark px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary",
                      paymentErrors.cvc
                        ? "border-red-400 dark:border-red-500 focus:ring-red-500/30 focus:border-red-500"
                        : "border-gray-200 dark:border-[#332e25]",
                    )}
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="123"
                    aria-invalid={Boolean(paymentErrors.cvc)}
                  />
                  {paymentErrors.cvc ? (
                    <p className="text-sm text-red-500">{paymentErrors.cvc}</p>
                  ) : null}
                </label>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-100 dark:border-[#332e25] bg-background-light/60 dark:bg-background-dark/40 p-5 space-y-3">
              <label className="space-y-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {t("step3.uploadReceipt")}
                </span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setBankReceipt(f);
                    setPaymentErrors((s) => ({ ...s, receipt: undefined }));
                  }}
                  className={joinClassNames(
                    "w-full rounded-xl border bg-background-light dark:bg-background-dark px-4 py-3 text-gray-900 dark:text-white",
                    paymentErrors.receipt
                      ? "border-red-400 dark:border-red-500"
                      : "border-gray-200 dark:border-[#332e25]",
                  )}
                />
                {paymentErrors.receipt ? (
                  <p className="text-sm text-red-500">
                    {paymentErrors.receipt}
                  </p>
                ) : null}
                {bankReceipt ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("step3.fileChosen", { name: bankReceipt.name })}
                  </p>
                ) : null}
              </label>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="step-4"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
              {t("step4.title")}
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between border-b border-primary/10 pb-2">
                <span className="text-gray-500">{t("step4.permitType")}</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {getPermitLabel(t, permitType)}
                </span>
              </div>

              <div className="flex justify-between border-b border-primary/10 pb-2">
                <span className="text-gray-500">{t("step4.fullName")}</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {watch("fullName") || "—"}
                </span>
              </div>

              <div className="flex justify-between border-b border-primary/10 pb-2">
                <span className="text-gray-500">{t("step4.idNumber")}</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {watch("idNumber") || "—"}
                </span>
              </div>

              <div className="flex justify-between border-b border-primary/10 pb-2">
                <span className="text-gray-500">{t("step4.phone")}</span>
                <span
                  className="font-bold text-gray-900 dark:text-white"
                  dir="ltr"
                >
                  {(() => {
                    const dial =
                      countryOptions.find(
                        (c) => c.value === watch("phoneCountry"),
                      )?.dial ?? "";
                    const digits = String(watch("phone") ?? "").replace(
                      /\s+/g,
                      "",
                    );
                    return dial && digits ? `${dial}${digits}` : "—";
                  })()}
                </span>
              </div>

              <div className="flex justify-between border-b border-primary/10 pb-2">
                <span className="text-gray-500">{t("step4.country")}</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {(() => {
                    const value = watch("country");
                    const label = countryOptions.find(
                      (c) => c.value === value,
                    )?.label;
                    return label ?? "—";
                  })()}
                </span>
              </div>

              <div className="flex justify-between border-b border-primary/10 pb-2">
                <span className="text-gray-500">{t("step4.email")}</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {watch("email") || "—"}
                </span>
              </div>

              <div className="flex justify-between border-b border-primary/10 pb-2">
                <span className="text-gray-500">{t("step4.nationality")}</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {watch("nationality") || "—"}
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <span className="text-gray-500">{t("step4.documents")}</span>
                <span className="font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                  <MdCheck className="text-sm" aria-hidden />
                  {t("step4.documentsComplete")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300">
            <MdInfo className="text-primary mt-0.5" aria-hidden />
            <p>{t("step4.disclaimer")}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <AnimatedModal
      open={open}
      onOpenChange={(nextOpen, reason) => {
        if (!nextOpen && !canClose) return;
        onOpenChange(nextOpen, reason);
      }}
      size="xl"
      showCloseButton={false}
      closeOnBackdropClick={canClose}
      closeOnEscape={canClose}
      panelClassName="max-w-4xl rounded-3xl border border-primary/10 bg-surface-light dark:bg-surface-dark"
      bodyClassName="px-0 pb-0"
      {...modalProps}
    >
      <main className="w-full flex flex-col max-h-[90vh]">
        <header className="flex items-start sm:items-center justify-between gap-4 p-4 sm:p-6 pb-3 sm:pb-4 border-b border-gray-100 dark:border-gray-700/50">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white leading-snug break-words sm:truncate">
              {t("title")}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
              {t("description")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false, "closeButton")}
            disabled={!canClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400 disabled:opacity-50"
            aria-label={tCommon("closeModal")}
          >
            <MdClose className="text-2xl" aria-hidden />
          </button>
        </header>

        <div className="px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex items-center w-full">
            {steps.map((s, idx) => {
              const isActive = s.n <= step;
              const isCurrent = s.n === step;
              const isDone = s.n < step;

              return (
                <React.Fragment key={s.n}>
                  <div
                    className={joinClassNames(
                      "shrink-0 flex flex-col items-center gap-1 sm:gap-2 group",
                      s.n < step ? "cursor-pointer" : "cursor-default",
                      !isActive ? "opacity-50" : undefined,
                    )}
                    onClick={() => {
                      if (!canClose) return;
                      if (s.n < step) setStep(s.n);
                    }}
                    role={s.n < step ? "button" : undefined}
                    tabIndex={s.n < step ? 0 : -1}
                    onKeyDown={(e) => {
                      if (!canClose) return;
                      if (s.n >= step) return;
                      if (e.key === "Enter" || e.key === " ") setStep(s.n);
                    }}
                  >
                    <div
                      className={joinClassNames(
                        "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ring-2 sm:ring-4 ring-white dark:ring-surface-dark z-10 transition-transform",
                        isActive
                          ? "bg-primary text-white shadow-lg shadow-primary/30"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400",
                        isCurrent ? "group-hover:scale-105" : undefined,
                      )}
                    >
                      <span className="text-base sm:text-lg" aria-hidden>
                        {s.icon}
                      </span>
                    </div>

                    <span
                      className={joinClassNames(
                        "hidden sm:block text-xs font-bold text-center leading-tight",
                        isActive
                          ? "text-primary"
                          : "text-gray-500 dark:text-gray-400",
                      )}
                    >
                      {s.label}
                    </span>
                  </div>

                  {idx < steps.length - 1 ? (
                    <div className="flex-1 mx-2 sm:mx-4" aria-hidden>
                      <div
                        className={joinClassNames(
                          "h-0.5 rounded-full transition-colors",
                          isDone
                            ? "bg-primary"
                            : "bg-gray-200 dark:bg-gray-700",
                        )}
                      />
                    </div>
                  ) : null}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <form
          id={formId}
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="flex-1 overflow-y-auto px-8 py-4"
        >
          {stepPanel}
        </form>

        <footer className="p-6 border-t border-gray-100 dark:border-gray-700/50 bg-surface-light dark:bg-surface-dark rounded-b-3xl">
          {submitError ? (
            <p className="mb-3 text-sm text-red-500">{submitError}</p>
          ) : null}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={
                step === 1 ? () => onOpenChange(false, "programmatic") : goBack
              }
              disabled={!canClose}
              className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 group disabled:opacity-75"
            >
              <MdArrowForward
                className="text-lg group-hover:-translate-x-1 transition-transform ltr:rotate-180"
                aria-hidden
              />
              {step === 1 ? t("actions.cancel") : t("actions.back")}
            </button>

            {step === 4 ? (
              <button
                type="button"
                onClick={() => submitRequest()}
                disabled={!canClose}
                className="px-8 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40 flex items-center gap-2 group transform active:scale-95 disabled:opacity-75"
              >
                {t("actions.submit")}
                <MdArrowBack
                  className="text-lg group-hover:translate-x-[-4px] transition-transform ltr:rotate-180"
                  aria-hidden
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => goNext()}
                disabled={!canClose}
                className="px-8 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40 flex items-center gap-2 group transform active:scale-95 disabled:opacity-75"
              >
                {t("actions.next")}
                <MdArrowBack
                  className="text-lg group-hover:translate-x-[-4px] transition-transform ltr:rotate-180"
                  aria-hidden
                />
              </button>
            )}
          </div>
        </footer>
      </main>
    </AnimatedModal>
  );
}
