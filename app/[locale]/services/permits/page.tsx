import {
  type PermitRequestT,
  getPermits,
  getPermitsWithToken,
} from "@/app/api/permit";
import { getTranslations } from "next-intl/server";
import AboutSection from "./AboutSection";
import CtaSection from "./CtaSection";
import HeroSection from "./HeroSection";
import NoticeSection from "./NoticeSection";
import PermitTypesSection from "./PermitTypesSection";
import RequiredDocumentsSection from "./RequiredDocumentsSection";
import StepsSection from "./StepsSection";

export default async function PermitsServicePage() {
  const t = await getTranslations("permits");

  const permitCards = [
    {
      title: t("types.cards.hajj.title"),
      description: t("types.cards.hajj.description"),
      icon: "landscape",
      detailsHref: "#",
    },
    {
      title: t("types.cards.umrah.title"),
      description: t("types.cards.umrah.description"),
      icon: "dark_mode",
      detailsHref: "#",
    },
    {
      title: t("types.cards.seasonal.title"),
      description: t("types.cards.seasonal.description"),
      icon: "badge",
      detailsHref: "#",
    },
  ] as const;

  const requiredDocs = [
    t("documents.items.id"),
    t("documents.items.vaccination"),
    t("documents.items.photo"),
    t("documents.items.passport"),
    t("documents.items.visa"),
    t("documents.items.mahram"),
  ] as const;

  const steps = [
    {
      number: 1,
      title: t("steps.items.submit.title"),
      description: t("steps.items.submit.description"),
    },
    {
      number: 2,
      title: t("steps.items.review.title"),
      description: t("steps.items.review.description"),
    },
    {
      number: 3,
      title: t("steps.items.approval.title"),
      description: t("steps.items.approval.description"),
    },
    {
      number: 4,
      title: t("steps.items.receive.title"),
      description: t("steps.items.receive.description"),
    },
  ] as const;

  const initialPermits = await getPermits();
  let requestedPermits: PermitRequestT | null = null;

  try {
    requestedPermits = await getPermitsWithToken();
  } catch {
    requestedPermits = null;
  }

  return (
    <main className="flex-grow w-full overflow-x-hidden">
      <HeroSection />
      <AboutSection />
      <PermitTypesSection cards={permitCards} />
      <RequiredDocumentsSection docs={requiredDocs} />
      <StepsSection steps={steps} />
      <NoticeSection />
      <CtaSection
        initialPermits={initialPermits}
        requestedPermit={requestedPermits}
      />
    </main>
  );
}
