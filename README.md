# 🐟 ASIK - Aplikasi Sistem Informasi Kelautan

Aplikasi web untuk deteksi ikan, informasi ekosistem laut, dan chatbot AI menggunakan teknologi Machine Learning.

## 🛠️ Teknologi yang Digunakan

### Backend
- **Node.js + Express**: Server utama, routing, session management
- **Python + Flask**: API untuk ML detection (YOLO model)
- **MySQL**: Database untuk user management dan berita

### Frontend
- **EJS**: Template engine untuk server-side rendering
- **JavaScript**: Client-side interactivity
- **CSS**: Styling

### Machine Learning
- **Ultralytics YOLO**: Model untuk deteksi ikan (freshness & species detection)
- **OpenCV**: Image processing
- **PyTorch**: Deep learning framework

## 📁 Struktur Proyek

```
ASIK FINAL_COPY/
├── app.js              # Node.js server utama
├── app.py              # Flask API untuk ML detection
├── package.json        # Node.js dependencies
├── requirements.txt   # Python dependencies
├── Procfile           # Railway deployment config
├── railway.toml       # Railway configuration
├── nixpacks.toml      # Build configuration
├── runtime.txt        # Python version
├── views/             # EJS templates (frontend)
├── public/            # Static files (CSS, JS, images)
├── js/                # JavaScript utilities
├── db/                # Database schema
├── best.pt            # ML model untuk freshness detection
├── reef_fish.pt       # ML model untuk species detection
└── yolov8n.pt         # YOLO base model
```

## 🚀 Cara Menjalankan Lokal

### Prerequisites
- Node.js (v18+)
- Python 3.11
- MySQL

### Setup

1. **Install Node.js dependencies**
```bash
npm install
```

2. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

3. **Setup Database**
- Buat database MySQL: `login_system`
- Import schema dari `db/database.sql`

4. **Setup Environment Variables**
Buat file `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=login_system
DB_PORT=3306
GEMINI_API_KEY=your_gemini_api_key
```

5. **Jalankan Aplikasi**
```bash
node app.js
```

Aplikasi akan berjalan di:
- Main App: http://localhost:3000
- Flask API: http://localhost:5000

## 🚂 Deployment ke Railway

Lihat file [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) untuk panduan lengkap deployment.

## ✨ Fitur

- 🐟 **Fish Detection**: Deteksi ikan dengan ML (freshness & species)
- 📸 **Real-time Camera**: Live detection dari webcam
- 🤖 **AI Chatbot**: Chatbot menggunakan Google Gemini
- 📰 **News Management**: CRUD berita untuk admin
- 🗺️ **Ecosystem Maps**: Peta ekosistem laut (mangrove, lamun, terumbu karang)
- 👤 **User Management**: Login/Register system

## 📝 License

MIT License

## 👥 Contributors

- Fadli-byte

