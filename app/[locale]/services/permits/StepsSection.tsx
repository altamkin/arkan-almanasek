import { getTranslations } from "next-intl/server";

type Step = {
  number: number;
  title: string;
  description: string;
};

export default async function StepsSection({
  steps,
}: {
  steps: readonly Step[];
}) {
  const t = await getTranslations("permits.steps");

  return (
    <section className="py-20 bg-background-light dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t("title")}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">{t("subtitle")}</p>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute top-1/2 right-0 left-0 h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 z-0 mx-16" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step) => (
              <div
                key={step.number}
                className="group bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center relative group hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="w-12 h-12 bg-surface-light dark:bg-gray-800 text-primary border-2 border-primary rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 ring-4 ring-white dark:ring-surface-dark transition duration-300 ease-in-out group-hover:bg-primary group-hover:text-white">
                  {step.number}
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
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
