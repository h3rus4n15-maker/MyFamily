# My Family App

Aplikasi web untuk mencatat, menampilkan, dan mengelola silsilah keluarga dalam bentuk pohon keluarga digital.

## Deskripsi

My Family App adalah aplikasi berbasis web yang dirancang untuk membantu keluarga atau komunitas menyimpan data anggota keluarga, melihat hubungan antar anggota, dan menampilkan struktur keluarga secara visual. Aplikasi ini cocok digunakan untuk kebutuhan personal, keluarga besar, komunitas, organisasi, hingga kebutuhan digitalisasi data keluarga.

## Fitur utama

- Tambah data anggota keluarga
- Tampilan pohon keluarga
- Detail profil anggota
- Statistik keluarga
- Tampilan responsif untuk desktop dan mobile
- Data disimpan menggunakan Firebase
- Struktur aplikasi yang mudah dikembangkan dan dikustomisasi

## Teknologi yang digunakan

- React
- Vite
- Firebase
- PWA support via vite-plugin-pwa

## Prasyarat

Sebelum menjalankan aplikasi, pastikan Anda sudah memiliki:

- Node.js 18+
- npm
- Akun Firebase
- Project Firebase yang sudah diaktifkan

## Instalasi

1. Clone repository
   ```bash
   git clone <url-repository>
   cd pohon_keluarga_app
   ```

2. Install dependency
   ```bash
   npm install
   ```

3. Jalankan aplikasi dalam mode development
   ```bash
   npm run dev
   ```

4. Build untuk produksi
   ```bash
   npm run build
   ```

## Konfigurasi Firebase

Pada project ini, konfigurasi Firebase umumnya diletakkan di file yang berada di folder src, seperti `firebase.js` atau konfigurasi project sesuai struktur yang Anda gunakan.

Pastikan Anda:

- membuat project baru di Firebase
- mengaktifkan Authentication bila diperlukan
- mengaktifkan Firestore atau Realtime Database
- menambahkan konfigurasi Firebase ke project Anda

## Struktur project

```text
pohon_keluarga_app/
├─ public/
├─ src/
│  ├─ assets/
│  ├─ components/
│  ├─ storage/
│  ├─ utils/
│  ├─ views/
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ firebase.js
├─ index.html
├─ package.json
├─ vite.config.js
├─ README.md
├─ LICENSE
└─ .gitignore
```

## Target pasar

Aplikasi ini cocok untuk:

- keluarga besar
- komunitas keluarga
- organisasi sosial
- komunitas keagamaan
- kebutuhan personal untuk digitalisasi silsilah keluarga

## Model penjualan yang disarankan

Produk ini dapat dijual dengan beberapa model berikut:

### 1. Source code siap pakai
- Source code lengkap
- Dokumentasi instalasi
- Setup awal
- Harga: mulai dari Rp 2.500.000

### 2. Custom build untuk klien
- Desain disesuaikan branding klien
- Fitur tambahan sesuai kebutuhan
- Support dan maintenance
- Harga: menyesuaikan kebutuhan

### 3. Layanan langganan / maintenance
- Hosting dan deployment
- Maintenance berkala
- Update fitur dasar
- Harga bulanan sesuai paket

## Catatan penting

- Pastikan Anda memiliki hak atas semua kode, aset, dan data yang terkait dengan aplikasi ini.
- Sebelum dijual ke orang lain, lengkapi lisensi dan dokumentasi penggunaan dengan jelas.
- Untuk data keluarga, pastikan implementasi keamanan dan privasi sudah diperhatikan.

## Lisensi

Proyek ini dilisensikan di bawah MIT License. Silakan lihat file LICENSE untuk detail lengkap.

## Kontak

Untuk kebutuhan custom build, lisensi, atau kerja sama, hubungi ABITECH  di nomer 082247971808 atau sesuai informasi yang Anda miliki.
