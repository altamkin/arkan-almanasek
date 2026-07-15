import Image from "next/image";
import { getTranslations } from "next-intl/server";

type Props = {
  docs: readonly string[];
};

export default async function RequiredDocumentsSection({ docs }: Props) {
  const t = await getTranslations("permits.documents");

  return (
    <section className="py-16 md:py-24 bg-background-light dark:bg-background-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <span className="text-primary font-semibold tracking-wide uppercase text-sm mb-2 block">
              {t("eyebrow")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {t("title")}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
              {t("description")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {docs.map((doc) => (
                <div key={doc} className="flex items-start gap-3">
                  <span
                    className="material-symbols-outlined text-primary mt-0.5"
                    aria-hidden
                  >
                    check_circle
                  </span>
                  <span className="text-gray-700 dark:text-gray-200">{doc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:w-1/2 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800">
              <Image
                alt={t("imageAlt")}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMvbNtpJ3ruMyzcmKBD0AqkRLU56mfqHkfEUvd9ELXVwJQocDzYPueis9MqGTbcTAllvCHaCN_jngYf_UDzcigjIrZ59YxJJXsbSZG_tXD4WsRAUWCGi8w_EFRYgZigFwcUeHIyRGrWqBUh4slF1HHez1TALmlqk63zrWzqKFCEpgWOFyIyGKDL9ElV5jG-X0FvRDYMjnJVZvKjYja6Ip8n0aS43YN_xM6IfiTzwiNHNGizeeojBJw0rJ-Ud4FL_LYVZw6alBMUJAE"
                width={900}
                height={600}
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg flex items-center gap-4 max-w-xs border border-gray-100 dark:border-gray-700">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400">
                <span className="material-symbols-outlined" aria-hidden>
                  verified_user
                </span>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">
                  {t("badgeTitle")}
                </p>
                <p className="text-xs text-gray-500">{t("badgeBody")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
