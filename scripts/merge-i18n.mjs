import fs from "fs";
import path from "path";

const localesDir = path.join(process.cwd(), "locales");
const scriptsDir = path.join(process.cwd(), "scripts");

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}

const arPatch = JSON.parse(
  fs.readFileSync(path.join(scriptsDir, "i18n-additions-ar.json"), "utf8"),
).ar;
const enPatch = JSON.parse(
  fs.readFileSync(path.join(scriptsDir, "i18n-additions-en.json"), "utf8"),
).en;

const localePatches = {
  ar: arPatch,
  en: enPatch,
  id: enPatch,
  ms: enPatch,
  si: enPatch,
  tr: enPatch,
};

// Locale-specific overrides for non-English locales
localePatches.id = deepMergeCopy(enPatch, {
  common: {
    addedToCart: "Berhasil ditambahkan ke keranjang",
    closeModal: "Tutup",
    pagination: "Navigasi halaman",
    sar: "SAR",
    unexpectedError: "Terjadi kesalahan tak terduga",
  },
  store: { filters: { tags: "Tag" } },
  notFound: {
    title: "Halaman tidak ditemukan",
    description:
      "Maaf, sepertinya Anda tersesat. Halaman ini tidak tersedia—silakan kembali untuk melanjutkan perjalanan Anda.",
    homeCta: "Kembali ke beranda",
    guideCta: "Panduan jamaah",
    helpCenter: "Pusat bantuan & dukungan",
  },
  faq: {
    titlePrefix: "Pertanyaan",
    titleHighlight: "yang Sering Diajukan",
    searchPlaceholder: "Cari pertanyaan Anda di sini...",
    searchButton: "Cari",
    categories: { all: "Semua" },
    cta: { title: "Tidak menemukan jawaban?", contact: "Hubungi kami", call: "Telepon kami" },
  },
  permits: {
    hero: { title: "Layanan izin", badge: "Gerbang Haji & Umrah" },
    cta: { request: "Ajukan layanan izin", support: "Hubungi dukungan" },
  },
  badal: {
    hero: {
      titleLine1: "Haji & Umrah",
      titleHighlight: "atas nama orang lain",
      primaryCta: "Mulai permintaan",
    },
    faq: { title: "Pertanyaan yang sering diajukan" },
  },
});

localePatches.ms = deepMergeCopy(enPatch, {
  common: {
    addedToCart: "Berjaya ditambah ke troli",
    closeModal: "Tutup",
    pagination: "Navigasi halaman",
    sar: "SAR",
    unexpectedError: "Ralat tidak dijangka berlaku",
  },
  store: { filters: { tags: "Tag" } },
  notFound: {
    title: "Halaman tidak dijumpai",
    homeCta: "Kembali ke laman utama",
    guideCta: "Panduan jemaah",
    helpCenter: "Pusat bantuan & sokongan",
  },
  faq: {
    titlePrefix: "Soalan",
    titleHighlight: "Lazim",
    searchPlaceholder: "Cari soalan anda di sini...",
    searchButton: "Cari",
    categories: { all: "Semua" },
  },
  permits: { hero: { title: "Perkhidmatan permit" } },
  badal: { faq: { title: "Soalan lazim" } },
});

localePatches.si = deepMergeCopy(enPatch, {
  common: {
    addedToCart: "කරත්තයට සාර්ථකව එකතු කරන ලදී",
    closeModal: "වසන්න",
    pagination: "පිටු සංචාලනය",
    sar: "SAR",
    unexpectedError: "අනපේක්ෂිත දෝෂයක් සිදු විය",
  },
  footer: {
    support: { faq: "නිති අසන ප්‍රශ්න" },
  },
  store: { filters: { tags: "ටැග්" } },
  notFound: {
    title: "පිටුව හමු නොවීය",
    homeCta: "මුල් පිටුවට ආපසු",
    guideCta: "යාත්‍රික මාර්ගෝපදේශය",
    helpCenter: "උදව් සහ සහාය මධ්‍යස්ථානය",
  },
  faq: {
    titlePrefix: "නිතර",
    titleHighlight: "අසන ප්‍රශ්න",
    searchPlaceholder: "ඔබේ ප්‍රශ්නය මෙහි සොයන්න...",
    searchButton: "සොයන්න",
    categories: { all: "සියල්ල" },
  },
  permits: { hero: { title: "අවසර සේවා" } },
  badal: { faq: { title: "නිතර අසන ප්‍රශ්න" } },
});

localePatches.tr = deepMergeCopy(enPatch, {
  common: {
    addedToCart: "Sepete başarıyla eklendi",
    closeModal: "Kapat",
    pagination: "Sayfalama",
    sar: "SAR",
    unexpectedError: "Beklenmeyen bir hata oluştu",
  },
  store: { filters: { tags: "Etiketler" } },
  notFound: {
    title: "Sayfa bulunamadı",
    homeCta: "Ana sayfaya dön",
    guideCta: "Hacı rehberi",
    helpCenter: "Yardım ve destek merkezi",
  },
  faq: {
    titlePrefix: "Sıkça",
    titleHighlight: "Sorulan Sorular",
    searchPlaceholder: "Sorunuzu burada arayın...",
    searchButton: "Ara",
    categories: { all: "Tümü" },
    cta: { title: "Cevabınızı bulamadınız mı?", contact: "Bize ulaşın", call: "Bizi arayın" },
  },
  permits: {
    hero: { title: "İzin hizmetleri", badge: "Hac ve Umre kapısı" },
    cta: { request: "İzin hizmeti talep et", support: "Destekle iletişim" },
  },
  badal: {
    hero: {
      titleLine1: "Hac ve Umre",
      titleHighlight: "başkası adına",
      primaryCta: "Talebi başlat",
    },
    faq: { title: "Sıkça sorulan sorular" },
  },
});

function deepMergeCopy(target, source) {
  const copy = structuredClone(target);
  deepMerge(copy, source);
  return copy;
}

for (const [locale, patch] of Object.entries(localePatches)) {
  const filePath = path.join(localesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  deepMerge(data, patch);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`Updated ${locale}.json`);
}
