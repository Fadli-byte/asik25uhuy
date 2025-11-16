# 🚂 Panduan Deployment ke Railway

## ✅ Struktur Aplikasi
Aplikasi ini menggunakan **monorepo** (backend dan frontend digabung):
- **Backend Node.js (Express)**: Server utama, routing, session management
- **Backend Python (Flask)**: API untuk ML detection (fish detection)
- **Frontend**: EJS templates yang di-render oleh Express

## 📋 Prerequisites
1. Akun Railway: https://railway.app
2. Repository GitHub: https://github.com/Fadli-byte/asik25uhuy
3. Database MySQL (bisa menggunakan Railway MySQL service)

## 🚀 Langkah-langkah Deployment

### 1. Push Kode ke GitHub
```bash
git init
git add .
git commit -m "Initial commit for Railway deployment"
git branch -M main
git remote add origin https://github.com/Fadli-byte/asik25uhuy.git
git push -u origin main
```

### 2. Buat Project di Railway
1. Login ke https://railway.app
2. Klik "New Project"
3. Pilih "Deploy from GitHub repo"
4. Pilih repository `Fadli-byte/asik25uhuy`
5. Railway akan otomatis detect dan deploy

### 3. Setup Database MySQL
1. Di Railway dashboard, klik "New" → "Database" → "MySQL"
2. Railway akan membuat MySQL service
3. **Variables otomatis ter-share** ke aplikasi di project yang sama
4. **Tidak perlu copy manual** - kode sudah otomatis menggunakan Railway variables

### 4. Setup Environment Variables

#### ✅ Database Variables (OTOMATIS dari Railway)
**TIDAK PERLU SETUP MANUAL!** Railway **otomatis** menambahkan MySQL variables ke aplikasi Anda jika MySQL service dan aplikasi berada di project yang sama.

Variables yang otomatis tersedia:
- `MYSQLHOST` - Host database
- `MYSQLUSER` - Username database
- `MYSQLPASSWORD` - Password database
- `MYSQLDATABASE` - Nama database
- `MYSQLPORT` - Port database (biasanya 3306)
- `MYSQL_URL` - Connection string lengkap
- `MYSQL_PUBLIC_URL` - Public connection string

**Kode sudah otomatis menggunakan variables ini!** Tidak perlu setup manual.

#### Application Variables (Manual Setup)
Jika perlu, tambahkan di Railway dashboard → Aplikasi service → Variables:

```
FLASK_PORT=5000
FLASK_URL=http://localhost:5000
FLASK_DEBUG=false
GEMINI_API_KEY=<API key Google Gemini Anda>
```

**Catatan:**
- `PORT` - **Otomatis diset Railway**, tidak perlu tambahkan manual
- `GEMINI_API_KEY` - Dapatkan dari https://makersuite.google.com/app/apikey

#### Session Secret (opsional, untuk keamanan)
```
SESSION_SECRET=<random string untuk session encryption>
```

**Cara Generate Session Secret:**
```bash
# Di terminal lokal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Setup Database Schema
1. Buka MySQL service di Railway
2. Klik "Connect" → "MySQL Shell"
3. Import schema dari `db/database.sql`:
```sql
-- Copy isi file db/database.sql dan paste di MySQL shell
```

### 6. Deploy
Railway akan otomatis:
- Install Node.js dependencies (`npm install`)
- Install Python dependencies (`pip install -r requirements.txt`)
- Build aplikasi
- Start server dengan `node app.js`

## 📝 Catatan Penting

### ✅ Yang Sudah Dikonfigurasi
- ✅ Port dinamis menggunakan `process.env.PORT`
- ✅ Database connection menggunakan environment variables
- ✅ Flask API auto-start dari Node.js
- ✅ File konfigurasi Railway (railway.toml, nixpacks.toml, Procfile)
- ✅ .gitignore sudah diset untuk exclude file tidak perlu

### ⚠️ Hal yang Perlu Diperhatikan
1. **Model Files (.pt)**: Pastikan file `best.pt`, `reef_fish.pt`, dan `yolov8n.pt` sudah di-commit ke GitHub (tidak di-ignore)
2. **File Upload**: Folder `uploads/` dan `captured_images/` akan dibuat otomatis
3. **Database**: Pastikan schema sudah di-import sebelum aplikasi digunakan
4. **Memory**: Railway free tier memiliki limit memory, pastikan model ML tidak terlalu besar

### 🔧 Troubleshooting

#### Error: "Cannot find module"
- Pastikan semua dependencies di `package.json` dan `requirements.txt` sudah benar
- Railway akan otomatis install, tapi cek log jika ada error

#### Error: "Database connection failed"
- Pastikan environment variables database sudah diset dengan benar
- Pastikan MySQL service sudah running di Railway

#### Error: "Flask API tidak tersedia"
- Cek log Railway untuk melihat apakah Flask berhasil start
- Pastikan Python dependencies terinstall dengan benar

#### Error: "Port already in use"
- Railway akan otomatis set PORT, jangan hardcode port number

## 📊 Monitoring
- Cek logs di Railway dashboard untuk melihat status aplikasi
- Monitor resource usage (CPU, Memory) di Railway dashboard

## 🔄 Update Deployment
Setiap kali push ke GitHub, Railway akan otomatis:
1. Pull latest code
2. Rebuild aplikasi
3. Restart service

## 📚 Referensi
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

