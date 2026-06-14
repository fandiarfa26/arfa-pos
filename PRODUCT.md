# Product

## Register

product

## Users

**Primary**: Pemilik warung dan toko kecil (kelontong, warung kopi, minimarket kecil, toko jajanan, counter sederhana) di Indonesia.

**Secondary**: Kasir yang bekerja di toko-toko tersebut.

**Context**: Pengguna non-teknis yang lebih sering memakai HP daripada desktop. Bekerja di lingkungan toko yang sibuk, membutuhkan transaksi cepat tanpa training panjang. Aplikasi digunakan berulang kali dalam sehari untuk durasi panjang.

**Job to be done**: Mencatat dan menyelesaikan transaksi penjualan harian secepat mungkin, dengan akurasi tinggi, tanpa gangguan.

## Product Purpose

ArfaPOS adalah aplikasi Point of Sale berbasis web untuk warung dan toko kecil Indonesia. Fokus utamanya adalah membantu kasir melakukan transaksi harian dengan cepat dan stabil — bukan sistem ERP kompleks. Sukses berarti checkout dapat dilakukan dalam <10 detik, transaksi tersimpan konsisten, mobile UX nyaman, dan user bisa belajar aplikasi dalam <10 menit.

Transaksi adalah source of truth. Produk bersifat opsional (kasir bisa transaksi tanpa database produk). Semua keputusan desain mendahulukan kecepatan transaksi di atas segalanya.

## Brand Personality

**Tiga kata**: Hangat, sigap, bersahaja.

**Karakter**: Seperti kasir warung yang ramah dan profesional — efisien tanpa terburu-buru, membantu tanpa menggurui. Tidak enterprise, tidak kaku, tidak berlebihan.

**Emosi**: Nyaman, percaya diri, fokus. Pengguna merasa aplikasi ini alat kerja yang bisa diandalkan, bukan beban tambahan.

## Anti-references

- **POS enterprise** (TouchBistro, Toast, Lightspeed) — terlalu kompleks, penuh fitur yang tidak relevan untuk UMKM
- **Dashboard SaaS biru/putih** — kaku, korporat, tidak hangat
- **UI yang terlalu "nyentrik"** — dekorasi mengorbankan kecepatan
- **Aplikasi yang butuh training** — learning curve harus minimal
- **Pure black text on white** — terlalu keras untuk penggunaan seharian

## Design Principles

1.  **Speed is the feature.** Setiap klik, animasi, dan layout harus mempercepat transaksi. Jika tidak mempercepat, tidak perlu ada. Konflik antara estetika dan kecepatan selalu dimenangkan kecepatan.

2.  **Mobile-first, not mobile-ok.** Portrait-mode HP adalah canvas utama. Desktop adalah adaptasi. Bottom actions, thumb reach, dan satu tangan adalah non-negotiable.

3.  **Hangat tanpa hiasan.** Warna hangat (brown neutral) memberi kenyamanan visual untuk penggunaan seharian, tanpa dekorasi yang mengganggu fokus kasir.

4.  **Utility over abstraction.** Satu tombol besar lebih baik dari dropdown tiga tingkat. Informasi yang dibutuhkan harus terlihat tanpa klik tambahan. Prinsip ini juga berlaku di kode: feature-based, minimal abstraction.

5.  **Percaya diri sebagai alat kerja.** ArfaPOS tidak perlu terlihat "modern" atau "impresif". Cukup terlihat solid, dapat diandalkan, dan selesai tepat waktu.

## Accessibility & Inclusion

- **WCAG Level AA minimum** — kontras ≥4.5:1 untuk body text, ≥3:1 untuk large text
- **Ukuran minimum 44px** untuk semua interactive element (tombol, input, tap target)
- **Visible focus indicator** untuk keyboard navigation
- **Touch-friendly** — gesture dan tap, bukan hover-dependent
- **Reduced motion** — animasi minimal, tidak ada elemen yang bergantung pada animasi untuk keterbacaan
- **Bahasa Indonesia** sebagai bahasa utama UI
- **Font readability** untuk penggunaan layar kecil dalam waktu lama
