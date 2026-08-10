import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import {
  RiArrowLeftLine,
  RiCustomerService2Line,
  RiGroupLine,
  RiPhoneFill,
} from "react-icons/ri";

const HERO_BG_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAQKLm9apTS9DcFVLvPHmdojmXXCAFEHZKZwlmobgvMffGzM6M2xkL6oA2tjuzOSnJtAFv3wRnNbRK38YdyByoaY5_ci3mi19rdHA6l0N0VTFX6W6C9dZzXPOTLoDCk14M0DHDHdjiU6P9zqR-y077qBCyfxITeJc7NqQC0YoXU2YEbmEztGTypUZxVOIivZbnZlXUuT9-3tT3HOGAbH_X5zWcoC7CUeli2i9_ararMA0i3HUi5ReidjtN1asZTLGJr87qvOG2z7PSM";

export default async function HomeHero() {
  const t = await getTranslations("home.hero");

  return (
    <section className="relative isolate flex h-[calc(100vh+144px)] w-full items-center overflow-hidden supports-[height:100svh]:h-[calc(100svh+144px)]">
      <div
        className="absolute inset-0 h-full w-full scale-105 bg-cover bg-no-repeat transition-transform duration-[20s] ease-linear hover:scale-110 saturate-125 brightness-90 [background-position:50%_35%]"
        data-alt={t("backgroundAlt")}
        style={{ backgroundImage: `url('${HERO_BG_URL}')` }}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-grey/90 via-grey/60 to-transparent rtl:bg-gradient-to-l" />
      {/* <div className="absolute inset-0 bg-gradient-to-t from-[#f6f8f6] via-[#f6f8f6]/45 to-transparent" /> */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-background via-background/70 to-transparent" />
      <div className="bg-islamic-pattern pointer-events-none absolute inset-0 opacity-10" />

      <div className="relative z-10 block h-full w-full max-w-7xl items-center px-4 mt-[25vh] supports-[height:100svh]:mt-[25svh] sm:flex sm:mt-0 sm:px-6 lg:mx-auto lg:px-8">
        <div className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-8 pt-20 text-start lg:col-span-7 lg:pt-0 md:pt-0">
            <div
              className="animate-fade-up inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              <span className="text-sm font-medium tracking-wide text-primary">
                {t("seasonBadge")}
              </span>
            </div>

            <h1
              className="animate-fade-up font-primary font-bold leading-[1.1] text-start text-white drop-shadow-lg md:text-6xl lg:text-8xl"
              style={{ animationDelay: "0.3s" }}
            >
              {t("titleTop")} <br />
              <span className="text-start text-shadow-gold bg-gradient-to-l from-primary via-[#fceabb] to-primary bg-clip-text text-transparent">
                {t("titleHighlight")}
              </span>
            </h1>

            <p
              className="text-start animate-fade-up max-w-2xl text-xl font-light leading-relaxed text-gray-200 md:text-2xl"
              style={{ animationDelay: "0.5s" }}
            >
              {t("description")}
            </p>

            <div
              className="animate-fade-up mt-4 flex flex-col gap-5 sm:flex-row"
              style={{ animationDelay: "0.7s" }}
            >
              <button
                type="button"
                className="group relative overflow-hidden rounded-xl bg-primary px-8 py-4 text-lg font-bold text-white shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all hover:-translate-y-1 hover:bg-[#c5a028]"
              >
                <div className="absolute inset-0 h-full w-full -translate-x-full bg-white/20 group-hover:animate-shimmer" />
                <div className="relative flex items-center gap-3">
                  <span>{t("primaryCta")}</span>
                  <RiArrowLeftLine className="size-6 transition-transform group-hover:-translate-x-1" />
                </div>
              </button>

              <Link
                href="/contact-us"
                className="group flex items-center gap-3 rounded-xl border border-white/30 bg-white/5 px-8 py-4 text-lg font-bold text-white backdrop-blur-md transition-all hover:border-primary/50 hover:bg-white/10"
              >
                <span>{t("secondaryCta")}</span>
                <RiPhoneFill className="size-6 text-primary opacity-70 transition-opacity group-hover:opacity-100" />
              </Link>
            </div>
          </div>

          <div className="relative hidden h-full min-h-[500px] w-full items-center justify-center lg:col-span-5 lg:flex">
            <div className="animate-float absolute top-20 right-0 z-20">
              <div className="glass-card w-64 rounded-2xl border-r-4 border-r-primary p-6 shadow-2xl">
                <div className="mb-3 flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <RiGroupLine className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {t("stats.pilgrimsValue")}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {t("stats.pilgrimsLabel")}
                    </p>
                  </div>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
                  <div
                    className="h-1.5 rounded-full bg-primary"
                    style={{ width: "85%" }}
                  />
                </div>
              </div>
            </div>

            <div className="animate-float-delayed absolute bottom-32 left-10 z-20">
              <div className="glass-card w-64 rounded-2xl border-l-4 border-l-secondary p-6 shadow-2xl">
                <div className="mb-2 flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                    <RiCustomerService2Line className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {t("support.title")}
                    </h3>
                    <p className="text-sm font-bold text-secondary">
                      {t("support.subtitle")}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-300">
                  {t("support.body")}
                </p>
              </div>
            </div>

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 transform-gpu overflow-visible [contain:layout] will-change-transform">
              <svg
                className="h-full w-full animate-[spin_60s_linear_infinite] origin-center text-primary/20 opacity-30 will-change-transform [backface-visibility:hidden]"
                fill="currentColor"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M50 0L61.2 38.8L100 50L61.2 61.2L50 100L38.8 61.2L0 50L38.8 38.8Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
