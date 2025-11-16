const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const mysql = require("mysql2");
const path = require("path");
const multer = require("multer"); 
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai"); // ✅ FIX: Update import
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;


// ✅ FIX: Suppress deprecation warnings
process.removeAllListeners('warning');

// ==================== AUTO-START FLASK ====================
let flaskProcess;
const FLASK_PORT = process.env.FLASK_PORT || 5000;

function startFlask() {
  console.log("🐍 Starting Flask API...");
  
  // Gunakan wrapper script jika di Linux (Railway), atau langsung Python
  const startScript = path.join(__dirname, 'start_flask.sh');
  let cmd, args;
  
  if (process.platform !== 'win32' && fs.existsSync(startScript)) {
    // Use wrapper script on Linux (Railway)
    cmd = '/bin/bash';
    args = [startScript];
    console.log("✅ Using Flask wrapper script (sets LD_LIBRARY_PATH)");
  } else {
    // Use Python directly (Windows or if script not found)
    const venvPythonPath = process.platform === 'win32' 
      ? path.join(__dirname, 'venv', 'Scripts', 'python.exe')
      : path.join(__dirname, 'venv', 'bin', 'python3');
    
    if (fs.existsSync(venvPythonPath)) {
      cmd = venvPythonPath;
      args = ['app.py'];
      console.log("✅ Using virtual environment Python");
    } else {
      cmd = process.platform === 'win32' ? 'python' : 'python3';
      args = ['app.py'];
      console.log("✅ Using system Python");
    }
  }
  
  // Set environment variables for Flask
  const flaskEnv = {
    ...process.env,
    FLASK_PORT: FLASK_PORT,
    // Disable stack protection to avoid stack smashing errors
    // (This is safe in containerized environment)
    MALLOC_CHECK_: '0',
    MALLOC_PERTURB_: '0'
  };
  
  flaskProcess = spawn(cmd, args, {
    cwd: __dirname,
    env: flaskEnv,
    shell: process.platform === 'win32'
  });

  flaskProcess.stdout.on('data', (data) => {
    console.log(`[FLASK] ${data.toString().trim()}`);
  });

  flaskProcess.stderr.on('data', (data) => {
    console.error(`[FLASK ERROR] ${data.toString().trim()}`);
  });

  flaskProcess.on('error', (err) => {
    console.error('❌ Failed to start Flask:', err.message);
  });

  flaskProcess.on('close', (code) => {
    console.log(`🐍 Flask process exited with code ${code}`);
  });
}

// Start Flask
startFlask();

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n⏹️ Shutting down servers...');
  if (flaskProcess) flaskProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (flaskProcess) flaskProcess.kill();
  process.exit(0);
});

// ==================== PROXY TO FLASK ====================
const FLASK_URL = process.env.FLASK_URL || `http://localhost:${FLASK_PORT}`;

app.use('/api/fish', createProxyMiddleware({
  target: FLASK_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/fish': '',
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy Error:', err.message);
    res.status(503).json({ 
      error: 'Flask API sedang starting atau tidak tersedia',
      message: 'Tunggu beberapa detik dan coba lagi'
    });
  }
}));


// ==================== STATIC FILES ====================
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/videos", express.static(path.join(__dirname, "videos")));
app.use("/data", express.static(path.join(__dirname, "data")));
app.use("/js", express.static(path.join(__dirname, "js")));

// ==================== VIEW ENGINE ====================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ==================== MIDDLEWARE ====================
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(
  session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: false,
  })
);

// ==================== CREATE DIRECTORIES ====================
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const videosDir = path.join(__dirname, "videos");
if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const jsDir = path.join(__dirname, "js");
if (!fs.existsSync(jsDir)) fs.mkdirSync(jsDir, { recursive: true });

// ==================== DATABASE CONNECTION ====================
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "login_system",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log("✅ Database pool connected");

// ==================== MULTER SETUP ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});
// ==================== ROUTES ====================

// Halaman utama
app.get("/", (req, res) => res.render("index"));

// ================= USER SECTION =================
app.get("/login", (req, res) => res.render("login", { error: null }));
app.get("/register", (req, res) => res.render("register", { error: null }));

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  db.query(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, password],
    (err) => {
      if (err) return res.render("register", { error: "Username sudah digunakan!" });
      res.redirect("/home");
    }
  );
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
        req.session.user = results[0];
        req.session.role = "user";
        res.redirect("/home");
      } else {
        res.render("login", { error: "Username atau password salah!" });
      }
    }
  );
});

app.get("/home", (req, res) => {
  if (!req.session.user || req.session.role !== "user") return res.redirect("/login");

  db.query("SELECT * FROM berita ORDER BY id DESC", (err, results) => {
    if (err) throw err;
    res.render("home", {
      user: req.session.user,
      berita: results,
    });
  });
});

// ================= ADMIN SECTION =================
function isAdmin(req, res, next) {
  if (req.session && req.session.role === "admin") next();
  else res.redirect("/login-admin");
}

app.get("/login-admin", (req, res) => res.render("login_admin", { error: null }));

app.post("/login-admin", (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM admin WHERE username = ? AND password = ?",
    [username, password],
    (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
        req.session.admin = results[0];
        req.session.role = "admin";
        res.redirect("/admin-home");
      } else {
        res.render("login_admin", { error: "Username atau password salah!" });
      }
    }
  );
});

app.get("/admin-home", isAdmin, (req, res) => {
  db.query("SELECT * FROM berita ORDER BY id DESC", (err, results) => {
    if (err) throw err;
    res.render("admin_home", { admin: req.session.admin, berita: results });
  });
});

app.get("/admin/add", isAdmin, (req, res) => res.render("admin_add_news"));

app.post("/admin/add", isAdmin, upload.single("gambar"), (req, res) => {
  const { judul, isi } = req.body;
  const gambar = req.file ? req.file.filename : null;

  db.query("INSERT INTO berita (judul, isi, gambar) VALUES (?, ?, ?)", [judul, isi, gambar], (err) => {
    if (err) throw err;
    res.redirect("/admin-home");
  });
});

app.get("/admin/edit/:id", isAdmin, (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM berita WHERE id = ?", [id], (err, result) => {
    if (err) throw err;
    res.render("admin_edit_news", { berita: result[0] });
  });
});

app.post("/admin/edit/:id", isAdmin, upload.single("gambar"), (req, res) => {
  const { judul, isi } = req.body;
  const id = req.params.id;
  const gambarBaru = req.file ? req.file.filename : null;

  if (gambarBaru) {
    db.query("UPDATE berita SET judul = ?, isi = ?, gambar = ? WHERE id = ?", [judul, isi, gambarBaru, id], (err) => {
      if (err) throw err;
      res.redirect("/admin-home");
    });
  } else {
    db.query("UPDATE berita SET judul = ?, isi = ? WHERE id = ?", [judul, isi, id], (err) => {
      if (err) throw err;
      res.redirect("/admin-home");
    });
  }
});

app.get("/admin/delete/:id", isAdmin, (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM berita WHERE id = ?", [id], (err) => {
    if (err) throw err;
    res.redirect("/admin-home");
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

// ================== CHATBOT BADU AI (GEMINI) ==================
// ================== CHATBOT BADU AI (GEMINI) ==================
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "AIzaSyBLGTYquPdaE1Z6562fxZCLfGVnXlDiclE"
);

// Rate Limiting sederhana max 10 requests per menit (free tier)
let recentRequests = [];
const REQUEST_LIMIT = 10;  // per menit

app.get("/faq", (req, res) => {
  res.render("faq");
});

app.post("/ask", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage || userMessage.trim() === "") {
      return res.status(400).json({ error: "Pesan tidak boleh kosong!" });
    }

    // Rate limit per menit
    const now = Date.now();
    recentRequests = recentRequests.filter(ts => now - ts < 60000);
    if (recentRequests.length >= REQUEST_LIMIT) {
      return res.status(429).json({
        error: "Terlalu banyak request dalam 1 menit.",
        reply: "⚠️ Chatbot sedang sibuk. Silakan tunggu beberapa detik dan coba lagi."
      });
    }
    recentRequests.push(now);

    console.log("📩 User bertanya:", userMessage);

    // ✅ PASTIKAN model sama dengan quota aktif!
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Prompt langsung (single string boleh untuk text out)
    const result = await model.generateContent(userMessage);
    const response = await result.response;
    const botReply = response.text() || "Maaf, saya tidak dapat menjawab pertanyaan ini.";

    console.log("🤖 Bot menjawab:", botReply);

    res.json({ reply: botReply });

  } catch (error) {
    console.error("❌ Error Chatbot:", error.message);

    // Tangani error quota dengan pesan yang jelas untuk user
    if (error.message && error.message.includes("429")) {
      res.status(429).json({
        error: "Kuota/Rate Limit Google Gemini telah habis.",
        reply: "⚠️ Kuota harian atau per menit Google Gemini sudah tercapai. Coba lagi beberapa menit/jam lagi, atau gunakan API/project Gmail lain."
      });
    } else {
      res.status(500).json({
        error: "Gagal menghubungi API Gemini.",
        detail: error.message,
        reply: "Maaf, terjadi kesalahan teknis. Silakan coba lagi."
      });
    }
  }
});


// ================== HALAMAN TAMBAHAN ==================
app.get("/ekosistem", (req, res) => res.render("ekosistem"));
app.get("/prediksi", (req, res) => res.render("prediksi"));
app.get("/voice", (req, res) => res.render("voice"));
app.get("/lamun2019", (req, res) => res.render("lamun2019"));
app.get("/lamun2020", (req, res) => res.render("lamun2020"));
app.get("/lamun2021", (req, res) => res.render("lamun2021"));
app.get("/lamun2022", (req, res) => res.render("lamun2022"));
app.get("/lamun2023", (req, res) => res.render("lamun2023"));
app.get("/lamun2024", (req, res) => res.render("lamun2024"));
app.get("/lamun2025", (req, res) => res.render("lamun2025"));
app.get("/zpi", (req, res) => res.render("zpi"));
app.get("/prediksilamun", (req, res) => res.render("prediksilamun"));
app.get("/prediksimangrove", (req, res) => res.render("prediksimangrove"));
app.get("/prediksiterumbu", (req, res) => res.render("prediksiterumbu"));

// ✅ ROUTE UNTUK PETA MANGROVE
app.get("/mangrove2019", (req, res) => res.render("mangrove2019"));
app.get("/mangrove2020", (req, res) => res.render("mangrove2020"));
app.get("/mangrove2021", (req, res) => res.render("mangrove2021"));
app.get("/mangrove2022", (req, res) => res.render("mangrove2022"));
app.get("/mangrove2023", (req, res) => res.render("mangrove2023"));
app.get("/mangrove2024", (req, res) => res.render("mangrove2024"));
app.get("/mangrove2025", (req, res) => res.render("mangrove2025"));
app.get("/mangrove2030", (req, res) => res.render("mangrove2030"));
app.get("/artikel", (req, res) => res.render("artikel"));



// ✅ ROUTE KAMERA IKAN - Akses tanpa login
app.get("/kamera-ikan", (req, res) => {
  const userData = req.session.user || { username: "Guest" };
  res.render("kamera_ikan", { user: userData });
});

// ✅ ROUTE UNTUK PETA TERUMBU KARANG
app.get("/Terumbu2019", (req, res) => {
  res.render("Terumbu2019");
});

app.get("/Terumbu2020", (req, res) => {
  res.render("Terumbu2020");
});

app.get("/Terumbu2021", (req, res) => {
  res.render("Terumbu2021");
});

app.get("/Terumbu2022", (req, res) => {
  res.render("Terumbu2022");
});   

app.get("/Terumbu2023", (req, res) => {
  res.render("Terumbu2023");
});

app.get("/Terumbu2024", (req, res) => {
  res.render("Terumbu2024");
});

app.get("/Terumbu2025", (req, res) => {
  res.render("Terumbu2025");
});

// ✅ API ENDPOINT untuk mendapatkan data GeoJSON
app.get("/api/geojson/:filename", (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, "data", filename);
  
  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json({ error: "File tidak ditemukan" });
  }
});

// ==================== ERROR HANDLERS ====================
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Halaman ${req.url} tidak ditemukan`,
    statusCode: 404
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

app.get('/downloads/lamun-2019.kml', (req, res) => {
    try {
        // Baca file GeoJSON
        const geojsonPath = path.join(__dirname, 'js', 'lamun-2019.geojson');
        const geojsonData = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
        
        // Konversi ke KML
        const kmlData = tokml(geojsonData);
        
        // Set header dan kirim
        res.setHeader('Content-Type', 'application/vnd.google-earth.kml+xml');
        res.setHeader('Content-Disposition', 'attachment; filename=lamun-2019.kml');
        res.send(kmlData);
    } catch (error) {
        res.status(500).send('Error generating KML');
    }
});
// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log("\n" + "=".repeat(70));
  console.log("🚀 SERVER STARTED SUCCESSFULLY!");
  console.log("=".repeat(70));
  console.log(`📱 Main Application: http://localhost:${PORT}`);
  console.log(`📷 Kamera Ikan (Ultra Sensitive): http://localhost:${PORT}/kamera-ikan`);
  console.log(`🐍 Flask API (proxy): http://localhost:${PORT}/api/fish`);
  console.log(`🤖 Badu AI Chatbot: http://localhost:${PORT}/faq`);
  console.log(`🗄️  Database: Connected`);
  console.log("=".repeat(70));
  console.log("💡 Features:");
  console.log("   ✅ Auto Fish Detection (Ultra Sensitive - conf=0.01)");
  console.log("   ✅ Badu AI Chatbot (Gemini 2.0 Flash)");
  console.log("   ✅ Real-time Species Info Display");
  console.log("   ✅ Image Enhancement (CLAHE + Sharpening)");
  console.log("=".repeat(70));
  console.log("💡 Tip: Tekan Ctrl+C untuk stop semua server\n");
});
