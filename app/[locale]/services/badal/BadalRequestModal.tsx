"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { z } from "zod";
import {
  createPaymentSchema,
  isValidISODate,
} from "@/lib/validation/modalSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";

import AnimatedModal, {
  type AnimatedModalProps,
  type ModalCloseReason,
} from "@/app/components/ui/AnimatedModal";

import {
  editBadelRequest,
  getBadelsWithToken,
  postBadelRequest,
  type BadelPayload,
  type BadelRequestCustomerT,
} from "@/app/api/badel";

import { getApiErrorMessage, upsertApiRequest } from "@/app/api/base";

import { formatCardNumber, formatExpiry, formatFileSize } from "@/lib/utils";

export type BadalServiceType = "umrah" | "hajj";

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

function createCustomerSchema(t: (key: string) => string) {
  const allowed = COUNTRY_OPTIONS.map((c) => c.value) as string[];
  return z.object({
    fullName: z.string().trim().min(1, t("validation.fullNameRequired")),
    phoneCountry: z
      .string()
      .trim()
      .min(1, t("validation.phoneCountryRequired"))
      .refine(
        (v) => allowed.includes(v),
        t("validation.phoneCountryRequired"),
      ),
    phone: z
      .string()
      .trim()
      .min(1, t("validation.phoneRequired"))
      .transform((value) => value.replace(/\s+/g, ""))
      .refine((value) => /^\d{8,12}$/.test(value), t("validation.phoneInvalid")),
    country: z
      .string()
      .trim()
      .min(1, t("validation.countryRequired"))
      .refine((v) => allowed.includes(v), t("validation.countryRequired")),
    email: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine(
        (v) => v == null || v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        t("validation.emailInvalid"),
      ),
    birthDate: z
      .string()
      .trim()
      .min(1, t("validation.birthDateRequired"))
      .refine((v) => isValidISODate(v), t("validation.birthDateInvalid")),
    performedHajjOrUmrahBefore: z
      .string()
      .trim()
      .min(1, t("validation.performedHajjOrUmrahBeforeRequired"))
      .refine(
        (v) => v === "yes" || v === "no",
        t("validation.performedHajjOrUmrahBeforeRequired"),
      ),
  });
}

type CustomerFormValues = z.infer<ReturnType<typeof createCustomerSchema>>;

export type BadalPrefillCustomer = Partial<
  Pick<
    BadelRequestCustomerT,
    "name" | "phone" | "country" | "email" | "dob" | "performed_hajj"
  >
>;

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

type PaymentValues = z.infer<ReturnType<typeof createPaymentSchema>>;

export type BadalRequestPayload = {
  serviceType: BadalServiceType;
  customer: {
    name: string;
    phone: string;
    email?: string;
    country?: string;
    dob?: string;
    performed_hajj?: boolean;
    phone_country?: string;
  };
  payment: PaymentValues;
};

export type BadalRequestModalProps = {
  open: boolean;
  onOpenChange: (open: boolean, reason: ModalCloseReason) => void;
  serviceType: BadalServiceType;

  prefillCustomer?: BadalPrefillCustomer;

  onComplete?: (payload: BadalRequestPayload) => void | Promise<void>;

  modalProps?: Omit<
    AnimatedModalProps,
    "open" | "onOpenChange" | "children" | "title" | "description"
  >;
};

function getCountryLabel(
  t: (key: string) => string,
  value: CountryValue,
): string {
  if (value === "sa") return t("options.phoneCountries.sa");
  return t(`options.countries.${value}`);
}

function getServiceTitle(
  t: (key: string) => string,
  serviceType: BadalServiceType,
) {
  return serviceType === "umrah" ? t("requestUmrah") : t("requestHajj");
}

function joinClassNames(...values: Array<string | undefined | false | null>) {
  return values.filter(Boolean).join(" ");
}

const DEFAULT_CUSTOMER_FORM_VALUES: CustomerFormValues = {
  fullName: "",
  phoneCountry: "sa",
  phone: "",
  country: "sa",
  email: "",
  birthDate: "",
  performedHajjOrUmrahBefore: "",
};

function toISODateOnly(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const match = /^\d{4}-\d{2}-\d{2}/.exec(trimmed);
  return match ? match[0] : "";
}

function buildPrefilledCustomerValues(
  customer?: BadalPrefillCustomer,
): CustomerFormValues {
  const next: CustomerFormValues = { ...DEFAULT_CUSTOMER_FORM_VALUES };
  if (!customer) return next;

  if (typeof customer.name === "string") next.fullName = customer.name;
  if (typeof customer.email === "string") next.email = customer.email;
  if (typeof customer.dob === "string")
    next.birthDate = toISODateOnly(customer.dob);
  if (typeof customer.performed_hajj === "boolean") {
    next.performedHajjOrUmrahBefore = customer.performed_hajj ? "yes" : "no";
  }

  if (typeof customer.country === "string") {
    const found = COUNTRY_OPTIONS.find((c) => c.value === customer.country);
    if (found) next.country = found.value;
  }

  if (typeof customer.phone === "string") {
    const raw = customer.phone.trim().replace(/\s+/g, "");
    const parsed = COUNTRY_OPTIONS.map((c) => ({
      value: c.value,
      dial: c.dial,
      dialDigits: c.dial.replace(/^\+/, ""),
    })).find((c) => raw.startsWith(c.dial) || raw.startsWith(c.dialDigits));

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

export default function BadalRequestModal({
  open,
  onOpenChange,
  serviceType,
  prefillCustomer,
  onComplete,
  modalProps,
}: BadalRequestModalProps) {
  const t = useTranslations("badal.modal");
  const tStep2 = useTranslations("cart.step2");
  const tStep3 = useTranslations("cart.step3");
  const formId = useId();
  const [step, setStep] = useState<1 | 2>(1);
  const [hasExistingRequest, setHasExistingRequest] = useState(
    () => Boolean(prefillCustomer),
  );

  const customerSchema = useMemo(
    () => createCustomerSchema(tStep2),
    [tStep2],
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
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: DEFAULT_CUSTOMER_FORM_VALUES,
    mode: "onSubmit",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardData, setCardData] = useState<CardData>({
    cardholder: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });
  const [bankReceipt, setBankReceipt] = useState<File | null>(null);
  const [paymentErrors, setPaymentErrors] = useState<PaymentErrors>({});

  const [isSending, setIsSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const phoneCountry = watch("phoneCountry");
  const selectedPhoneDial =
    countryOptions.find((c) => c.value === phoneCountry)?.dial ?? "";

  useEffect(() => {
    if (open) return;
    setStep(1);
    reset();
    setPaymentMethod("card");
    setCardData({ cardholder: "", cardNumber: "", expiry: "", cvc: "" });
    setBankReceipt(null);
    setPaymentErrors({});
    setIsSending(false);
    setSubmitError(null);
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function prefillFromRequest() {
      // Priority 1: server-provided customer (if present).
      if (prefillCustomer) {
        setHasExistingRequest(true);
        reset(buildPrefilledCustomerValues(prefillCustomer));
        return;
      }

      // Priority 2: fetch by token (covers cases where token was created in-session
      // without a full page reload).
      try {
        const req = await getBadelsWithToken();
        if (cancelled) return;
        setHasExistingRequest(Boolean(req?.id));
        reset(buildPrefilledCustomerValues(req?.customer));
      } catch {
        if (!cancelled) setHasExistingRequest(false);
      }
    }

    prefillFromRequest();
    return () => {
      cancelled = true;
    };
  }, [open, prefillCustomer, reset]);

  const inputBase =
    "w-full rounded-xl border bg-background-light dark:bg-background-dark px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary";

  const inputBorderOk = "border-gray-200 dark:border-[#332e25]";
  const inputBorderErr =
    "border-red-400 dark:border-red-500 focus:ring-red-500/30 focus:border-red-500";

  const stepTitle = step === 1 ? t("beneficiaryData") : t("payment");

  const canClose = !(isSubmitting || isSending);

  async function saveAndGoToStep2(customerValues: CustomerFormValues) {
    setSubmitError(null);

    const onBehalfType: BadelPayload["on_behalf_type"] =
      serviceType === "hajj" ? "OnBehalfHajj" : "OnBehalfUmrah";

    const dial =
      countryOptions.find((c) => c.value === customerValues.phoneCountry)
        ?.dial ?? "";
    const phone = `${dial}${customerValues.phone.replace(/\s+/g, "")}`;

    const apiPayload: BadelPayload = {
      on_behalf_type: onBehalfType,
      customer: {
        name: customerValues.fullName,
        phone,
        email:
          customerValues.email && customerValues.email !== ""
            ? customerValues.email
            : undefined,
        country: customerValues.country,
        dob: customerValues.birthDate,
        performed_hajj: customerValues.performedHajjOrUmrahBefore === "yes",
      },
    };

    setIsSending(true);
    try {
      await upsertApiRequest({
        hasExistingRequest,
        update: () => editBadelRequest(apiPayload),
        create: () => postBadelRequest(apiPayload),
      });

      setStep(2);
    } catch (e) {
      setSubmitError(getApiErrorMessage(e));
    } finally {
      setIsSending(false);
    }
  }

  function validatePayment(): PaymentValues | null {
    const values: unknown =
      paymentMethod === "card"
        ? {
            method: paymentMethod,
            ...cardData,
          }
        : {
            method: paymentMethod,
            receipt: bankReceipt,
          };

    const result = paymentSchema.safeParse(values);
    if (result.success) {
      setPaymentErrors({});
      return result.data;
    }

    const nextErrors: PaymentErrors = {};
    for (const issue of result.error.issues) {
      const key = (issue.path[0] ?? "method") as keyof PaymentErrors;
      if (!nextErrors[key]) nextErrors[key] = issue.message;
    }
    setPaymentErrors(nextErrors);
    return null;
  }

  async function submitRequest(customerValues: CustomerFormValues) {
    setSubmitError(null);

    const paymentValues = validatePayment();
    if (!paymentValues) return;

    const dial =
      countryOptions.find((c) => c.value === customerValues.phoneCountry)
        ?.dial ?? "";
    const phone = `${dial}${customerValues.phone.replace(/\s+/g, "")}`;

    const uiPayload: BadalRequestPayload = {
      serviceType,
      customer: {
        name: customerValues.fullName,
        phone,
        email:
          customerValues.email && customerValues.email !== ""
            ? customerValues.email
            : undefined,
        country: customerValues.country,
        dob: customerValues.birthDate,
        performed_hajj: customerValues.performedHajjOrUmrahBefore === "yes",
        phone_country: customerValues.phoneCountry,
      },
      payment: paymentValues,
    };

    setIsSending(true);
    try {
      await onComplete?.(uiPayload);
      onOpenChange(false, "programmatic");
    } catch (e) {
      setSubmitError(getApiErrorMessage(e));
    } finally {
      setIsSending(false);
    }
  }

  const panel = (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="min-w-0">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("stepOf", { step, total: 2 })}
          </p>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
            {stepTitle}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={joinClassNames(
              "inline-flex items-center justify-center size-8 rounded-full text-sm font-bold",
              step === 1
                ? "bg-primary text-white"
                : "bg-primary/10 text-primary",
            )}
          >
            1
          </span>
          <span className="text-gray-300 dark:text-gray-700">—</span>
          <span
            className={joinClassNames(
              "inline-flex items-center justify-center size-8 rounded-full text-sm font-bold",
              step === 2
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500",
            )}
          >
            2
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {step === 1 ? (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <form id={formId} onSubmit={handleSubmit(saveAndGoToStep2)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="md:col-span-2 space-y-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {t("fullName")}
                  </span>
                  <input
                    {...register("fullName")}
                    className={joinClassNames(
                      inputBase,
                      errors.fullName ? inputBorderErr : inputBorderOk,
                    )}
                    type="text"
                    aria-invalid={Boolean(errors.fullName)}
                  />
                  {errors.fullName?.message ? (
                    <p className="text-sm text-red-500">
                      {errors.fullName.message}
                    </p>
                  ) : null}
                </label>

                <div className="space-y-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {t("phoneLabel")}
                  </span>

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
                        "shrink-0 inline-flex items-center justify-between rounded-l-xl border bg-background-light dark:bg-background-dark px-3 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary",
                        errors.phoneCountry ? inputBorderErr : inputBorderOk,
                      )}
                    />

                    <input
                      {...register("phone")}
                      className={joinClassNames(
                        "flex-1 min-w-0 w-0 rounded-r-xl border-t border-r border-b bg-background-light dark:bg-background-dark px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary",
                        errors.phone ? inputBorderErr : inputBorderOk,
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
                      {t("phoneFormat", { dial: selectedPhoneDial })}
                      {watch("phone").replace(/\s+/g, "")}
                    </p>
                  ) : null}
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {t("countryLabel")}
                  </span>
                  <CountryDropdown
                    value={watch("country") as CountryValue | ""}
                    onChange={(next) =>
                      setValue("country", next as CountryValue, {
                        shouldValidate: true,
                      })
                    }
                    options={countryOptions}
                    mode="country"
                    placeholder={t("countryPlaceholder")}
                    invalid={Boolean(errors.country)}
                    buttonClassName={joinClassNames(
                      inputBase,
                      "inline-flex items-center justify-between",
                      errors.country ? inputBorderErr : inputBorderOk,
                    )}
                  />
                  {errors.country?.message ? (
                    <p className="text-sm text-red-500">
                      {errors.country.message}
                    </p>
                  ) : null}
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {t("emailOptional")}
                  </span>
                  <input
                    {...register("email")}
                    className={joinClassNames(
                      inputBase,
                      errors.email ? inputBorderErr : inputBorderOk,
                    )}
                    type="email"
                    inputMode="email"
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email?.message ? (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  ) : null}
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {t("birthDateLabel")}
                  </span>
                  <input
                    {...register("birthDate")}
                    className={joinClassNames(
                      inputBase,
                      errors.birthDate ? inputBorderErr : inputBorderOk,
                    )}
                    type="date"
                    aria-invalid={Boolean(errors.birthDate)}
                  />
                  {errors.birthDate?.message ? (
                    <p className="text-sm text-red-500">
                      {errors.birthDate.message}
                    </p>
                  ) : null}
                </label>

                <div className="md:col-span-2 space-y-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {t("performedBefore")}
                  </span>

                  <div className="flex flex-wrap gap-3">
                    <label className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#332e25] bg-background-light dark:bg-background-dark px-4 py-3">
                      <input
                        type="radio"
                        value="yes"
                        {...register("performedHajjOrUmrahBefore")}
                        className="size-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {t("yes")}
                      </span>
                    </label>

                    <label className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#332e25] bg-background-light dark:bg-background-dark px-4 py-3">
                      <input
                        type="radio"
                        value="no"
                        {...register("performedHajjOrUmrahBefore")}
                        className="size-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {t("no")}
                      </span>
                    </label>
                  </div>

                  {errors.performedHajjOrUmrahBefore?.message ? (
                    <p className="text-sm text-red-500">
                      {errors.performedHajjOrUmrahBefore.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => onOpenChange(false, "programmatic")}
                  disabled={!canClose}
                  className="px-5 py-3 rounded-xl border border-gray-200 dark:border-[#332e25] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#221d14] transition-colors"
                >
                  {t("cancel")}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isSending}
                  className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
                >
                  {isSending ? t("saving") : t("next")}
                </button>
              </div>

              {submitError ? (
                <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                  {submitError}
                </p>
              ) : null}
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="space-y-4">
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
                          inputBase,
                          paymentErrors.cardholder
                            ? inputBorderErr
                            : inputBorderOk,
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
                          inputBase,
                          paymentErrors.cardNumber
                            ? inputBorderErr
                            : inputBorderOk,
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
                          setPaymentErrors((s) => ({
                            ...s,
                            expiry: undefined,
                          }));
                        }}
                        className={joinClassNames(
                          inputBase,
                          paymentErrors.expiry ? inputBorderErr : inputBorderOk,
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
                        {tStep3("card.fields.cvc.label")}
                      </span>
                      <input
                        dir="ltr"
                        value={cardData.cvc}
                        onChange={(e) => {
                          const v = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 4);
                          setCardData((s) => ({ ...s, cvc: v }));
                          setPaymentErrors((s) => ({ ...s, cvc: undefined }));
                        }}
                        className={joinClassNames(
                          inputBase,
                          paymentErrors.cvc ? inputBorderErr : inputBorderOk,
                        )}
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        placeholder="123"
                        aria-invalid={Boolean(paymentErrors.cvc)}
                      />
                      {paymentErrors.cvc ? (
                        <p className="text-sm text-red-500">
                          {paymentErrors.cvc}
                        </p>
                      ) : null}
                    </label>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-100 dark:border-[#332e25] bg-background-light/60 dark:bg-background-dark/40 p-5">
                  <label className="space-y-2 block">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {tStep3("bank.receipt.upload")}
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
                        inputBase,
                        "file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:px-4 file:py-2 file:text-sm file:font-bold",
                        paymentErrors.receipt ? inputBorderErr : inputBorderOk,
                      )}
                      aria-invalid={Boolean(paymentErrors.receipt)}
                    />
                    {bankReceipt ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {bankReceipt.name}
                        {bankReceipt.size
                          ? ` • ${formatFileSize(bankReceipt.size)}`
                          : ""}
                      </p>
                    ) : null}
                    {paymentErrors.receipt ? (
                      <p className="text-sm text-red-500">
                        {paymentErrors.receipt}
                      </p>
                    ) : null}
                  </label>
                </div>
              )}

              <div className="mt-8 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitError(null);
                    setStep(1);
                  }}
                  disabled={isSending}
                  className="px-5 py-3 rounded-xl border border-gray-200 dark:border-[#332e25] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#221d14] transition-colors"
                >
                  {t("back")}
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || isSending}
                  onClick={handleSubmit(submitRequest)}
                  className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
                >
                  {isSending
                    ? t("submitting")
                    : serviceType === "umrah"
                      ? t("confirmUmrah")
                      : t("confirmHajj")}
                </button>
              </div>

              {submitError ? (
                <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                  {submitError}
                </p>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <AnimatedModal
      open={open}
      onOpenChange={(nextOpen, reason) => {
        if (!nextOpen && !canClose) return;
        onOpenChange(nextOpen, reason);
      }}
      title={getServiceTitle(t, serviceType)}
      description={t("description")}
      size="lg"
      closeOnBackdropClick={canClose}
      closeOnEscape={canClose}
      showCloseButton={canClose}
      {...modalProps}
    >
      {panel}
    </AnimatedModal>
  );
}
