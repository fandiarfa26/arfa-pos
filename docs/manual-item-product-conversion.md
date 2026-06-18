# Feature Plan: Convert Manual Items to Products After Checkout

## Goal

Ketika kasir melakukan checkout dan terdapat item manual (`product_id = null`), sistem menawarkan untuk menyimpan item tersebut sebagai produk setelah transaksi berhasil.

Tujuan:

- menjaga checkout tetap cepat
- membantu user membangun katalog produk secara bertahap
- tidak memaksa user membuat produk sebelum transaksi selesai

---

# Business Rules

## Existing Rule

Transaction tetap menjadi source of truth.

`transaction_items` tidak boleh berubah.

```ts
{
	id: string;

	transaction_id: string;

	product_id: string | null;

	name: string;
	price: number;

	qty: number;
	subtotal: number;
}
```

## New Rule

Setelah checkout berhasil:

- cek apakah terdapat item dengan `product_id = null`
- jika tidak ada → flow selesai
- jika ada → tampilkan prompt untuk membuat produk

Pembuatan produk bersifat opsional.

User dapat:

- membuat produk
- menunda

---

# User Flow

## Case 1 - Tidak Ada Manual Item

```text
Checkout
→ Success
→ Cart Reset
→ Selesai
```

## Case 2 - Ada Manual Item

```text
Checkout
→ Success
→ Cart Reset
→ Manual Item Detected
→ Prompt Create Product
```

---

# UX Flow

## Success State

```text
✓ Transaksi berhasil

Total: Rp 50.000
```

Jika terdapat manual item:

```text
Ditemukan 2 item manual

[Buat Produk]
[Nanti]
```

---

## Create Product Flow

Saat user klik:

```text
Buat Produk
```

Tampilkan daftar item manual.

```text
Item Manual

• Rokok Surya
  Harga: Rp20.000

  [Tambah Sebagai Produk]

• Es Teh
  Harga: Rp5.000

  [Tambah Sebagai Produk]
```

---

## Create Product Form

Saat user memilih item:

```text
Nama Produk
[Rokok Surya]

Harga
[20000]

[Simpan Produk]
```

Field diprefill dari transaction item.

User tetap dapat mengubah data sebelum menyimpan.

---

# Scope MVP

## Include

- deteksi manual item setelah checkout
- prompt setelah checkout berhasil
- create product dari manual item
- prefill nama
- prefill harga
- user dapat skip

## Exclude

Jangan implementasikan:

- auto create product
- AI product matching
- duplicate detection
- merge product
- category suggestion
- bulk create
- stock initialization

---

# Technical Design

## Domain Helper

Buat helper:

```ts
function getManualItems(items: TransactionItem[]) {
	return items.filter((item) => item.productId === null);
}
```

---

## Checkout Result Model

Tambahkan payload hasil checkout.

Contoh:

```ts
type CheckoutResult = {
	transactionId: string;
	total: number;

	manualItems: {
		name: string;
		price: number;
	}[];
};
```

---

## UI Components

Buat component baru:

```text
features/checkout/components/manual-items-prompt.svelte
```

Responsibility:

- menerima daftar manual item
- menampilkan CTA
- membuka create product flow

---

## Product Creation

Gunakan action / service create product yang sudah ada.

Jangan membuat endpoint khusus.

Mapping:

```ts
manualItem.name
→ product.name

manualItem.price
→ product.price
```

---

# Acceptance Criteria

## Scenario 1

Given:

- semua item berasal dari product

When:

- checkout berhasil

Then:

- tidak muncul prompt manual item

---

## Scenario 2

Given:

- terdapat minimal 1 manual item

When:

- checkout berhasil

Then:

- muncul prompt create product

---

## Scenario 3

Given:

- user memilih "Nanti"

When:

- prompt ditutup

Then:

- transaksi tetap selesai
- tidak ada perubahan data

---

## Scenario 4

Given:

- user membuat produk

When:

- save berhasil

Then:

- product baru tersimpan
- nama dan harga sesuai item manual

---

# Engineering Notes

Prioritas utama:

1. Checkout harus tetap cepat.
2. Checkout tidak boleh tergantung pada create product.
3. Product creation adalah flow tambahan setelah transaksi selesai.
4. Jangan mengubah schema transaction_items.
5. Jangan menambah kompleksitas yang belum dibutuhkan.

Prinsip:

"Transaksi selesai dulu, baru tawarkan pengelolaan produk."
