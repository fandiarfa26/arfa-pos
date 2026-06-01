# Product Requirements Document (PRD)

# ArfaPOS — Web POS untuk Warung & Toko Kecil

---

# 1. Product Overview

## Nama Produk

ArfaPOS

## Deskripsi Singkat

ArfaPOS adalah aplikasi Point of Sale berbasis web untuk warung dan toko kecil yang fokus pada:

- kecepatan transaksi
- kemudahan penggunaan
- minim setup
- mobile-first
- ringan dan mudah dipelajari

ArfaPOS bukan sistem ERP kompleks. Fokus utamanya adalah membantu kasir melakukan transaksi harian dengan cepat dan stabil.

---

# 2. Problem Statement

Banyak POS modern:

- terlalu kompleks
- penuh fitur yang jarang dipakai UMKM
- lambat digunakan saat transaksi
- terlalu desktop-oriented
- sulit dipahami pemilik warung kecil

Kasir membutuhkan:

- input cepat
- checkout cepat
- UI simpel
- transaksi aman
- bisa dipakai dari HP

---

# 3. Product Goals

## Primary Goals

- Mempercepat proses checkout
- Mengurangi kompleksitas POS tradisional
- Menyediakan pengalaman mobile-first
- Menjaga transaksi tetap aman dan konsisten
- Mudah digunakan bahkan tanpa training panjang

## Secondary Goals

- Menjadi portfolio-quality project
- Menjadi fondasi scalable untuk fitur lanjutan
- Clean architecture dan maintainable

---

# 4. Non Goals (Bukan Fokus MVP)

Untuk MVP, fitur berikut tidak diprioritaskan:

- multi cabang
- inventory kompleks
- purchase order
- supplier management
- accounting
- kitchen display
- CRM
- loyalty program
- AI analytics
- offline sync kompleks
- role permission granular

Tujuan utama MVP:

> transaksi berjalan lancar dulu.

---

# 5. Target Users

## Primary User

Pemilik warung / toko kecil:

- toko kelontong
- warung kopi
- minimarket kecil
- toko jajanan
- counter sederhana

## User Characteristics

- tidak terlalu teknis
- lebih sering memakai HP daripada desktop
- membutuhkan UI sederhana
- transaksi harus cepat

---

# 6. Core Product Principles

## 1. Transaction is Source of Truth

Transaksi tidak boleh rusak walaupun:

- produk dihapus
- produk berubah nama
- harga produk berubah

Karena itu:

- `transaction_items` menyimpan snapshot data transaksi

## 2. Produk Bersifat Opsional

Kasir tetap bisa transaksi walaupun:

- produk belum dibuat
- produk tidak ada di database

## 3. Mobile First

UI dioptimalkan untuk:

- portrait mode
- touch interaction
- penggunaan satu tangan

## 4. Fast Cashier Experience

Prioritas:

- sedikit klik
- input cepat
- checkout cepat
- minim loading

## 5. Simplicity Over Complexity

Hindari:

- abstraction berlebihan
- fitur enterprise terlalu dini
- setup rumit

---

# 7. MVP Scope

## Fitur MVP

### 1. Authentication

User bisa:

- register
- login
- logout

Autentikasi menggunakan Supabase Auth.

---

### 2. Product CRUD

User bisa:

- tambah produk
- edit produk
- hapus produk
- lihat daftar produk

Field minimum:

- name
- price

Field opsional:

- category
- stock
- sku

---

### 3. POS Cart

Kasir bisa:

- tambah item ke cart
- ubah qty
- hapus item
- tambah custom item manual

Cart harus:

- cepat
- realtime
- tanpa reload halaman

---

### 4. Checkout

Kasir bisa:

- melihat total
- input jumlah bayar
- melihat kembalian
- submit transaksi

Setelah checkout:

- transaksi tersimpan
- cart kosong kembali

---

### 5. Transaction History

User bisa:

- melihat daftar transaksi
- melihat detail transaksi

Minimal data:

- tanggal
- total
- item transaksi

---

### 6. Dashboard Sederhana

Dashboard menampilkan:

- total transaksi hari ini
- total pendapatan hari ini
- jumlah transaksi

---

# 8. User Flow

## Login Flow

```text
Open App
→ Login
→ Dashboard
```

---

## Checkout Flow

```text
Dashboard
→ POS Page
→ Tambah Item
→ Review Cart
→ Input Pembayaran
→ Checkout
→ Success
→ Cart Reset
```

---

## Product Management Flow

```text
Dashboard
→ Products
→ Create/Edit/Delete Product
```

---

# 9. Functional Requirements

## Authentication

### Register

User dapat:

- membuat akun
- login otomatis setelah register

### Login

User dapat:

- login menggunakan email dan password

### Session

Session tetap aktif setelah refresh.

---

## Product Management

### Create Product

User dapat menambah produk baru.

### Update Product

User dapat mengubah:

- nama
- harga
- stock

### Delete Product

Produk dapat dihapus tanpa merusak transaksi lama.

---

## POS Transaction

### Add Product to Cart

Kasir dapat memilih produk.

### Add Manual Item

Kasir dapat input:

- nama item
- harga
- qty

Tanpa harus membuat produk dulu.

### Quantity Update

Kasir dapat mengubah qty langsung dari cart.

### Checkout

Saat checkout:

- transaksi dibuat
- transaction_items dibuat
- total dihitung di server

---

# 10. Data Model (High Level)

## products

```ts
{
  id
  name
  price
  stock?
  created_at
}
```

---

## transactions

```ts
{
	id;
	total;
	created_at;
	user_id;
}
```

---

## transaction_items

```ts
{
	id;
	transaction_id;

	product_id; // nullable

	name;
	price;
	qty;
	subtotal;
}
```

Penting:

- `name`
- `price`
- `subtotal`

adalah snapshot saat transaksi terjadi.

---

# 11. UX Requirements

## General UX

- tombol besar
- mudah disentuh
- minim popup
- minim modal
- loading seminimal mungkin

---

## Mobile UX

Prioritas utama:

- mobile portrait
- bottom action
- sticky checkout section

---

## Cashier UX

Kasir harus bisa:

- checkout cepat
- tidak perlu banyak navigasi
- tidak perlu isi form panjang

---

# 12. Technical Requirements

## Frontend

- SvelteKit
- TypeScript
- Tailwind CSS
- shadcn-svelte

## Backend

- Supabase
  - Auth
  - PostgreSQL

## Validation

- Zod

---

# 13. Architecture Principles

## Feature Based Structure

```text
src/
  features/
  shared/
  routes/
  lib/
```

---

## Separation of Concerns

Pisahkan:

- UI component
- business logic
- database access
- validation

---

## Avoid Over Engineering

Tidak menggunakan:

- CQRS
- microservices
- event sourcing
- global state berlebihan

untuk MVP.

---

# 14. Security Requirements

## Basic Security

- authenticated routes
- row level security Supabase
- server-side validation
- jangan percaya data client

---

# 15. Success Metrics

## MVP Success Indicators

- checkout dapat dilakukan < 10 detik
- transaksi tersimpan konsisten
- mobile UX nyaman digunakan
- user bisa belajar aplikasi < 10 menit

---

# 16. Future Features (Post MVP)

Setelah MVP stabil:

## Phase 2

- receipt printing
- stock management
- category management
- search product
- barcode support

## Phase 3

- laporan mingguan
- export CSV
- multi device sync
- multi cashier

---

# 17. Design Direction

## Visual Direction

- clean
- minimal
- modern
- fokus utility
- bukan dashboard enterprise

## Inspiration

- kasir modern
- WhatsApp simplicity
- mobile banking simplicity

## UI Characteristics

- spacing lega
- typography jelas
- high contrast
- large tap target
- sedikit dekorasi

---

# 18. Engineering Priorities

Urutan prioritas development:

1. Auth
2. Product CRUD
3. POS cart
4. Checkout flow
5. Transaction history
6. Dashboard

Karena:

> checkout flow adalah jantung aplikasi.

---

# 19. Definition of Done (MVP)

MVP dianggap selesai jika:

- user bisa login
- user bisa membuat produk
- user bisa checkout
- transaksi tersimpan aman
- histori transaksi bisa dilihat
- mobile UX nyaman dipakai

---

# 20. Core Philosophy

ArfaPOS bukan mencoba menjadi:

- ERP besar
- sistem enterprise
- aplikasi penuh fitur

ArfaPOS fokus menjadi:

> alat transaksi yang cepat, simpel, dan nyaman di
