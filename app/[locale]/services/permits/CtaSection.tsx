"use client";

import { Link } from "@/i18n/navigation";
import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";

import PermitsRequestModal from "./PermitsRequestModal";
import { useQuery } from "@tanstack/react-query";
import {
  type PermitRequestT,
  GetPermitResT,
  getPermits,
} from "@/app/api/permit";

export default function CtaSection({
  initialPermits,
  requestedPermit,
}: {
  initialPermits: GetPermitResT;
  requestedPermit?: PermitRequestT | null;
}) {
  const t = useTranslations("permits.cta");
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const { data: permitRes } = useQuery({
    queryKey: ["permit"],
    queryFn: getPermits,
    initialData: initialPermits,
    staleTime: 1000 * 60,
  });

  return (
    <section className="py-20 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          {t("title")}
        </h2>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
          {t("description")}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            type="button"
            ref={buttonRef}
            onClick={() => setOpen(true)}
            className="bg-primary hover:bg-primary-dark text-white text-lg font-bold py-4 px-10 rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>{t("request")}</span>
            <span
              className="material-symbols-outlined rtl:rotate-180"
              aria-hidden
            >
              arrow_forward
            </span>
          </button>

          <Link
            href="/contact-us"
            className="bg-white dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-lg font-medium py-4 px-10 rounded-xl transition flex items-center justify-center"
          >
            {t("support")}
          </Link>
        </div>
      </div>

      <PermitsRequestModal
        open={open}
        onOpenChange={(nextOpen) => setOpen(nextOpen)}
        permits={permitRes}
        prefillRequest={requestedPermit}
        onComplete={(payload) => console.log("permits request:", payload)}
        modalProps={{ finalFocusRef: buttonRef }}
      />
    </section>
  );
}
