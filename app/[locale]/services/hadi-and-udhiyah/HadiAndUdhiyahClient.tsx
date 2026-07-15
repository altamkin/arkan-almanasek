"use client";

import Breadcrumbs, { BreadcrumbItem } from "@/app/components/ui/Breadcrumbs";
import Step2CustomerInfo from "./Step2CustomerInfo";
import {
  editHadiRequest,
  getHadi,
  getHadiWithToken,
  postHadiRequest,
  type GetHadiResT,
  type HadiRequestCustomerT,
  type HadiRequestItemT,
  type HadiRequestT,
  type QurbaniPayload,
} from "@/app/api";
import { getApiErrorMessage, upsertApiRequest } from "@/app/api/base";
import type { Step2CustomerInfoValues } from "@/lib/validation";
import { ddmmyyyyFromISODate, isoDateFromDDMMYYYY } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MdAccountBalanceWallet,
  MdDescription,
  MdPets,
  MdSearch,
  MdVerified,
} from "react-icons/md";
import CartSummary from "./CartSummary";
import CheckoutReview from "./CheckoutReview";
import HeroHeader from "./HeroHeader";
import NoticeCard from "./NoticeCard";
import ServiceSelectionSection from "./ServiceSelectionSection";
import StepsStrip from "./StepsStrip";
import type { Item, Section } from "./types";
import { clampQty } from "./utils";
import Step3Payment, { PaymentSummary } from "./Step3Payment";
import SaudiRiyalSymbol from "@/app/components/ui/SaudiRiyalSymbol";

type Props = {
  initialHadi: GetHadiResT;
  requestedHadi?: HadiRequestT | null;
};

function toISODateOnly(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const match = /^\d{4}-\d{2}-\d{2}/.exec(trimmed);
  return match ? match[0] : "";
}

function buildStep2Prefill(
  customer?: HadiRequestCustomerT | null,
): Partial<Step2CustomerInfoValues> | undefined {
  if (!customer) return undefined;

  const prefill: Partial<Step2CustomerInfoValues> = {};
  if (typeof customer.name === "string") prefill.fullName = customer.name;
  if (typeof customer.email === "string") prefill.email = customer.email;
  if (typeof customer.performed_hajj === "boolean") {
    prefill.performedHajjOrUmrahBefore = customer.performed_hajj ? "yes" : "no";
  }

  if (typeof customer.dob === "string") {
    const iso = toISODateOnly(customer.dob);
    const ddmmyyyy = ddmmyyyyFromISODate(iso);
    if (ddmmyyyy) prefill.birthDate = ddmmyyyy;
  }

  if (typeof customer.country === "string") {
    // Step2 only allows id/ms/tr/lk.
    if (
      customer.country === "id" ||
      customer.country === "ms" ||
      customer.country === "tr" ||
      customer.country === "lk"
    ) {
      prefill.country = customer.country;
    }
  }

  if (typeof customer.phone === "string") {
    const raw = customer.phone.trim().replace(/\s+/g, "");
    const phoneOptions = [
      { value: "sa" as const, dial: "+966" },
      { value: "id" as const, dial: "+62" },
      { value: "ms" as const, dial: "+60" },
      { value: "tr" as const, dial: "+90" },
      { value: "lk" as const, dial: "+94" },
    ];

    const parsed = phoneOptions
      .map((c) => ({ ...c, dialDigits: c.dial.replace(/^\+/, "") }))
      .find((c) => raw.startsWith(c.dial) || raw.startsWith(c.dialDigits));

    if (parsed) {
      prefill.phoneCountry = parsed.value;
      const remainder = raw.startsWith(parsed.dial)
        ? raw.slice(parsed.dial.length)
        : raw.slice(parsed.dialDigits.length);
      prefill.phone = remainder.replace(/\D+/g, "");
    }
  }

  return prefill;
}

export default function HadiAndUdhiyahClient({
  initialHadi,
  requestedHadi,
}: Props) {
  const t = useTranslations("qurbani");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [customerInfo, setCustomerInfo] =
    useState<Step2CustomerInfoValues | null>(null);
  const [requestedCustomer, setRequestedCustomer] =
    useState<HadiRequestCustomerT | null>(
      () => requestedHadi?.customer ?? null,
    );
  const [requestedItems, setRequestedItems] = useState<
    HadiRequestItemT[] | null
  >(() => requestedHadi?.items ?? null);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(
    null,
  );

  const { data: hadiRes } = useQuery({
    queryKey: ["hadi"],
    queryFn: getHadi,
    initialData: initialHadi,
    staleTime: 1000 * 60,
  });

  const sections: Section[] = useMemo(() => {
    const hadi = hadiRes?.hadi ?? [];
    return hadi.map((h): Section => {
      const items: Item[] = (h.types ?? []).map((type) => ({
        id: String(type.id),
        label: type.name,
        classification: type.classefication ?? undefined,
        price: Number(type.price ?? 0),
      }));

      return {
        id: String(h.id),
        label: h.name,
        Icon: MdPets,
        items,
      };
    });
  }, [hadiRes]);

  const breadcrumbItems: BreadcrumbItem[] = useMemo(
    () => [
      { label: t("breadcrumbs.home"), href: "/" },
      { label: t("breadcrumbs.current"), current: true },
    ],
    [t],
  );

  const steps = useMemo(
    () => [
      {
        Icon: MdSearch,
        title: t("steps.selectType.title"),
        desc: t("steps.selectType.desc"),
      },
      {
        Icon: MdAccountBalanceWallet,
        title: t("steps.securePayment.title"),
        desc: t("steps.securePayment.desc"),
      },
      {
        Icon: MdVerified,
        title: t("steps.sharia.title"),
        desc: t("steps.sharia.desc"),
      },
      {
        Icon: MdDescription,
        title: t("steps.confirmation.title"),
        desc: t("steps.confirmation.desc"),
      },
    ],
    [t],
  );

  const formatNumber = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        maximumFractionDigits: 2,
      }),
    [locale],
  );

  const currencyMark = useMemo(
    () => (
      <SaudiRiyalSymbol className="inline-block h-[0.9em] w-auto" title={tCommon("sar")} />
    ),
    [],
  );

  const [selection, setSelection] = useState<
    Record<string, Record<string, number>>
  >(() => ({}));
  const [cart, setCart] = useState<Record<string, number>>({});
  const [committedSelection, setCommittedSelection] = useState<
    Record<string, Record<string, number>>
  >(() => ({}));
  const [checkoutAttempted, setCheckoutAttempted] = useState(false);
  const [customerInfoSubmitError, setCustomerInfoSubmitError] = useState<
    string | null
  >(null);
  const [isSavingCustomerInfo, setIsSavingCustomerInfo] = useState(false);

  const itemIndex = useMemo(() => {
    const index = new Map<string, { section: Section; item: Item }>();
    for (const section of sections) {
      for (const item of section.items) {
        index.set(`${section.id}:${item.id}`, { section, item });
      }
    }
    return index;
  }, [sections]);

  const typeIdToCartKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const [key, entry] of itemIndex.entries()) {
      if (!map.has(entry.item.id)) map.set(entry.item.id, key);
    }
    return map;
  }, [itemIndex]);

  const selectionTotals = useMemo(() => {
    const totals: Record<string, number> = {};

    for (const section of sections) {
      const perItem = selection[section.id] ?? {};
      let sum = 0;
      for (const item of section.items) {
        sum += (perItem[item.id] ?? 0) * item.price;
      }
      totals[section.id] = sum;
    }

    return totals;
  }, [selection, sections]);

  const cartLines = useMemo(() => {
    const lines: Array<{
      key: string;
      sectionLabel: string;
      itemLabel: string;
      qty: number;
      unitPrice: number;
      lineTotal: number;
    }> = [];

    for (const [key, qty] of Object.entries(cart)) {
      if (qty <= 0) continue;
      const entry = itemIndex.get(key);
      if (!entry) continue;
      const lineTotal = qty * entry.item.price;
      lines.push({
        key,
        sectionLabel: entry.section.label,
        itemLabel: entry.item.label,
        qty,
        unitPrice: entry.item.price,
        lineTotal,
      });
    }

    lines.sort((a, b) => a.sectionLabel.localeCompare(b.sectionLabel, locale));
    return lines;
  }, [cart, itemIndex, locale]);

  const subtotal = useMemo(
    () => cartLines.reduce((acc, line) => acc + line.lineTotal, 0),
    [cartLines],
  );
  const tax = useMemo(() => subtotal * 0.15, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  const outOfSyncSectionLabels = useMemo(() => {
    const labels: string[] = [];
    for (const section of sections) {
      const current = selection[section.id] ?? {};
      const committed = committedSelection[section.id] ?? {};

      let dirty = false;
      for (const item of section.items) {
        const currentQty = current[item.id] ?? 0;
        const committedQty = committed[item.id] ?? 0;
        if (currentQty !== committedQty) {
          dirty = true;
          break;
        }
      }

      if (dirty) labels.push(section.label);
    }
    return labels;
  }, [selection, committedSelection, sections]);

  const hasOutOfSyncSections = outOfSyncSectionLabels.length > 0;

  function updateSelectionQty(
    sectionId: string | number,
    itemId: string,
    delta: number,
  ) {
    setSelection((prev) => {
      const prevSection = prev[sectionId] ?? {};
      const prevQty = prevSection[itemId] ?? 0;
      const nextQty = clampQty(prevQty + delta);
      return {
        ...prev,
        [sectionId]: {
          ...prevSection,
          [itemId]: nextQty,
        },
      };
    });
  }

  function clearSection(sectionId: string | number) {
    setSelection((prev) => ({ ...prev, [sectionId]: {} }));
  }

  function commitSectionToCart(section: Section) {
    const current = selection[section.id] ?? {};

    setCart((prevCart) => {
      const next = { ...prevCart };

      for (const item of section.items) {
        const qty = clampQty(current[item.id] ?? 0);
        const key = `${section.id}:${item.id}`;
        if (qty <= 0) {
          delete next[key];
        } else {
          next[key] = qty;
        }
      }

      return next;
    });

    setCommittedSelection((prev) => {
      const nextSection: Record<string, number> = {};
      for (const item of section.items) {
        const qty = clampQty(current[item.id] ?? 0);
        if (qty > 0) nextSection[item.id] = qty;
      }
      return { ...prev, [section.id]: nextSection };
    });

    setCheckoutAttempted(false);
  }

  function clearCart() {
    setCart({});
    setCommittedSelection({});
    setCheckoutAttempted(false);
    setStep(1);
    setCustomerInfo(null);
    setPaymentSummary(null);
  }

  function proceedToCustomerInfo() {
    setCheckoutAttempted(true);
    if (hasOutOfSyncSections) return;
    if (cartLines.length === 0) return;
    setStep(2);
  }

  useEffect(() => {
    // If we already have it from the server, no need to fetch.
    if (requestedCustomer) return;
    let cancelled = false;

    (async () => {
      try {
        const req = await getHadiWithToken();
        if (cancelled) return;
        setRequestedCustomer(req?.customer ?? null);
        setRequestedItems(req?.items ?? null);
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [requestedCustomer]);

  const didPrefillItemsRef = useRef(false);

  useEffect(() => {
    if (didPrefillItemsRef.current) return;
    if (step !== 1) return;
    if (!requestedItems || requestedItems.length === 0) return;
    if (Object.keys(cart).length > 0) return;
    if (typeIdToCartKey.size === 0) return;

    const nextCart: Record<string, number> = {};

    for (const it of requestedItems) {
      const typeId = String(it?.id ?? it?.type_id ?? "");
      const key = typeIdToCartKey.get(typeId);
      if (!key) continue;

      const qtyRaw = Number(it?.quantity ?? 0);
      if (!Number.isFinite(qtyRaw) || qtyRaw <= 0) continue;

      const nextQty = clampQty((nextCart[key] ?? 0) + qtyRaw);
      if (nextQty <= 0) {
        delete nextCart[key];
      } else {
        nextCart[key] = nextQty;
      }
    }

    if (Object.keys(nextCart).length === 0) return;

    const nextSelection: Record<string, Record<string, number>> = {};
    const nextCommitted: Record<string, Record<string, number>> = {};

    for (const [key, qty] of Object.entries(nextCart)) {
      const [sectionId, itemId] = key.split(":");
      if (!sectionId || !itemId) continue;

      nextSelection[sectionId] = {
        ...(nextSelection[sectionId] ?? {}),
        [itemId]: qty,
      };
      nextCommitted[sectionId] = {
        ...(nextCommitted[sectionId] ?? {}),
        [itemId]: qty,
      };
    }

    setSelection(nextSelection);
    setCommittedSelection(nextCommitted);
    setCart(nextCart);
    setCheckoutAttempted(false);
    didPrefillItemsRef.current = true;
  }, [cart, requestedItems, step, typeIdToCartKey]);

  async function submitCustomerInfo(values: Step2CustomerInfoValues) {
    setCustomerInfo(values);
    setCustomerInfoSubmitError(null);
    setIsSavingCustomerInfo(true);

    const dialByCountry: Record<string, string> = {
      sa: "+966",
      id: "+62",
      ms: "+60",
      tr: "+90",
      lk: "+94",
    };

    const dial = dialByCountry[values.phoneCountry] ?? "";
    const phone = `${dial}${values.phone}`;

    const items: QurbaniPayload["items"] = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([key, qty]) => {
        const parts = key.split(":");
        const typeIdStr = parts[1] ?? "";
        const type_id = Number(typeIdStr);
        return {
          type_id,
          quantity: qty,
        };
      })
      .filter((it) => Number.isFinite(it.type_id) && it.type_id > 0);

    const payload: QurbaniPayload = {
      customer: {
        name: values.fullName,
        phone,
        email: values.email,
        country: values.country,
        dob: isoDateFromDDMMYYYY(values.birthDate),
        performed_hajj: values.performedHajjOrUmrahBefore === "yes",
      },
      items,
    };

    try {
      await upsertApiRequest({
        hasExistingRequest: Boolean(requestedHadi),
        update: () => editHadiRequest(payload),
        create: () => postHadiRequest(payload),
      });

      setStep(3);
    } catch (e) {
      setCustomerInfoSubmitError(getApiErrorMessage(e));
    } finally {
      setIsSavingCustomerInfo(false);
    }
  }

  function handleFinalCheckout() {
    // TODO: proceed to payment flow / API call.
  }

  return (
    <main className="text-[#111811] antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <Breadcrumbs
          items={breadcrumbItems}
          ariaLabel={t("breadcrumbs.ariaLabel")}
        />
      </div>

      <HeroHeader
        titlePrefix={t("hero.titlePrefix")}
        titleHighlight={t("hero.titleHighlight")}
        description={t("hero.description")}
      />

      <StepsStrip steps={steps} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            {step === 1 ? (
              <>
                <NoticeCard title={t("notice.title")} body={t("notice.body")} />

                {sections.map((section) => (
                  <ServiceSelectionSection
                    key={section.id}
                    section={section}
                    selectionTotal={selectionTotals[section.id] ?? 0}
                    selection={selection}
                    committedSelection={committedSelection}
                    formatNumber={formatNumber}
                    t={t}
                    currencyMark={currencyMark}
                    onClearSection={clearSection}
                    onCommitSection={commitSectionToCart}
                    onUpdateQty={updateSelectionQty}
                  />
                ))}
              </>
            ) : null}

            {step === 2 ? (
              <Step2CustomerInfo
                onBack={() => setStep(1)}
                onNext={submitCustomerInfo}
                initialValues={
                  customerInfo ??
                  buildStep2Prefill(requestedCustomer) ??
                  undefined
                }
                isSaving={isSavingCustomerInfo}
                submitError={customerInfoSubmitError}
              />
            ) : null}

            {step === 3 ? (
              <Step3Payment
                onBack={() => setStep(2)}
                onConfirm={(summary) => {
                  setPaymentSummary(summary);
                  setStep(4);
                }}
              />
            ) : null}

            {step === 4 && customerInfo && paymentSummary ? (
              <CheckoutReview
                cartLines={cartLines}
                formatNumber={formatNumber}
                subtotal={subtotal}
                tax={tax}
                total={total}
                customerInfo={customerInfo}
                payment={paymentSummary}
                onBack={() => setStep(3)}
                onConfirm={handleFinalCheckout}
              />
            ) : null}
          </div>

          <CartSummary
            cartLines={cartLines}
            formatNumber={formatNumber}
            subtotal={subtotal}
            tax={tax}
            total={total}
            checkoutAttempted={checkoutAttempted}
            hasOutOfSyncSections={hasOutOfSyncSections}
            outOfSyncSectionLabels={outOfSyncSectionLabels}
            checkoutLabel={t("cart.continue")}
            checkoutDisabled={cartLines.length === 0 || hasOutOfSyncSections}
            t={t}
            onClearCart={clearCart}
            onCheckout={proceedToCustomerInfo}
            showCheckoutButton={step === 1}
          />
        </div>
      </div>
    </main>
  );
}
