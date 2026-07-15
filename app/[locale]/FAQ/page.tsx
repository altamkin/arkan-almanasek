import { getTranslations } from "next-intl/server";
import {
  RiArrowDownSLine,
  RiBookOpenLine,
  RiCustomerService2Line,
  RiHeartLine,
  RiPhoneLine,
  RiQuestionLine,
  RiSearchLine,
  RiShieldCheckLine,
  RiStarLine,
} from "react-icons/ri";

export default async function FAQPage() {
  const t = await getTranslations("faq");

  return (
    <main className="flex-1 bg-background">
      <section className="relative overflow-hidden py-32 md:py-40">
        <div className="absolute inset-0 z-0 bg-[#fff2eb] dark:bg-[#1a1a1a]" />
        <div className="absolute inset-0 z-0 hero-pattern hero-animate opacity-60 dark:opacity-20 mix-blend-multiply dark:mix-blend-overlay" />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/60 via-transparent to-[#fff2eb]/90 dark:from-black/60 dark:to-[#111111]/90" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center gap-6 max-w-4xl mx-auto">
            <div className="mb-2">
              <RiStarLine
                className="text-4xl text-primary opacity-80"
                aria-hidden
              />
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight text-secondary dark:text-primary drop-shadow-sm bg-clip-text">
              {t("titlePrefix")}{" "}
              <span className="text-primary dark:text-white">
                {t("titleHighlight")}
              </span>
            </h1>

            <p className="text-lg md:text-2xl text-text-muted dark:text-gray-300 font-medium max-w-2xl bg-white/40 dark:bg-black/40 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-white/20">
              {t("description")}
            </p>

            <div className="w-full max-w-xl mt-8">
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-secondary">
                  <RiSearchLine className="text-2xl" aria-hidden />
                </div>
                <input
                  className="block w-full rounded-2xl border-none bg-white dark:bg-[#1f1f1f] py-5 pr-14 pl-4 text-text-main shadow-xl ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary transition-all text-lg placeholder:text-gray-400"
                  placeholder={t("searchPlaceholder")}
                  type="text"
                  aria-label={t("searchAria")}
                />
                <button
                  className="absolute inset-y-2 left-2 flex items-center justify-center rounded-xl bg-primary hover:bg-primary-dark px-8 text-base font-bold text-white transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95"
                  type="button"
                >
                  {t("searchButton")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-3">
          <button
            className="flex h-10 items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-dark px-6 text-sm font-bold text-white shadow-soft transition-colors"
            type="button"
          >
            {t("categories.all")}
          </button>
          <button
            className="flex h-10 items-center justify-center gap-2 rounded-full bg-surface-light dark:bg-[#1f1f1f] px-6 text-sm font-medium text-text-main dark:text-gray-300 border border-[#e6dccf] dark:border-gray-700 hover:border-primary hover:text-primary transition-all"
            type="button"
          >
            <RiBookOpenLine className="text-[18px]" aria-hidden />
            {t("categories.rituals")}
          </button>
          <button
            className="flex h-10 items-center justify-center gap-2 rounded-full bg-surface-light dark:bg-[#1f1f1f] px-6 text-sm font-medium text-text-main dark:text-gray-300 border border-[#e6dccf] dark:border-gray-700 hover:border-primary hover:text-primary transition-all"
            type="button"
          >
            <RiHeartLine className="text-[18px]" aria-hidden />
            {t("categories.qurbani")}
          </button>
          <button
            className="flex h-10 items-center justify-center gap-2 rounded-full bg-surface-light dark:bg-[#1f1f1f] px-6 text-sm font-medium text-text-main dark:text-gray-300 border border-[#e6dccf] dark:border-gray-700 hover:border-primary hover:text-primary transition-all"
            type="button"
          >
            <RiShieldCheckLine className="text-[18px]" aria-hidden />
            {t("categories.health")}
          </button>
          <button
            className="flex h-10 items-center justify-center gap-2 rounded-full bg-surface-light dark:bg-[#1f1f1f] px-6 text-sm font-medium text-text-main dark:text-gray-300 border border-[#e6dccf] dark:border-gray-700 hover:border-primary hover:text-primary transition-all"
            type="button"
          >
            <RiCustomerService2Line className="text-[18px]" aria-hidden />
            {t("categories.services")}
          </button>
        </div>
      </section>

      <section className="container mx-auto max-w-[960px] px-4 py-12">
        <div className="flex flex-col gap-4">
          <details
            className="group flex flex-col rounded-xl border border-[#e6dccf] dark:border-[#2a2a2a] bg-surface-light dark:bg-[#1f1f1f] shadow-soft transition-all duration-300 open:shadow-lg open:border-primary/30"
            open
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 list-none">
              <span className="text-lg font-bold text-text-main dark:text-white leading-tight group-hover:text-secondary transition-colors">
                {t("items.pillars.question")}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff2eb] dark:bg-white/5 text-secondary transition-transform duration-300 group-open:rotate-180">
                <RiArrowDownSLine className="text-2xl" aria-hidden />
              </div>
            </summary>
            <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
              <div className="h-px w-full bg-[#f3efe9] dark:bg-[#2a2a2a] mb-4" />
              <p className="text-text-muted dark:text-gray-300 leading-relaxed text-base">
                {t("items.pillars.intro")}
              </p>
              <ul className="mt-3 space-y-2 list-disc list-inside text-text-muted dark:text-gray-400 marker:text-primary">
                <li>
                  <strong>{t("items.pillars.ihram").split(":")[0]}:</strong>{" "}
                  {t("items.pillars.ihram").split(":").slice(1).join(":").trim()}
                </li>
                <li>
                  <strong>{t("items.pillars.arafah").split(":")[0]}:</strong>{" "}
                  {t("items.pillars.arafah").split(":").slice(1).join(":").trim()}
                </li>
                <li>
                  <strong>{t("items.pillars.tawaf").split(":")[0]}:</strong>{" "}
                  {t("items.pillars.tawaf").split(":").slice(1).join(":").trim()}
                </li>
                <li>
                  <strong>{t("items.pillars.sai").split(":")[0]}:</strong>{" "}
                  {t("items.pillars.sai").split(":").slice(1).join(":").trim()}
                </li>
              </ul>
            </div>
          </details>

          <details className="group flex flex-col rounded-xl border border-[#e6dccf] dark:border-[#2a2a2a] bg-surface-light dark:bg-[#1f1f1f] shadow-soft transition-all duration-300 open:shadow-lg open:border-primary/30">
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 list-none">
              <span className="text-lg font-bold text-text-main dark:text-white leading-tight group-hover:text-secondary transition-colors">
                {t("items.qurbaniBooking.question")}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff2eb] dark:bg-white/5 text-secondary transition-transform duration-300 group-open:rotate-180">
                <RiArrowDownSLine className="text-2xl" aria-hidden />
              </div>
            </summary>
            <div className="px-6 pb-6">
              <div className="h-px w-full bg-[#f3efe9] dark:bg-[#2a2a2a] mb-4" />
              <p className="text-text-muted dark:text-gray-300 leading-relaxed text-base">
                {t("items.qurbaniBooking.answer")}
              </p>
            </div>
          </details>

          <details className="group flex flex-col rounded-xl border border-[#e6dccf] dark:border-[#2a2a2a] bg-surface-light dark:bg-[#1f1f1f] shadow-soft transition-all duration-300 open:shadow-lg open:border-primary/30">
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 list-none">
              <span className="text-lg font-bold text-text-main dark:text-white leading-tight group-hover:text-secondary transition-colors">
                {t("items.medical.question")}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff2eb] dark:bg-white/5 text-secondary transition-transform duration-300 group-open:rotate-180">
                <RiArrowDownSLine className="text-2xl" aria-hidden />
              </div>
            </summary>
            <div className="px-6 pb-6">
              <div className="h-px w-full bg-[#f3efe9] dark:bg-[#2a2a2a] mb-4" />
              <p className="text-text-muted dark:text-gray-300 leading-relaxed text-base">
                {t("items.medical.answer")}
              </p>
            </div>
          </details>

          <details className="group flex flex-col rounded-xl border border-[#e6dccf] dark:border-[#2a2a2a] bg-surface-light dark:bg-[#1f1f1f] shadow-soft transition-all duration-300 open:shadow-lg open:border-primary/30">
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 list-none">
              <span className="text-lg font-bold text-text-main dark:text-white leading-tight group-hover:text-secondary transition-colors">
                {t("items.jamarat.question")}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff2eb] dark:bg-white/5 text-secondary transition-transform duration-300 group-open:rotate-180">
                <RiArrowDownSLine className="text-2xl" aria-hidden />
              </div>
            </summary>
            <div className="px-6 pb-6">
              <div className="h-px w-full bg-[#f3efe9] dark:bg-[#2a2a2a] mb-4" />
              <p className="text-text-muted dark:text-gray-300 leading-relaxed text-base">
                {t("items.jamarat.answer")}
              </p>
            </div>
          </details>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-secondary bg-gradient-to-r from-secondary to-primary px-8 py-12 md:py-16 text-center text-white shadow-2xl shadow-primary/30">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl mx-auto">
            <RiCustomerService2Line className="text-5xl" aria-hidden />
            <h2 className="text-3xl md:text-4xl font-black">{t("cta.title")}</h2>
            <p className="text-lg text-white/90 leading-relaxed">
              {t("cta.description")}
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <button
                className="flex min-w-[160px] items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-secondary transition-transform hover:scale-105 active:scale-95 shadow-lg"
                type="button"
              >
                <RiQuestionLine className="text-xl" aria-hidden />
                {t("cta.contact")}
              </button>
              <button
                className="flex min-w-[160px] items-center justify-center gap-2 rounded-xl border-2 border-white px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-white/10"
                type="button"
              >
                <RiPhoneLine className="text-xl" aria-hidden />
                {t("cta.call")}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
