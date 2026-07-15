import fs from "node:fs/promises";
import path from "node:path";

const LOCALES_DIR = path.join(process.cwd(), "locales");

function setByPath(obj, dotPath, value) {
  const parts = dotPath.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!cur[p] || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

function flatten(obj, prefix = "") {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

/** Keys where value still equals English — apply locale-specific translation */
const patches = {
  id: {
    "languages.si": "Sinhala",
    "header.services.items.badal": "Badal",
    "header.services.items.manasik": "Manasik",
    "header.mobile.menu": "Menu",
    "footer.quickLinks.title": "Tautan cepat",
    "footer.quickLinks.about": "Tentang kami",
    "footer.quickLinks.products": "Produk",
    "footer.support.title": "Dukungan & bantuan",
    "footer.support.faq": "FAQ",
    "footer.support.contact": "Hubungi kami",
    "footer.newsletter.title": "Berlangganan buletin",
    "footer.newsletter.description":
      "Dapatkan penawaran terbaru dan tips untuk perjalanan Anda.",
    "footer.newsletter.emailPlaceholder": "Alamat email Anda",
    "footer.newsletter.submitAria": "Kirim",
    "footer.copyright": "© {year} Arkan Al-Manasik. Hak cipta dilindungi.",
    "store.breadcrumb.ariaLabel": "Jejak navigasi",
    "store.products.items.details.title": "Judul produk",
    "store.product.description.title": "Detail paket lengkap",
    "store.product.description.paragraph1":
      "Paket premium ini dirancang dengan cermat untuk mendukung jamaah modern dengan kenyamanan dan kepraktisan. Ihram terbuat dari katun Mesir 100% untuk penyerapan dan ventilasi optimal, tanpa jahitan agar sesuai sunnah.",
    "store.product.description.paragraph2":
      "Paket ini juga mencakup perlengkapan perawatan pribadi bebas wewangian dan haram, ideal selama ihram. Tasnya ringan, tahan air, dan memiliki banyak kantong untuk mengatur barang pribadi Anda.",
    "store.product.reviews.placeholder":
      "Anda dapat menampilkan semua ulasan di sini atau menghubungkan data nyata nanti.",
    "cart.checkout.title": "Pembayaran",
    "cart.checkout.summary.subtotal": "Subtotal",
    "cart.checkout.summary.total": "Total",
    "cart.step2.title": "Informasi pelanggan",
    "cart.step2.fields.emailLabel": "Email",
    "cart.step3.bank.details.bankNameValue": "Bank uji coba (edit nanti)",
    "cart.step3.bank.details.beneficiaryNameValue": "Perusahaan uji coba",
    "qurbani.breadcrumbs.ariaLabel": "Jejak navigasi",
    "qurbani.breadcrumbs.home": "Beranda",
    "qurbani.breadcrumbs.current": "Hadi dan kurban",
    "qurbani.hero.titlePrefix": "Beli",
    "qurbani.hero.titleHighlight": "Ibadah",
    "qurbani.hero.description":
      "Layanan penyembelihan dan distribusi kurban, hadi, dan fidyah sesuai syariat Islam, dengan mudah dan terpercaya.",
    "qurbani.steps.selectType.title": "Pilih jenis ibadah",
    "qurbani.steps.selectType.desc": "Pilih opsi yang sesuai untuk Anda",
    "qurbani.steps.securePayment.title": "Pembayaran aman",
    "qurbani.steps.securePayment.desc": "Gerbang pembayaran terpercaya",
    "qurbani.steps.sharia.title": "Pelaksanaan syariah",
    "qurbani.steps.sharia.desc": "Penyembelihan di bawah pengawasan ahli",
    "qurbani.steps.confirmation.title": "Konfirmasi penyelesaian",
    "qurbani.steps.confirmation.desc": "Laporan via SMS",
    "qurbani.notice.title": "Pemberitahuan syariah",
    "qurbani.notice.body":
      "Semua hewan kurban menjalani pemeriksaan veteriner dan syariah yang ketat, lalu didistribusikan kepada yang membutuhkan pada waktu yang ditetapkan.",
    "qurbani.cart.quantityLabel": "Jml:",
    "qurbani.cart.checkout": "Pembayaran",
    "qurbani.summary.subtotal": "Subtotal",
    "qurbani.summary.total": "Total",
    "home.hero.backgroundAlt": "Pemandangan sinematik Ka'bah",
    "home.hero.seasonBadge": "Musim Haji 1445 H",
    "home.hero.titleTop": "Perjalanan seumur hidup",
    "home.hero.titleHighlight": "Dimulai dengan sentuhan keunggulan",
    "home.hero.description":
      "Kami menemani Anda di setiap langkah perjalanan spiritual, memastikan ketenangan dan kemudahan dalam menunaikan ibadah dengan standar layanan tertinggi, serta menyediakan haji dan umrah badal.",
    "home.hero.primaryCta": "Mulai perjalanan Anda",
    "home.hero.secondaryCta": "Hubungi kami",
    "home.hero.stats.pilgrimsLabel": "Jamaah terlayani",
    "home.hero.support.title": "Dukungan berkelanjutan",
    "home.hero.support.subtitle": "24/7 sepanjang perjalanan",
    "home.hero.support.body":
      "Tim khusus siap melayani dan menjawab pertanyaan Anda kapan saja.",
    "home.video.eyebrow": "Kenali kami",
    "home.video.heading": "Layanan terpadu untuk jamaah",
    "home.video.description":
      "Kami menciptakan pengalaman digital yang mencerminkan semangat perjalanan: jelas, menenangkan, dan menghormati kesucian ibadah—dari perencanaan hingga penyelesaian.",
    "home.video.iframeTitle": "Video pengenalan",
    "home.video.html5Fallback": "Browser Anda tidak mendukung pemutaran video.",
    "home.products.sectionTitle": "Produk pilihan",
    "home.products.viewAll": "Lihat semua",
    "home.products.addToCartAria": "Tambahkan {title} ke keranjang",
    "home.products.emptyMessage": "Tidak ada produk tersedia saat ini.",
    "home.services.sectionTitle": "Layanan unggulan kami",
    "home.services.sectionDescription":
      "Rangkaian layanan syariah dan logistik terpadu untuk memudahkan perjalanan Haji dan Umrah Anda.",
    "home.services.items.hadiAndUdhiyah.title": "Hadi dan kurban",
    "home.services.items.hadiAndUdhiyah.description":
      "Layanan terpercaya untuk penyembelihan dan distribusi hadi serta kurban kepada fakir miskin di Tanah Haram, diawasi penuh dengan amanah.",
    "home.services.items.pilgrimageGuide.title": "Panduan manasik",
    "home.services.items.pilgrimageGuide.description":
      "Panduan lengkap, visual, dan interaktif untuk menunaikan Haji/Umrah dengan benar sesuai sunnah.",
    "home.services.items.permits.title": "Izin Haji & Umrah",
    "home.services.items.permits.description":
      "Kami membantu Anda mendapatkan semua izin resmi melalui saluran resmi dengan cepat dan mudah.",
    "home.services.items.shariaConsultations.title": "Konsultasi syariah",
    "home.services.items.shariaConsultations.description":
      "Akses langsung ke ulama dan dai untuk menjawab pertanyaan fikih selama ibadah.",
    "home.services.items.hajjAndUmrahOnBehalf.title": "Haji/Umrah badal",
    "home.services.items.hajjAndUmrahOnBehalf.description":
      "Kami menunaikan ibadah atas nama yang tidak mampu atau yang telah wafat, dengan dokumentasi lengkap setiap tahap.",
    "home.cta.limitedBadge": "Kuota terbatas musim ini",
    "home.cta.titleLine1": "Perjalanan Anda dimulai dengan",
    "home.cta.titleLine2": "satu langkah persiapan",
    "home.cta.description":
      "Biarkan kami menemani Anda dari persiapan hingga pelaksanaan ibadah dengan mudah dan tenang. Bergabunglah dengan ribuan jamaah yang mempercayai kami.",
    "home.cta.primaryCta": "Pesan sekarang",
    "home.cta.secondaryCta": "Unduh panduan",
    "home.cta.trustLabel": "Jamaah mempercayai kami",
    "home.cta.appTagline": "Panduan manasik pintar Anda",
    "home.cta.liveLabel": "Langsung",
    "about.hero.titleTop": "Kami menemani Anda dalam",
    "about.hero.titleHighlight": "perjalanan paling suci seumur hidup",
    "about.hero.description":
      "Mitra terpercaya Anda untuk melayani jamaah—menggabungkan warisan layanan dengan teknologi modern untuk memudahkan ibadah Anda.",
    "about.values.title": "Nilai dan layanan kami",
    "about.values.subtitle": "Sistem terpadu yang dirancang untuk kenyamanan dan ketenangan Anda",
    "about.vision.title": "Visi kami",
    "about.vision.body":
      "Menjadi platform digital terdepan dunia dalam memfasilitasi Haji dan Umrah, menghadirkan solusi inovatif yang menyatukan spiritualitas dan teknologi dengan transparansi dan amanah.",
    "about.mission.title": "Misi kami",
    "about.mission.body":
      "Kami memberdayakan jamaah untuk menunaikan ibadah dengan mudah dan tenang melalui layanan terpercaya, transparan, dan sesuai syariat dengan standar kualitas tertinggi.",
    "about.cards.badal.title": "Haji badal",
    "about.cards.badal.body":
      "Menunaikan ibadah atas nama yang tidak mampu atau yang telah wafat oleh para penuntut ilmu terpercaya.",
    "about.cards.trust.title": "Integritas & kredibilitas",
    "about.cards.trust.body": "Dasar cara kami melayani jamaah",
    "about.cards.guidance.title": "Hadi dan kurban",
    "about.cards.guidance.body":
      "Panduan lengkap dan pembimbing bersertifikat untuk menemani Anda langkah demi langkah.",
    "about.cards.permits.title": "Izin",
    "about.cards.permits.body":
      "Prosedur resmi yang cepat dan disederhanakan untuk memastikan ibadah sesuai aturan.",
    "about.why.title": "Mengapa kami?",
    "about.why.bullets.sharia": "Komitmen penuh pada pedoman syariah",
    "about.why.bullets.support": "Dukungan teknis dan konsultasi 24/7",
    "about.why.bullets.ease": "Mudah digunakan di semua platform digital",
    "about.why.imageAlt": "Jamaah",
    "about.stats.experienceLabel": "Tahun pengalaman",
    "about.stats.pilgrimsLabel": "Jamaah terlayani",
    "about.stats.satisfactionLabel": "Tingkat kepuasan",
    "about.cta.title": "Siap memulai perjalanan spiritual Anda?",
    "about.cta.description":
      "Bergabunglah dengan ribuan jamaah yang mempercayai kami untuk perjalanan berkesan dan ibadah yang diterima, insya Allah.",
    "about.cta.primaryCta": "Mulai sekarang",
    "about.cta.secondaryCta": "Bicara dengan konsultan",
    "contact.hero.title": "Hubungi kami",
    "contact.hero.description":
      "Kami siap melayani dan menjawab pertanyaan Anda untuk memastikan perjalanan spiritual yang lebih mudah dan aman.",
    "contact.form.title": "Kirim pesan kepada kami",
    "contact.form.fullName.label": "Nama lengkap",
    "contact.form.fullName.placeholder": "Masukkan nama Anda",
    "contact.form.email.label": "Email",
    "contact.form.phone.label": "Nomor telepon",
    "contact.form.subject.label": "Subjek",
    "contact.form.subject.placeholder": "Pilih subjek",
    "contact.form.subject.options.haj": "Layanan Haji",
    "contact.form.subject.options.umrah": "Layanan Umrah",
    "contact.form.subject.options.support": "Dukungan teknis",
    "contact.form.subject.options.other": "Lainnya",
    "contact.form.message.label": "Pesan",
    "contact.form.message.placeholder": "Tulis pesan Anda di sini...",
    "contact.form.submit": "Kirim pesan",
    "contact.info.phone.title": "Telepon",
    "contact.info.phone.description": "Hubungi kami langsung melalui telepon",
    "contact.info.email.title": "Email",
    "contact.info.email.description": "Untuk pertanyaan resmi dan keluhan",
    "contact.info.hours.title": "Jam kerja",
    "contact.info.hours.description": "Kami siap membantu Anda",
    "contact.info.hours.value": "Sab–Kam: 09.00–17.00",
    "contact.info.location.title": "Lokasi",
    "contact.info.location.description": "Kunjungi kantor pusat kami",
    "contact.info.location.value": "Makkah, Al Aziziyah, Arab Saudi",
    "contact.social.xAria": "Akun X kami",
    "contact.social.whatsAppAria": "Hubungi via WhatsApp",
    "contact.social.instagramAria": "Akun Instagram kami",
    "contact.helpCenter.title": "Pusat bantuan",
    "contact.helpCenter.subtitle":
      "Jawaban cepat dan layanan langsung untuk memudahkan perjalanan Anda",
    "contact.helpCenter.cards.faq.title": "FAQ",
    "contact.helpCenter.cards.faq.description":
      "Cari di basis pengetahuan kami untuk jawaban",
    "contact.helpCenter.cards.faq.action": "Jelajahi FAQ",
    "contact.helpCenter.cards.consultations.title": "Konsultasi Haji",
    "contact.helpCenter.cards.consultations.description":
      "Pesan konsultasi pribadi dengan salah satu ahli kami",
    "contact.helpCenter.cards.consultations.action": "Pesan konsultasi",
    "contact.helpCenter.cards.services.title": "Panduan layanan",
    "contact.helpCenter.cards.services.description":
      "Pelajari layanan dan paket yang tersedia",
    "contact.helpCenter.cards.services.action": "Lihat layanan",
    "contact.finalCta.title": "Siap memulai perjalanan spiritual Anda?",
    "contact.finalCta.description":
      "Kami menemani Anda di setiap langkah—dari perencanaan hingga pelaksanaan ibadah—untuk pengalaman yang tak terlupakan.",
    "contact.finalCta.primaryCta": "Minta konsultasi gratis",
    "contact.finalCta.secondaryCta": "Hubungi kami via WhatsApp",
    "contact.validation.fullNameRequired": "Nama lengkap wajib diisi",
    "contact.validation.fullNameTooLong": "Nama terlalu panjang",
    "contact.validation.emailRequired": "Email wajib diisi",
    "contact.validation.emailInvalid": "Email tidak valid",
    "contact.validation.phoneRequired": "Nomor telepon wajib diisi",
    "contact.validation.phoneInvalid": "Nomor telepon tidak valid",
    "contact.validation.subjectRequired": "Pilih subjek pertanyaan",
    "contact.validation.messageTooShort": "Pesan terlalu pendek",
    "contact.validation.messageTooLong": "Pesan terlalu panjang",
    "faq.description":
      "Kami siap menjawab semua pertanyaan Anda tentang manasik Haji dan layanan yang tersedia untuk memudahkan perjalanan spiritual Anda.",
    "faq.searchAria": "Cari pertanyaan Anda di sini",
    "faq.categories.rituals": "Panduan manasik",
    "faq.categories.health": "Kesehatan & keselamatan",
    "faq.categories.services": "Layanan umum",
    "faq.items.pillars.question": "Apa empat rukun Haji?",
    "faq.items.pillars.intro": "Haji memiliki empat rukun yang wajib, yaitu:",
    "faq.items.pillars.ihram": "Ihram: niat memasuki ibadah.",
    "faq.items.pillars.arafah": "Wukuf di Arafah: rukun terpenting Haji.",
    "faq.items.pillars.tawaf": "Tawaf ifadhah: dilakukan setelah turun dari Arafah dan Muzdalifah.",
    "faq.items.pillars.sai": "Sa'i antara Shafa dan Marwah: tujuh kali dimulai dari Shafa.",
    "faq.items.qurbaniBooking.question":
      "Bagaimana cara memesan hadi dan kurban secara online?",
    "faq.items.qurbaniBooking.answer":
      "Anda dapat memesan hadi dan kurban melalui platform Adahi resmi atau aplikasi resmi seperti Nusuk. Pembayaran dilakukan secara elektronik dan Anda menerima konfirmasi saat penyembelihan selesai pada waktu yang ditetapkan.",
    "faq.items.medical.question":
      "Layanan medis apa yang tersedia bagi jamaah di tanah suci?",
    "faq.items.medical.answer":
      "Rumah sakit dan pusat kesehatan lengkap tersedia di Mina, Arafah, dan Muzdalifah, beserta tim ambulans dan klinik lapangan yang beroperasi 24 jam untuk perawatan medis gratis bagi semua jamaah.",
    "faq.items.jamarat.question":
      "Kapan waktu melempar jamarat dimulai pada hari tasyriq?",
    "faq.items.jamarat.answer":
      "Waktu melempar jamarat pada hari tasyriq (11, 12, dan 13 Dzulhijjah) dimulai setelah zuhur hingga akhir malam. Disarankan mengikuti jadwal rombongan untuk menghindari kepadatan.",
    "faq.cta.description":
      "Tim dukungan teknis dan bimbingan kami tersedia 24 jam untuk menjawab pertanyaan Anda dan memastikan perjalanan Haji yang lancar, insya Allah.",
    "permits.hero.description":
      "Kami hadir untuk memudahkan perjalanan spiritual Anda. Kami menyediakan penerbitan izin Haji dan Umrah yang andal dengan prosedur sederhana agar Anda dapat fokus beribadah dengan tenang.",
    "permits.hero.imageAlt": "Latar belakang pola geometris Islami",
    "permits.about.title": "Mitra terpercaya untuk perjalanan seumur hidup",
    "permits.about.body":
      "Perjalanan Haji dan Umrah membutuhkan ketelitian prosedur dan kepatuhan pada peraturan yang berubah. Kami menangani sisi administratif yang rumit—dari pengajuan hingga penerimaan izin akhir—dengan memastikan kepatuhan penuh pada persyaratan Kementerian Haji dan Umrah.",
    "permits.types.title": "Jenis izin yang tersedia",
    "permits.types.subtitle": "Pilih layanan yang sesuai kebutuhan Anda",
    "permits.types.cards.hajj.title": "Izin Haji",
    "permits.types.cards.hajj.description":
      "Layanan lengkap penerbitan izin Haji untuk warga negara dan penduduk, termasuk pendaftaran jalur elektronik dan tindak lanjut persetujuan.",
    "permits.types.cards.umrah.title": "Izin Umrah",
    "permits.types.cards.umrah.description":
      "Izin Umrah dan kunjungan Raudhah instan melalui aplikasi resmi, untuk individu dan kelompok.",
    "permits.types.cards.seasonal.title": "Izin musiman",
    "permits.types.cards.seasonal.description":
      "Layanan khusus untuk penyelenggara perjalanan dan staf musiman agar masuk ke tanah suci secara sah.",
    "permits.documents.eyebrow": "Persyaratan",
    "permits.documents.title": "Dokumen yang diperlukan",
    "permits.documents.description":
      "Untuk mempercepat pemrosesan, siapkan dokumen berikut sebelum mengajukan. Kami membantu meninjau dokumen sebelum diunggah.",
    "permits.documents.imageAlt": "Close-up tangan memegang Al-Qur'an",
    "permits.documents.badgeTitle": "Tinjauan instan",
    "permits.documents.badgeBody": "Kami meninjau dokumen sebelum pengajuan ke kementerian",
    "permits.documents.items.id": "Foto KTP / izin tinggal",
    "permits.documents.items.vaccination": "Catatan vaksinasi (COVID-19 dan meningitis)",
    "permits.documents.items.photo": "Foto pribadi terbaru (latar putih)",
    "permits.documents.items.passport": "Paspor (untuk pengunjung dari luar negeri)",
    "permits.documents.items.visa": "Visa masuk yang masih berlaku",
    "permits.documents.items.mahram": "Bukti hubungan keluarga (untuk mahram)",
    "permits.steps.title": "Langkah mendapatkan izin",
    "permits.steps.subtitle": "Perjalanan sederhana dari pengajuan hingga kedatangan",
    "permits.steps.items.submit.title": "Ajukan permohonan",
    "permits.steps.items.submit.description":
      "Isi formulir online dan unggah dokumen awal.",
    "permits.steps.items.review.title": "Tinjauan & verifikasi",
    "permits.steps.items.review.description":
      "Tim kami memverifikasi keakuratan data dan lampiran.",
    "permits.steps.items.approval.title": "Persetujuan resmi",
    "permits.steps.items.approval.description":
      "Permohonan dikirim ke otoritas terkait untuk disetujui.",
    "permits.steps.items.receive.title": "Terima izin",
    "permits.steps.items.receive.description":
      "Izin Anda dikirim melalui aplikasi atau email.",
    "permits.notice.title": "Catatan penting bagi pemohon",
    "permits.notice.body":
      "Penerbitan izin tunduk pada kapasitas di Dua Masjid Suci dan peraturan Kementerian Haji dan Umrah. Waktu pemrosesan dapat berubah pada musim puncak (Ramadan dan Haji). Kami sarankan mengajukan jauh sebelum tanggal rencana Anda.",
    "permits.notice.policyLink": "Baca kebijakan layanan, syarat & ketentuan",
    "permits.cta.title": "Siap memulai perjalanan spiritual Anda?",
    "permits.cta.description":
      "Jangan biarkan prosedur mengalihkan Anda dari ibadah. Mulai permohonan sekarang dan tim kami akan membimbing Anda langkah demi langkah.",
    "permits.modal.title": "Permohonan layanan izin Haji & Umrah",
    "permits.modal.description": "Lengkapi data untuk mendapatkan izin resmi",
    "permits.modal.steps.type": "Jenis izin",
    "permits.modal.steps.details": "Data & dokumen",
    "permits.modal.steps.payment": "Pembayaran",
    "permits.modal.steps.review": "Tinjau permohonan",
    "permits.modal.step1.title": "Pilih jenis izin yang diperlukan",
    "permits.modal.step1.hajjTitle": "Izin Haji",
    "permits.modal.step1.hajjDesc":
      "Terbitkan izin untuk menunaikan Haji bagi warga negara dan penduduk.",
    "permits.modal.step1.umrahTitle": "Izin Umrah",
    "permits.modal.step1.umrahDesc":
      "Terbitkan izin untuk menunaikan Umrah dan mengunjungi Raudhah.",
    "permits.modal.step1.notesLabel": "Catatan tambahan (opsional)",
    "permits.modal.step1.notesPlaceholder":
      "Detail apa pun yang membantu kami menyelesaikan permohonan Anda",
    "permits.modal.step2.personalInfo": "Informasi pribadi",
    "permits.modal.step2.fullNameLabel": "Nama lengkap (sesuai KTP)",
    "permits.modal.step2.fullNamePlaceholder": "Masukkan nama lengkap Anda",
    "permits.modal.step2.phoneLabel": "Nomor ponsel (dengan kode negara)",
    "permits.modal.step2.phoneFormat": "Akan disimpan sebagai: {dial}",
    "permits.modal.step2.countryLabel": "Negara",
    "permits.modal.step2.countryPlaceholder": "Pilih negara",
    "permits.modal.step2.emailLabel": "Email (opsional)",
    "permits.modal.step2.idLabel": "Nomor KTP / paspor",
    "permits.modal.step2.birthDateLabel": "Tanggal lahir",
    "permits.modal.step2.nationalityLabel": "Kewarganegaraan",
    "permits.modal.step2.nationalityPlaceholder": "Pilih kewarganegaraan",
    "permits.modal.step2.attachments": "Lampiran & dokumen",
    "permits.modal.step2.idPhoto": "Foto KTP",
    "permits.modal.step2.personalPhoto": "Foto pribadi",
    "permits.modal.step2.personalPhotoHint": "Harus berlatar belakang putih",
    "permits.modal.step2.docsRequired": "Harap unggah foto KTP dan foto pribadi",
    "permits.modal.step3.title": "Pembayaran",
    "permits.modal.step3.card": "Kartu",
    "permits.modal.step3.bank": "Transfer bank",
    "permits.modal.step3.uploadReceipt": "Unggah bukti transfer",
    "permits.modal.step3.fileChosen": "Dipilih: {name}",
    "permits.modal.step4.title": "Ringkasan permohonan",
    "permits.modal.step4.permitType": "Jenis izin",
    "permits.modal.step4.fullName": "Nama lengkap",
    "permits.modal.step4.idNumber": "Nomor KTP",
    "permits.modal.step4.phone": "Nomor ponsel",
    "permits.modal.step4.country": "Negara",
    "permits.modal.step4.email": "Email",
    "permits.modal.step4.nationality": "Kewarganegaraan",
    "permits.modal.step4.documents": "Dokumen",
    "permits.modal.step4.documentsComplete": "Lengkap",
    "permits.modal.step4.disclaimer":
      'Dengan mengeklik "Kirim permohonan", Anda menyatakan kebenaran semua data dan menyetujui syarat Kementerian Haji dan Umrah.',
    "permits.modal.permitLabels.hajj": "Izin Haji",
    "permits.modal.permitLabels.umrah": "Izin Umrah",
    "permits.modal.nationalities.sa": "Arab Saudi",
    "permits.modal.nationalities.eg": "Mesir",
    "permits.modal.nationalities.ae": "Uni Emirat Arab",
    "permits.modal.nationalities.kw": "Kuwait",
    "permits.modal.nationalities.jo": "Yordania",
    "permits.modal.nationalities.other": "Lainnya",
    "permits.modal.actions.cancel": "Batal",
    "permits.modal.actions.back": "Kembali",
    "permits.modal.actions.next": "Berikutnya",
    "permits.modal.actions.submit": "Kirim permohonan",
    "permits.modal.validation.permitTypeRequired": "Jenis izin wajib diisi",
    "permits.modal.validation.idNumberInvalid": "Nomor KTP / paspor tidak valid",
    "permits.modal.validation.nationalityRequired": "Kewarganegaraan wajib diisi",
    "badal.hero.badge": "Layanan terverifikasi syariah dan hukum",
    "badal.hero.description":
      "Kami menunaikan Haji dan Umrah atas nama orang tercinta yang tidak mampu atau telah wafat dengan amanah dan ikhlas, melalui penuntut ilmu yang berkualitas dan terpercaya, dengan dokumentasi lengkap semua manasik.",
    "badal.hero.videoCta": "Tonton video pengenalan",
    "badal.hero.imageAlt": "Ka'bah suci di Makkah dengan jamaah bertawaf",
    "badal.hero.caption": "Pelaksanaan amanah dengan dokumentasi audio dan video",
    "badal.hero.verified": "Terverifikasi",
    "badal.hero.statsValue": "5.000+ manasik",
    "badal.hero.statsLabel": "Berhasil dilaksanakan tahun ini",
    "badal.about.title": "Untuk siapa layanan ini?",
    "badal.about.description":
      "Islam memperbolehkan Haji dan Umrah badal dalam kasus tertentu sebagai rahmat bagi hamba. Kami memudahkan Anda menunaikan ibadah ini atas nama orang tua atau kerabat yang memenuhi syarat syariah.",
    "badal.about.shariaTitle": "Pengawasan syariah",
    "badal.about.shariaBody":
      "Kami memastikan kelayakan pelaksana dan pengetahuannya tentang manasik.",
    "badal.about.deceasedTitle": "Badal atas nama almarhum",
    "badal.about.deceasedBody":
      "Menunaikan Haji atau Umrah untuk yang telah wafat dengan niat ikhlas.",
    "badal.about.conditions.deceased.title": "Almarhum",
    "badal.about.conditions.deceased.description":
      "Badal Haji dan Umrah diperbolehkan untuk yang wafat tanpa menunaikan kewajiban, atau ketika keluarga ingin beribadah sunnah atas namanya.",
    "badal.about.conditions.incapacitated.title": "Tidak mampu secara permanen",
    "badal.about.conditions.incapacitated.description":
      "Pasien yang tidak ada harapan sembuh, atau lansia yang tidak mampu bepergian dan menempuh perjalanan.",
    "badal.about.conditions.financial.title": "Kemampuan finansial",
    "badal.about.conditions.financial.description":
      "Pemberi kuasa harus mampu menanggung biaya pelaksana dan memberi wewenang.",
    "badal.trust.title": "Kepercayaan & transparansi mutlak",
    "badal.trust.description":
      "Kami berkomitmen pada standar kredibilitas tertinggi untuk ketenangan hati Anda.",
    "badal.trust.performers": "Pelaksana terpercaya",
    "badal.trust.video": "Dokumentasi video",
    "badal.trust.certificate": "Sertifikat penyelesaian",
    "badal.trust.support": "Dukungan berkelanjutan",
    "badal.process.eyebrow": "Cara kami bekerja",
    "badal.process.title": "Perjalanan layanan langkah demi langkah",
    "badal.process.steps.submit.title": "Ajukan permohonan",
    "badal.process.steps.submit.description":
      "Isi data penerima manfaat dan jenis ibadah (Haji atau Umrah).",
    "badal.process.steps.payment.title": "Verifikasi & pembayaran",
    "badal.process.steps.payment.description":
      "Tinjau permohonan dan konfirmasi pembayaran secara online dengan aman.",
    "badal.process.steps.assign.title": "Tetapkan pelaksana",
    "badal.process.steps.assign.description":
      "Pilih penuntut ilmu yang memenuhi syarat untuk menunaikan ibadah.",
    "badal.process.steps.perform.title": "Laksanakan manasik",
    "badal.process.steps.perform.description":
      "Mulai manasik dengan dokumentasi langsung termasuk doa.",
    "badal.process.steps.document.title": "Dokumentasi",
    "badal.process.steps.document.description":
      "Terima sertifikat penyelesaian dan cuplikan video.",
    "badal.pricing.title": "Pilih paket yang sesuai",
    "badal.pricing.subtitle": "Harga transparan dan all-inclusive",
    "badal.pricing.mostPopular": "Paling populer",
    "badal.pricing.umrahFeatures.intention": "Niat dan talbiyah atas nama",
    "badal.pricing.umrahFeatures.rituals": "Tawaf, sa'i, dan cukur/potong rambut",
    "badal.pricing.umrahFeatures.video": "Video doa di Ka'bah",
    "badal.pricing.umrahFeatures.completion": "Selesai dalam 48 jam",
    "badal.pricing.hajjFeatures.type": "Haji tamattu' atau ifrad",
    "badal.pricing.hajjFeatures.arafah": "Wukuf di Arafah dan bermalam di Mina",
    "badal.pricing.hajjFeatures.hadi": "Hadi (kurban)",
    "badal.pricing.hajjFeatures.documentation": "Dokumentasi lengkap semua lokasi",
    "badal.pricing.hajjFeatures.certificate": "Sertifikat Haji resmi",
    "badal.pricing.umrahCta": "Ajukan Umrah badal",
    "badal.pricing.hajjCta": "Ajukan Haji badal",
    "badal.faq.items.legality.question": "Apakah layanan ini dibolehkan secara syariah?",
    "badal.faq.items.legality.answer":
      "Ya, badal Haji dan Umrah untuk almarhum dan yang tidak mampu permanen diperbolehkan menurut ulama, didukung hadits shahih.",
    "badal.faq.items.verification.question": "Bagaimana memastikan ibadah telah dilaksanakan?",
    "badal.faq.items.verification.answer":
      "Kami menyediakan dokumentasi video pelaksana yang menyebut niat atas nama pemohon, plus cuplikan tawaf, sa'i, dan doa.",
    "badal.faq.items.performers.question": "Siapa yang melaksanakan Umrah dan Haji?",
    "badal.faq.items.performers.answer":
      "Kami bekerja dengan penuntut ilmu dan penghafal Al-Qur'an di Makkah yang dikenal saleh dan amanah, yang telah menunaikan kewajiban untuk diri sendiri.",
    "badal.modal.stepOf": "Langkah {step} dari {total}",
    "badal.modal.beneficiaryData": "Data penerima manfaat",
    "badal.modal.payment": "Pembayaran",
    "badal.modal.fullName": "Nama lengkap",
    "badal.modal.phoneLabel": "Nomor ponsel (dengan kode negara)",
    "badal.modal.phoneFormat": "Akan disimpan sebagai: {dial}",
    "badal.modal.countryLabel": "Negara",
    "badal.modal.countryPlaceholder": "Pilih negara",
    "badal.modal.emailOptional": "Email (opsional)",
    "badal.modal.birthDateLabel": "Usia – tanggal lahir",
    "badal.modal.performedBefore": "Pernah menunaikan Haji atau Umrah sebelumnya?",
    "badal.modal.yes": "Ya",
    "badal.modal.no": "Tidak",
    "badal.modal.cancel": "Batal",
    "badal.modal.next": "Berikutnya",
    "badal.modal.saving": "Menyimpan permohonan...",
    "badal.modal.back": "Kembali",
    "badal.modal.submitting": "Mengirim permohonan...",
    "badal.modal.confirmUmrah": "Konfirmasi permohonan Umrah badal",
    "badal.modal.confirmHajj": "Konfirmasi permohonan Haji badal",
    "badal.modal.description": "Lengkapi data Anda lalu lanjut ke pembayaran",
    "badal.modal.requestUmrah": "Ajukan Umrah badal",
    "badal.modal.requestHajj": "Ajukan Haji badal",
  },
};

async function loadPatch(locale) {
  const patchPath = path.join(
    process.cwd(),
    "scripts",
    "locale-patches",
    `${locale}.json`,
  );
  try {
    return JSON.parse(await fs.readFile(patchPath, "utf8"));
  } catch {
    return patches[locale] ?? {};
  }
}

async function main() {
  const en = JSON.parse(
    await fs.readFile(path.join(LOCALES_DIR, "en.json"), "utf8"),
  );
  const enFlat = flatten(en);

  for (const locale of ["id", "tr", "ms", "si"]) {
    const localePatches = await loadPatch(locale);
    const filePath = path.join(LOCALES_DIR, `${locale}.json`);
    const json = JSON.parse(await fs.readFile(filePath, "utf8"));

    let applied = 0;
    for (const [dotPath, value] of Object.entries(localePatches)) {
      if (enFlat[dotPath] !== undefined) {
        setByPath(json, dotPath, value);
        applied++;
      } else {
        console.warn(`${locale}: unknown key ${dotPath}`);
      }
    }

    await fs.writeFile(filePath, `${JSON.stringify(json, null, 2)}\n`, "utf8");
    console.log(`${locale}.json: applied ${applied} translations`);
  }

  const supplemental = JSON.parse(
    await fs.readFile(
      path.join(process.cwd(), "scripts", "locale-patches", "supplemental.json"),
      "utf8",
    ),
  );

  for (const [locale, localePatches] of Object.entries(supplemental)) {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`);
    const json = JSON.parse(await fs.readFile(filePath, "utf8"));
    let applied = 0;
    for (const [dotPath, value] of Object.entries(localePatches)) {
      if (enFlat[dotPath] !== undefined) {
        setByPath(json, dotPath, value);
        applied++;
      }
    }
    await fs.writeFile(filePath, `${JSON.stringify(json, null, 2)}\n`, "utf8");
    console.log(`${locale}.json supplemental: applied ${applied} fixes`);
  }
}

await main();
