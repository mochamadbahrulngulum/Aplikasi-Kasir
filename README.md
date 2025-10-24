# Aplikasi Kasir - PT Warung Madura

Aplikasi ini dikembangkan sebagai bagian dari mini project rekrutmen **PT Gmedia**, berdasarkan template resmi **Express Setup V2**.

Aplikasi kasir ini memungkinkan pengguna untuk melakukan login/logout, menambahkan kategori dan produk, serta melakukan transaksi pembelian. Seluruh transaksi berjalan aman menggunakan **database transaction** dengan **PostgreSQL** sebagai backend database.

---

## 🧩 Teknologi Utama
- **Node.js** (JavaScript)
- **Express.js** (web framework)
- **PostgreSQL** (database utama)
- **Knex.js** (query builder)
- **Objection.js** (ORM)
- **JWT Authentication** (untuk login/logout)

---

## 📚 Referensi Dokumentasi Resmi

- [Node.js](https://nodejs.org/en/)
- [Express.js](https://expressjs.com/)
- [Knex.js](https://knexjs.org/)
- [Objection.js](https://vincit.github.io/objection.js/guide/installation.html)

---

## ⚙️ Persiapan Lingkungan

### 1. Instalasi Global

```bash
npm install knex -g
npm install nodemon --global
```

### 2. Clone Repository & Setup

```bash
git clone <REPO_URL>
cd <project-folder>
npm install
cp .env.example .env
```

Pastikan Anda mengatur koneksi database pada file `.env` sesuai dengan konfigurasi lokal PostgreSQL Anda.

### 3. Migrasi Database

```bash
npx knex migrate:latest --knexfile knexfile.js
```

### 4. Menjalankan Aplikasi

```bash
npm run dev
```

Akses di browser: [http://localhost:3000](http://localhost:3000)

---

## 🗂 Struktur Folder Penting
- `server.js` — entry point aplikasi
- `app/` — controller, model, validator, middleware
- `routes/` — route untuk auth, produk, kategori, transaksi
- `database/migrations` — file migrasi database
- `database/seeds` — seed data (jika ada)
- `config/database.js` — konfigurasi koneksi database
- `kasir-frontend/` — frontend sederhana (opsional)

---

## 🧠 Fitur Utama
- ✅ Login & Logout (JWT-based)
- ✅ Tambah & kelola kategori produk
- ✅ Tambah & kelola produk
- ✅ Transaksi pembelian (dengan rollback otomatis jika stok tidak cukup)
- ✅ Implementasi database transaction (`knex.transaction()` dan `.forUpdate()`)

---

## 💻 Contoh Request (cURL)

### Register User
```bash
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{"name":"Admin","email":"admin@example.com","password":"password123"}'
```

### Login User
```bash
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"password123"}'
```

### Tambah Kategori
```bash
curl -X POST http://localhost:3000/api/categories -H "Content-Type: application/json" -H "Authorization: Bearer <JWT_TOKEN>" -d '{"name":"Minuman"}'
```

### Tambah Produk
```bash
curl -X POST http://localhost:3000/api/products -H "Authorization: Bearer <JWT_TOKEN>" -F "name=Es Teh" -F "price=5000" -F "stock=50" -F "category_id=1" -F "image=@/path/to/image.jpg"
```

### Buat Transaksi
```bash
curl -X POST http://localhost:3000/api/transactions -H "Content-Type: application/json" -H "Authorization: Bearer <JWT_TOKEN>" -d '{"items":[{"product_id":1,"quantity":2},{"product_id":2,"quantity":1}]}'
```

---

## 🔒 Implementasi Database Transaction
Transaksi dibuat menggunakan `knex.transaction()` dengan langkah-langkah berikut:
1. Lock produk menggunakan `.forUpdate()` untuk mencegah race condition.
2. Validasi stok setiap produk.
3. Hitung total transaksi.
4. Simpan data ke tabel `transactions` dan `transaction_items`.
5. Kurangi stok produk dengan `.decrement()`.
6. Jika terjadi error, seluruh perubahan otomatis **rollback**.

---

## 🧾 Validasi Ketentuan Mini Project
| Ketentuan | Status |
|------------|---------|
| Menggunakan Javascript | ✅ |
| Database PostgreSQL | ✅ |
| Implementasi Database Transaction | ✅ |
| Login/Logout | ✅ |
| Tambah Kategori | ✅ |
| Tambah Produk | ✅ |
| Transaksi Pembelian | ✅ |

---

## 🧹 Prettier & Swagger

Jalankan prettier untuk merapikan kode:
```bash
npm run prettier
```

Akses dokumentasi API Swagger:
[http://localhost:8080/docs](http://localhost:8080/docs)

---

## ⚠️ Catatan Penting
- Jangan commit file `.env` atau data sensitif.
- Disarankan ubah konfigurasi pool database di `config/database.js` menjadi `{ min:2, max:10 }`.
- Jangan sertakan folder `node_modules` atau `kasir-frontend/dist` dalam repo.
- Tambahkan dokumentasi API di Postman (jika waktu memungkinkan).

---

## 🧪 Pengujian Cepat Manual
1. Register user baru → Login → Simpan token JWT.  
2. Tambahkan kategori baru → Tambahkan produk.  
3. Lakukan transaksi → Pastikan stok berkurang.  
4. Coba beli dengan stok tidak cukup → pastikan sistem rollback otomatis.

---

## ❤️ Penutup
Proyek ini dikembangkan sebagai bentuk implementasi backend sederhana untuk simulasi **aplikasi kasir PT Warung Madura**.  
Dibuat dengan semangat **clean code**, **secure transaction**, dan **scalable architecture**.  
Semoga membantu menampilkan kemampuan teknis pada tahap **user interview PT Gmedia** 🚀
