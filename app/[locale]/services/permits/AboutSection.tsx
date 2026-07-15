import { getTranslations } from "next-intl/server";

export default async function AboutSection() {
  const t = await getTranslations("permits.about");

  return (
    <section className="py-16 md:py-24 bg-surface-light dark:bg-surface-dark relative">
      <div className="absolute inset-0 bg-islamic-pattern pointer-events-none" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {t("title")}
        </h2>
        <div className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-loose">
            {t("body")}
          </p>
        </div>
      </div>
    </section>
  );
}
