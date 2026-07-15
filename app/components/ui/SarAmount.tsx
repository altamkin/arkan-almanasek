"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import SaudiRiyalSymbol from "./SaudiRiyalSymbol";

type Props = {
  value: number;
  maximumFractionDigits?: number;
  className?: string;
  symbolClassName?: string;
};

export default function SarAmount({
  value,
  maximumFractionDigits = 2,
  className,
  symbolClassName,
}: Props) {
  const locale = useLocale();
  const tCommon = useTranslations("common");

  const formatted = useMemo(() => {
    try {
      return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(
        Number.isFinite(value) ? value : 0,
      );
    } catch {
      return String(value);
    }
  }, [locale, maximumFractionDigits, value]);

  return (
    <span className={className} dir="ltr">
      <span className="inline-flex items-baseline gap-1" dir="ltr">
        <span>{formatted}</span>
        <SaudiRiyalSymbol
          className={symbolClassName ?? "inline-block h-[0.9em] w-auto"}
          title={tCommon("sar")}
        />
      </span>
    </span>
  );
}
