# Firestore schema for MyFamily Pro

Dokumen ini menjadi rancangan data untuk versi pro multi-tenant. Demo tetap memakai penyimpanan lokal; data pro memakai Firebase Authentication dan Firestore.

## Konsep utama

- Satu `tenant` mewakili satu keluarga atau satu klien.
- `slug` menjadi bagian link khusus, misalnya `/f/mbah-bejo`.
- Satu tenant dapat memiliki banyak user dengan role `owner`, `admin`, atau `member`.
- Semua data anggota keluarga selalu berada di bawah `tenants/{tenantId}` agar data antar klien terpisah.
- Jangan menyimpan password atau PIN asli di Firestore. Password dikelola Firebase Authentication. Kode akses, bila tetap diperlukan, harus disimpan sebagai hash melalui backend/Cloud Function.

## Koleksi utama

### `tenants/{tenantId}`

```text
name: "Trah Mbah Bejo"
slug: "mbah-bejo"
status: "active" | "suspended"
plan: "pro"
headerTitle: "Trah Mbah Bejo"
logoUrl: string | null
ownerUid: string
createdAt: Timestamp
updatedAt: Timestamp
```

`slug` harus unik. Link aplikasi untuk tenant ini menjadi:

```text
https://<domain-vercel>/f/mbah-bejo
```

### `tenants/{tenantId}/members/{memberId}`

Dokumen ini memakai data anggota keluarga yang saat ini sudah dipakai aplikasi.

```text
name: string
dob: string | null
gender: string | null
status: string | null
deathDate: string | null
maritalStatus: string | null
photoUrl: string | null
fatherId: string | null
motherId: string | null
spouseId: string | null
role: string | null
notes: string | null
createdAt: Timestamp
updatedAt: Timestamp
createdBy: string
updatedBy: string
```

### `users/{uid}`

```text
email: string
fullName: string
role: "owner" | "admin" | "member"
status: "active" | "disabled"
createdAt: Timestamp
updatedAt: Timestamp
```

### `tenants/{tenantId}/users/{uid}`

Membership user terhadap tenant.

```text
uid: string
email: string
role: "owner" | "admin" | "member"
status: "active" | "disabled"
createdAt: Timestamp
updatedAt: Timestamp
```

## Alur pendaftaran pro

1. User mengisi email, nama keluarga, judul header, dan slug.
2. Backend membuat akun Firebase Authentication.
3. Backend membuat `tenants/{tenantId}` dan membership owner.
4. Backend mengirim email berisi link tenant dan langkah membuat password.
5. User login melalui Firebase Authentication.
6. Aplikasi membaca slug dari URL, mencari tenant aktif, lalu memuat data dari subkoleksi tenant tersebut.

## Aturan akses yang direncanakan

- Demo tidak membaca koleksi pro.
- User hanya boleh membaca tenant jika memiliki membership aktif.
- Owner/admin boleh menambah dan mengubah anggota keluarga.
- Member boleh membaca data dan hanya boleh mengubah data jika fitur itu diizinkan.
- User tidak boleh mengubah `ownerUid`, `plan`, `status`, atau `slug` secara langsung.
- Pembuatan tenant, perubahan role, pengiriman email, dan validasi kode akses dilakukan melalui backend tepercaya, bukan dari browser.

## Catatan migrasi dari kode saat ini

Provider cloud saat ini memakai path `users/{uid}/familyMembers`. Untuk versi pro final, path tersebut perlu dipindahkan ke `tenants/{tenantId}/members` setelah login tenant dan membership selesai dibuat. Jangan melakukan migrasi sebelum Firebase project baru dan Firestore Security Rules siap.
