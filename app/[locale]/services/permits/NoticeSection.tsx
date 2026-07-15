import { getTranslations } from "next-intl/server";

export default async function NoticeSection() {
  const t = await getTranslations("permits.notice");

  return (
    <section className="pb-16 px-4 sm:px-6 lg:px-8 bg-background-light dark:bg-background-dark">
      <div className="max-w-4xl mx-auto">
        <div className="bg-orange-50 dark:bg-orange-900/10 border-r-4 border-primary rounded-lg p-6 flex flex-col md:flex-row gap-6 items-start shadow-sm">
          <div className="text-primary shrink-0">
            <span className="material-symbols-outlined text-4xl" aria-hidden>
              warning_amber
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {t("title")}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">
              {t("body")}
            </p>
            <a
              className="text-primary text-sm font-semibold hover:underline"
              href="#"
            >
              {t("policyLink")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
