# DESIGN.md

# ArfaPOS Design System & UI Guidelines

---

# 1. Design Philosophy

ArfaPOS adalah aplikasi POS yang:

- cepat digunakan
- mobile-first
- minim distraksi
- fokus utility
- mudah dipelajari user non teknis

Desain harus terasa:

- ringan
- jelas
- responsif
- tidak “enterprise”
- tidak penuh dekorasi

Prinsip utama:

> kasir harus bisa transaksi secepat mungkin.

---

# 2. Core Design Principles

## 1. Mobile First

Prioritas utama:

- portrait mode
- penggunaan satu tangan
- touch-friendly
- responsive sejak awal

Desktop hanyalah adaptasi dari mobile layout.

---

## 2. Speed Over Decoration

Hindari:

- animasi berlebihan
- shadow berat
- layout kompleks
- visual noisy

Prioritas:

- informasi cepat terbaca
- tombol cepat ditekan
- checkout cepat dilakukan

---

## 3. Simplicity

UI harus:

- mudah dipahami dalam beberapa menit
- minim learning curve
- minim klik
- minim popup

Gunakan:

- bottom action
- inline interaction
- direct manipulation

---

## 4. High Readability

Prioritas:

- typography jelas
- spacing lega
- contrast tinggi
- ukuran tombol besar

Kasir harus nyaman menggunakan aplikasi dalam waktu lama.

---

# 3. Visual Direction

## Keywords

- clean
- modern
- utility-first
- warm minimalist
- mobile banking simplicity
- WhatsApp simplicity
- fast POS workflow

---

## Design Character

UI harus terasa:

- hangat
- ringan
- fokus ke konten
- minim border dekoratif
- profesional tapi sederhana

---

# 4. Color System

## Primary Color

Gunakan:

- light brown
- milk brown
- warm neutral brown

Karakter warna:

- hangat
- nyaman dilihat
- tidak terlalu mencolok
- terasa ramah untuk UMKM
- lebih unik dibanding POS biru/hijau mainstream

Visual feeling:

- cozy
- grounded
- modern minimalist

---

## Recommended Primary Palette

```text
#C58B5D
#B67A4E
#D9B08C
#E6C7A8
#8C5A3C
```

---

## Background Color

Gunakan:

- off white
- cream
- warm neutral

Contoh:

```text
#FAF7F2
#F5F1EA
#FFFDF9
```

---

## Text Color

Gunakan:

```text
#2B2B2B
#3A312B
#4A403A
```

Hindari pure black terlalu keras.

---

## Semantic Colors

- green → success
- red → danger
- amber → warning
- blue → info

Gunakan tone yang sedikit muted agar tetap warm.

---

# 5. Typography

## Font Recommendation

Gunakan:

- Inter
- Geist
- Manrope

Prioritas:

- readability
- clean appearance
- mobile clarity

---

## Typography Rules

Minimal ukuran text mobile:

- 14px

Ideal:

- 16px

Harga dan total:

- lebih besar
- lebih tebal
- mudah discan cepat

---

# 6. Spacing System

Gunakan spacing lega.

Skala:

```text
4
8
12
16
20
24
32
```

---

# 7. Border Radius

Gunakan:

```text
rounded-xl
rounded-2xl
```

Hindari:

- sharp UI
- radius terlalu besar

---

# 8. Shadows

Gunakan shadow ringan.

Tujuan:

- separation
- subtle depth

Hindari heavy shadow.

---

# 9. Layout Guidelines

## General Layout

```text
Header
Content
Bottom Action
```

---

## Sticky Areas

Gunakan sticky untuk:

- checkout summary
- total pembayaran
- bottom checkout action

---

# 10. Navigation Pattern

## Mobile Navigation

Gunakan:

- bottom navigation
  atau
- simple top navigation

Prioritas:

- mudah dijangkau jempol

---

## Hindari

- sidebar enterprise
- nested navigation
- complex dashboard layout

---

# 11. Button Design

## Primary Button

Karakter:

- besar
- jelas
- high contrast

Digunakan untuk:

- checkout
- save
- submit

---

## Button Rules

Button harus:

- minimum tinggi 44px
- nyaman disentuh
- text jelas

Hindari tiny button.

---

# 12. Form Design

## Form Philosophy

Form harus:

- pendek
- cepat diisi
- minim field

---

## Validation

Validation harus:

- inline
- jelas
- singkat

Contoh:

```text
Harga wajib diisi
```

---

# 13. Card Design

Card digunakan untuk:

- product item
- transaction item
- dashboard summary

Karakter:

- clean
- padding nyaman
- minim dekorasi

---

# 14. POS Page UX

## Core Principle

POS page adalah:

> layar paling penting di seluruh aplikasi.

Harus:

- sangat cepat
- minim friction
- nyaman dipakai berulang

---

## POS Layout Priority

1. Cart visibility
2. Add item speed
3. Total visibility
4. Checkout action

---

## Checkout Section

Checkout harus:

- sticky
- selalu terlihat
- mudah dijangkau jempol

Isi:

- total
- bayar
- kembalian
- tombol checkout

---

# 15. Dashboard Design

Dashboard:

- ringan
- tidak penuh chart

Fokus:

- total transaksi hari ini
- total pendapatan
- jumlah transaksi

---

# 16. Product Page Design

Product page fokus:

- cepat tambah produk
- cepat edit produk

Gunakan:

- mobile card list
- simple form

Hindari:

- table desktop kompleks

---

# 17. Transaction History Design

Transaction history harus:

- mudah discan
- mudah membuka detail

Tampilkan:

- waktu
- total
- jumlah item

---

# 18. Loading State

Gunakan:

- skeleton sederhana
- subtle loading indicator

Hindari fullscreen loading berlebihan.

---

# 19. Empty State

Contoh:

```text
Belum ada produk
Tambahkan produk pertama kamu
```

---

# 20. Error State

Contoh:

```text
Gagal menyimpan transaksi
Coba lagi
```

Hindari error teknis mentah.

---

# 21. Animation Guidelines

Gunakan animasi seperlunya.

Prioritas:

- responsiveness
- perceived performance

Gunakan:

- subtle transition
- fast duration

---

# 22. Icon Guidelines

Gunakan:

- lucide-svelte

Prioritas:

- outline icon
- sederhana
- konsisten

---

# 23. Responsive Strategy

## Mobile

Primary target.

## Tablet

Adaptive layout.

## Desktop

Gunakan:

- centered layout
- max width
- split layout jika perlu

Tetap prioritaskan mobile UX.

---

# 24. Accessibility

Minimum requirement:

- contrast cukup
- button size nyaman
- keyboard accessible
- focus visible

---

# 25. Component Philosophy

Component harus:

- reusable
- kecil
- fokus satu tanggung jawab

Hindari:

- mega component
- abstraction terlalu dini

---

# 26. UX Priority Order

1. Checkout speed
2. Readability
3. Touch comfort
4. Navigation simplicity
5. Visual aesthetics

Jika ada konflik:

> prioritaskan kecepatan transaksi.

---

# 27. Final Design Principle

ArfaPOS bukan aplikasi penuh dekorasi.

ArfaPOS adalah:

> alat kerja harian yang harus cepat, nyaman, hangat, dan stabil digunakan kasir.
