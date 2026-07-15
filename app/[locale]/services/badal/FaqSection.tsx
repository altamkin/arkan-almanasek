import { getTranslations } from "next-intl/server";
import FaqAccordion from "./FaqAccordion";

const faqKeys = ["legality", "verification", "performers"] as const;

export default async function FaqSection() {
  const t = await getTranslations("badal.faq");

  const faqs = faqKeys.map((key) => ({
    question: t(`items.${key}.question`),
    answer: t(`items.${key}.answer`),
  }));

  return (
    <section className="py-20 bg-surface-light dark:bg-surface-dark" id="faq">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          {t("title")}
        </h2>

        <FaqAccordion faqs={faqs} />
      </div>
    </section>
  );
}
