# ArfaPOS — Codebase Audit

> Generated: 18 Juni 2026
> Tool: `getsentry/skills@find-bugs`
> Scope: Full codebase (45+ source files)

---

## Ringkasan

| Kategori       | Jumlah Temuan |
| -------------- | ------------- |
| 🔴 Critical    | 3             |
| 🟠 High        | 5             |
| 🟡 Medium      | 6             |
| 🔵 Low / Saran | 5             |
| **Total**      | **19**        |

---

## 🔴 Critical

### 1. SKU Collision Risk

**File:** `src/lib/utils/generate-sku.ts`

```
prefix = 3 huruf pertama nama (uppercase alphanumeric)
random = Math.floor(1000 + Math.random() * 9000)  // hanya 9000 kemungkinan
```

SKU format `ABC-1234` — hanya 9000 varian per prefix. `Math.random()` tidak
menjamin keunikan. Jika Supabase punya unique constraint di kolom `sku`,
tabrakan akan menyebabkan error silent.

**Fix:** Gunakan `crypto.randomUUID()` atau query existing SKU sebelum insert.

---

### 2. No Transaction Rollback

**File:** `src/routes/(app)/(main)/pos/+page.server.ts:54-83`

Jika insert `transaction_items` gagal setelah insert `transactions` sukses,
transaksi menjadi yatim (orphaned) — tercatat di database tanpa item.

```typescript
// Step 1: Insert transaction — sukses
const { data: transaction } = await supabase.from('transactions').insert({...})

// Step 2: Insert items — bisa gagal
const { error: itemsError } = await supabase.from('transaction_items').insert(txItems)
// Jika gagal di sini, transaction sebelumnya tetap ada!
```

**Fix:** Bungkus dalam Supabase RPC transaction, atau tambah cleanup jika
`itemsError` terjadi.

---

### 3. Stock 0 Tidak Tampil di Product Card

**File:** `src/features/products/components/product-card.svelte:28`

```svelte
{#if product.stock}
	<span>Stok: {product.stock}</span>
{/if}
```

Saat `stock = 0`, nilai falsy, sehingga stok 0 tidak tampil. Seharusnya stok 0
tetap ditampilkan sebagai informasi.

**Fix:** Ganti jadi `{#if product.stock !== undefined && product.stock !== null}`

---

## 🟠 High

### 4. No Stock Validation in POS

**File:** `src/features/pos/lib/cart-state.svelte.ts`

Cart state tidak mengecek stok produk. Bisa menambahkan produk dengan `stock = 0`
atau `stock < qty` ke keranjang.

**Fix:** Validasi stok di `addProduct()` sebelum push ke items.

---

### 5. Bottom Nav Tidak Ada Link Riwayat Transaksi

**File:** `src/shared/components/bottom-nav.svelte`

Tiga navigasi: Dashboard, POS, Produk. Halaman `/transactions` sudah ada tapi
tidak bisa diakses dari bottom nav — hanya lewat dashboard.

**Fix:** Tambah tab ke-4 untuk Transaksi.

---

### 6. Error Validasi `category` & `stock` Tidak Muncul

**Files:**

- `src/features/products/types/product-form-state.ts`
- `src/routes/(app)/products/[sku]/+page.server.ts:48-54`
- `src/routes/(app)/products/add/+page.server.ts:18-25`

`fieldErrors` hanya mencakup `name` dan `price`:

```typescript
fieldErrors: {
  name: tree.properties?.name?.errors?.[0],
  price: tree.properties?.price?.errors?.[0]
  // category dan stock tidak ada
}
```

Validasi Zod memvalidasi 4 field, tapi error `category` dan `stock` tidak
dikirim ke form.

**Fix:** Tambah `category` dan `stock` ke fieldErrors di semua form action.

---

### 7. Raw `formData` Dipakai Ulang Setelah Validasi Zod

**Files:**

- `src/routes/(app)/products/[sku]/+page.server.ts:57-62`
- `src/routes/(app)/products/add/+page.server.ts:28-33`

Pola inkonsisten:

```typescript
// Validasi Zod
const result = productSchema.safeParse({ name, category, price, stock });

// Tapi nilai diambil lagi dari formData mentahan
const nameValue = formData.get('name') as string;
const priceValue = formData.get('price');
```

Seharusnya pakai `result.data` setelah validasi lulus.

**Fix:** Gunakan `result.data.name`, `result.data.price`, dll.

---

### 8. `handlePriceInput` Pakai Global `event` (Deprecated Svelte 5)

**File:** `src/features/pos/components/manual-item-form.svelte:83`

```svelte
<Input ... oninput={() => {
  handlePriceInput(event!);  // global event — deprecated!
  priceError = '';
}} />
```

Global `event` sudah deprecated di Svelte 5.

**Fix:** `oninput={(e) => { handlePriceInput(e); priceError = ''; }}`

---

## 🟡 Medium

### 9. `top-loader.svelte` Pakai Store Deprecated

**File:** `src/shared/components/top-loader.svelte:3`

```typescript
import { navigating } from '$app/stores'; // deprecated
let loading = $derived($navigating !== null);
```

Di Svelte 5 sebaiknya pakai `navigation` dari `$app/navigation`.

**Fix:** Migrasi ke `import { navigation } from '$app/navigation'`.

---

### 10. Halaman `/products` Tidak Ada PageHeader

**File:** `src/routes/(app)/(main)/products/+page.svelte`

Halaman produk list tidak punya `PageHeader`, tidak konsisten dengan halaman
lain seperti `/products/add`, `/products/[sku]`, `/transactions`, dll.

**Fix:** Tambah `PageHeader title="Produk"`.

---

### 11. Inconsistent Path Aliases

Beberapa file pakai `$features`:

- `src/routes/(app)/(main)/pos/+page.svelte` — `$features/pos/components/...`
- `src/routes/(app)/products/[sku]/+page.svelte` — `$features/products/components/...`

Tapi yang lain pakai relative path:

- `src/routes/(app)/products/[sku]/+page.svelte` — `../../../../shared/components/page-header.svelte`
- `src/features/products/components/product-form.svelte` — `../../../shared/components/input-wrapper.svelte`

Tidak ada `$shared` alias, jadi relatif campur aduk.

**Fix:** Bikin alias `$shared` di `svelte.config.js` atau konsisten pakai
relative.

---

### 12. Back Button `page-header` Pakai `history.back()`

**File:** `src/shared/components/page-header.svelte:10`

```typescript
onclick = () => window.history.back();
```

User yang datang via direct URL (bookmark, notifikasi) akan dikirim ke halaman
sebelumnya di history — bukan ke halaman yang logis (misal: ke `/products`).

**Fix:** Terima `href` opsional untuk fallback redirect.

---

### 13. Tidak Ada Pagination Produk/Transaksi

**Files:**

- `src/routes/(app)/(main)/products/+page.server.ts`
- `src/routes/(app)/transactions/+page.server.ts`

Semua query `select *` tanpa limit. Semakin banyak data, semakin lambat.

**Fix:** Tambah `.range()` atau `.limit()` + infinite scroll / load more.

---

### 14. Dashboard Test Tidak Testing Production Code

**File:** `src/features/dashboard/services/__tests__/dashboard-server.spec.ts`

Test membuat fungsi `computeSummary` lokal, bukan menguji fungsi dari
`+page.server.ts`.

**Fix:** Import dan test fungsi dari server file, atau test hasil `load()`.

---

## 🔵 Low / Saran

### 15. Dead Code: `src/lib/supabase/client.ts`

Tidak ada file-nya. Disebut di `AGENTS.md` sebagai dead code.

**Saran:** Hapus referensi dari AGENTS.md.

### 16. Test Coverage Sangat Minim

3 test files untuk 45+ source files produksi. Dashboard feature punya test,
sisanya 0.

**Saran:** Mulai dari schema validation test + POS cart logic test.

### 17. Dashboard Tidak Ada Loading State

Saat data dimuat, stats card tampil kosong tanpa skeleton.

**Saran:** Implement loading state di `DashboardStatsCard` seperti yang sudah
ada prop `loading`-nya.

### 18. Tidak Ada Konfirmasi Tinggalkan Form

User bisa kehilangan input form jika navigasi (misal: back button) tanpa
menyimpan.

**Saran:** `beforeNavigate` guard di form product & manual item.

### 19. Tidak Ada Rate Limiting Auth

Login/register bisa di-brute force.

**Saran:** Rate limiting di hooks.server.ts atau pakai Supabase built-in rate
limit.

---

## ✅ Yang Sudah Baik

- **Svelte 5 runes konsisten** — `$state`, `$derived`, `$props`, `$bindable`
- **Auth guard rapi** — `(app)/+layout.server.ts` redirect ke `/login`
- **Mobile-first layout** — `PageContainer` dengan `max-w-screen-sm`
- **Zod validation** — Semua server action produk & auth pakai schemas
- **Bahasa Indonesia** — Semua UI labels, messages, placeholder
- **Cart state Svelte 5 murni** — Tanpa library eksternal
- **Feature structure rapi** — `components/`, `schemas/`, `services/`, `types/`
- **Security auditing** — Semua query pakai `.eq('user_id', userId)` via
  server-side Supabase
- **UX flow** — Dari `+page.server.ts` redirect logic sampai form action
  response konsisten
