import { getTranslations } from "next-intl/server";
import {
  MdDescription,
  MdSupportAgent,
  MdVerifiedUser,
  MdVideocam,
} from "react-icons/md";

export default async function TrustTransparencyBanner() {
  const t = await getTranslations("badal.trust");

  return (
    <section className="py-12 bg-secondary/10 dark:bg-secondary/5 border-y border-secondary/10 dark:border-secondary/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-right">
          <div className="md:w-1/3">
            <h3 className="text-2xl font-bold text-secondary mb-2">
              {t("title")}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">{t("description")}</p>
          </div>

          <div className="md:w-2/3 flex flex-wrap justify-center md:justify-end gap-6 md:gap-12">
            <div className="flex flex-col items-center gap-2">
              <MdVerifiedUser className="text-4xl text-secondary" aria-hidden />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {t("performers")}
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <MdVideocam className="text-4xl text-secondary" aria-hidden />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {t("video")}
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <MdDescription className="text-4xl text-secondary" aria-hidden />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {t("certificate")}
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <MdSupportAgent className="text-4xl text-secondary" aria-hidden />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {t("support")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
