# 🗄️ Panduan Setup Database MySQL di Railway

## ✅ Environment Variables yang Tersedia di Railway

Railway MySQL service menyediakan environment variables berikut:

### Format Railway (Recommended)
- `MYSQLHOST` - Host database
- `MYSQLUSER` - Username database  
- `MYSQLPASSWORD` - Password database
- `MYSQLDATABASE` - Nama database
- `MYSQLPORT` - Port database (biasanya 3306)
- `MYSQL_URL` - Connection string lengkap (format: `mysql://user:password@host:port/database`)
- `MYSQL_PUBLIC_URL` - Public connection string (jika ada)

### Format Alternatif
- `MYSQL_DATABASE` - Nama database (alternatif)

## 🔧 Konfigurasi di Railway

### 1. Environment Variables Otomatis
Railway **otomatis** menambahkan semua MySQL variables ke aplikasi Anda jika:
- MySQL service dan aplikasi berada di **project yang sama**
- Atau Anda **manually share** variables dari MySQL service ke aplikasi

### 2. Manual Setup (Jika Perlu)
Jika variables tidak otomatis ter-share:

1. Buka **MySQL service** di Railway dashboard
2. Klik tab **Variables**
3. Copy semua variables yang diperlukan
4. Buka **Aplikasi service** → **Variables**
5. Tambahkan variables yang sama

**TIDAK PERLU** - Kode sudah otomatis menggunakan Railway variables!

## 📝 Setup Database Schema

### Metode 1: Menggunakan Railway MySQL Shell (Recommended)

1. Buka **MySQL service** di Railway dashboard
2. Klik tab **Data**
3. Klik **"Query"** atau **"MySQL Shell"**
4. Copy isi file `db/database.sql` dan paste di shell
5. Execute query

### Metode 2: Menggunakan MySQL Client Lokal

1. Dapatkan connection string dari Railway:
   - Buka MySQL service → **Variables**
   - Copy `MYSQL_URL` atau `MYSQL_PUBLIC_URL`

2. Connect dari terminal:
```bash
mysql -h <MYSQLHOST> -u <MYSQLUSER> -p<MYSQLPASSWORD> <MYSQLDATABASE> < db/database.sql
```

Atau menggunakan connection string:
```bash
mysql <MYSQL_URL> < db/database.sql
```

### Metode 3: Menggunakan Railway CLI

```bash
railway connect mysql
# Kemudian import schema
mysql < db/database.sql
```

## ✅ Verifikasi Koneksi

Setelah setup, aplikasi akan otomatis:
1. ✅ Connect ke database menggunakan Railway variables
2. ✅ Log "✅ Database pool connected" jika berhasil
3. ✅ Error jika koneksi gagal

## 🔍 Troubleshooting

### Error: "Access denied"
- Pastikan `MYSQLUSER` dan `MYSQLPASSWORD` benar
- Pastikan user memiliki akses ke database

### Error: "Unknown database"
- Pastikan `MYSQLDATABASE` sudah dibuat
- Atau import schema terlebih dahulu

### Variables tidak terdeteksi
- Pastikan MySQL service dan aplikasi di project yang sama
- Atau manually share variables dari MySQL service

## 📚 Referensi

- Railway MySQL Docs: https://docs.railway.app/databases/mysql
- Railway Variables: https://docs.railway.app/develop/variables

