"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { RiCheckLine, RiGlobalLine } from "react-icons/ri";
import { useTranslations } from "next-intl";

type Locale = "ar" | "en" | "id" | "tr" | "si" | "ms";

type Option = {
  locale: Locale;
  shortLabel: string;
  label: string;
  country: "sa" | "us" | "id" | "tr" | "si" | "my";
};

const OPTIONS: Option[] = [
  { locale: "ar", shortLabel: "AR", label: "العربية", country: "sa" },
  { locale: "en", shortLabel: "EN", label: "English", country: "us" },
  { locale: "id", shortLabel: "ID", label: "Bahasa Indonesia", country: "id" },
  { locale: "tr", shortLabel: "TR", label: "Türkçe", country: "tr" },
  { locale: "si", shortLabel: "SI", label: "සිංහල", country: "si" },
  { locale: "ms", shortLabel: "MS", label: "Bahasa Melayu", country: "my" },
];

function Flag({ country }: { country: Option["country"] }) {
  return (
    <span
      aria-hidden
      className={`fi fi-${country} inline-block size-4 shrink-0 overflow-hidden rounded-sm ring-1 ring-black/10`}
    />
  );
}

function toLocalePath(pathname: string, nextLocale: Locale) {
  const parts = pathname.split("/").filter(Boolean);

  // If the first segment is already a locale, replace it. Otherwise, prefix it.
  if (
    parts.length > 0 &&
    OPTIONS.some((o) => o.locale === (parts[0] as Locale))
  ) {
    parts[0] = nextLocale;
    return `/${parts.join("/")}`;
  }

  return `/${nextLocale}${pathname.startsWith("/") ? "" : "/"}${pathname}`;
}

export default function LanguageSwitcher() {
  const tCommon = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams<{ locale?: string }>();

  const currentLocale = useMemo(() => {
    const fromParams = params?.locale;
    if (fromParams && OPTIONS.some((o) => o.locale === fromParams)) {
      return fromParams as Locale;
    }
    return "ar";
  }, [params]);

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    function onPointerDown(e: MouseEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, []);

  function switchTo(locale: Locale) {
    const base = toLocalePath(pathname, locale);
    const qs = searchParams.toString();
    router.push(qs ? `${base}?${qs}` : base);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center rounded-full p-2 text-gray-600 cursor-pointer transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-background"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={tCommon("language")}
      >
        <RiGlobalLine className="text-lg" />
        {/* <Flag country={current.country} /> */}
        {/* <span className="hidden sm:inline">{current.shortLabel}</span> */}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute rtl:left-0 rtl:right-auto ltr:right-0 ltr:left-auto mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-[#1a2e1a]"
        >
          {OPTIONS.map((opt) => {
            const active = opt.locale === currentLocale;
            return (
              <button
                key={opt.locale}
                type="button"
                role="menuitem"
                onClick={() => switchTo(opt.locale)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors ${
                  active
                    ? "bg-gray-50 text-gray-900 dark:bg-[#233523] dark:text-white"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-[#233523]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Flag country={opt.country} />
                  <span className="flex flex-col leading-tight">
                    {/* <span className="font-semibold">{opt.shortLabel}</span> */}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {opt.label}
                    </span>
                  </span>
                </span>
                {active && (
                  <RiCheckLine className="text-lg text-secondary" aria-hidden />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
