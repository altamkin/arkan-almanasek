import { getTranslations } from "next-intl/server";

const stepKeys = ["submit", "payment", "assign", "perform", "document"] as const;

export default async function ProcessTimelineSection() {
  const t = await getTranslations("badal.process");

  const steps = stepKeys.map((key, index) => ({
    number: index + 1,
    title: t(`steps.${key}.title`),
    description: t(`steps.${key}.description`),
  }));

  return (
    <section className="py-20 overflow-hidden" id="process">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-wider uppercase text-sm">
            {t("eyebrow")}
          </span>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {t("title")}
          </h2>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative z-10">
            {steps.map((step) => (
              <div
                key={step.number}
                className="group bg-white dark:bg-surface-dark p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center relative hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="w-10 h-10 bg-background-light dark:bg-gray-800 text-gray-500 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4 ring-4 ring-white dark:ring-surface-dark border border-gray-300 dark:border-gray-700 transition duration-300 ease-in-out group-hover:bg-primary group-hover:text-white group-hover:border-primary">
                  {step.number}
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
