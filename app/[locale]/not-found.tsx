import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { MdOutlineLightbulb } from "react-icons/md";
import {
  RiBookOpenLine,
  RiCustomerService2Line,
  RiHome5Line,
} from "react-icons/ri";

import styles from "./not-found.module.css";

export default async function NotFoundPage() {
  const t = await getTranslations("notFound");

  return (
    <main
      className={
        "relative overflow-hidden bg-background text-text-main selection:bg-primary selection:text-white"
      }
    >
      <div
        className={
          "relative flex min-h-[70vh] items-center justify-center px-4 py-10 sm:px-6"
        }
      >
        <div className={styles.architecturalBg} aria-hidden="true" />

        <div
          className={`${styles.arabesqueCorner} ${styles.cornerTl} ${styles.fadeInUp}`}
          style={{ animationDelay: "0.2s" }}
          aria-hidden="true"
        />
        <div
          className={`${styles.arabesqueCorner} ${styles.cornerTr} ${styles.fadeInUp}`}
          style={{ animationDelay: "0.3s" }}
          aria-hidden="true"
        />
        <div
          className={`${styles.arabesqueCorner} ${styles.cornerBl} ${styles.fadeInUp}`}
          style={{ animationDelay: "0.4s" }}
          aria-hidden="true"
        />
        <div
          className={`${styles.arabesqueCorner} ${styles.cornerBr} ${styles.fadeInUp}`}
          style={{ animationDelay: "0.5s" }}
          aria-hidden="true"
        />

        <section
          className={`relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl p-8 text-center sm:p-12 ${styles.cleanCard} ${styles.fadeInUp}`}
          aria-labelledby="not-found-title"
        >
          <div
            className="absolute left-1/2 top-0 h-1 w-1/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/40 to-transparent"
            aria-hidden="true"
          />

          <div
            className={`mb-8 flex justify-center ${styles.float}`}
            aria-hidden="true"
          >
            <div className="relative flex size-28 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" />
              <MdOutlineLightbulb className="text-[5rem] font-light text-primary" />
            </div>
          </div>

          <div className="relative mb-10 space-y-3">
            <h1
              className={`font-numbers text-8xl font-black tracking-tighter leading-none opacity-90 md:text-9xl ${styles.goldTextGradient}`}
            >
              404
            </h1>
            <h2
              id="not-found-title"
              className="mt-2 font-display text-3xl font-bold text-gray-800 md:text-4xl"
            >
              {t("title")}
            </h2>
            <p className="mx-auto mt-4 max-w-md font-serif text-lg font-normal leading-relaxed text-gray-500">
              {t("description")}
            </p>
          </div>

          <div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 px-8 font-bold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-primary/40 sm:w-auto ${styles.btnGoldShimmer}`}
            >
              <RiHome5Line className="text-xl" />
              <span>{t("homeCta")}</span>
            </Link>

            <Link
              href="/FAQ"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3.5 px-8 font-medium text-gray-700 shadow-sm transition-all duration-300 hover:border-primary/40 hover:bg-gray-50 hover:text-primary hover:shadow-md sm:w-auto"
            >
              <RiBookOpenLine className="text-xl text-gray-400 transition-colors group-hover:text-primary" />
              <span>{t("guideCta")}</span>
            </Link>
          </div>

          <div className="mt-10 flex items-center justify-center border-t border-gray-100 pt-6">
            <Link
              href="/contact-us"
              className="group inline-flex items-center gap-2 text-sm text-gray-400 transition-colors duration-300 hover:text-primary"
            >
              <RiCustomerService2Line className="text-lg transition-colors group-hover:text-primary/80" />
              <span className="border-b border-transparent group-hover:border-primary/50">
                {t("helpCenter")}
              </span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
