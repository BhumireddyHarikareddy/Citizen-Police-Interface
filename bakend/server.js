require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// DB connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect(err => {
  if (err) console.log(err);
  else console.log("DB connected successfully");
});


// ================= LOGIN =================
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM police_users WHERE username=? AND password=?';

  db.query(sql, [username, password], (err, results) => {
    if (err) return res.status(500).json({ success: false });
    if (results.length > 0) res.json({ success: true, user: results[0] });
    else res.status(401).json({ success: false });
  });
});


// ================= WANTED =================
app.get('/api/wanted', (req, res) => {
  db.query('SELECT * FROM wanted_criminals', (err, results) => {
    if (err) {
      console.error("❌ ERROR:", err); // 👈 ADD THIS
      return res.status(500).json({ success: false });
    }
    res.json({ success: true, data: results });
  });
});

app.post('/api/wanted', upload.single('photo'), (req, res) => {
  const { name, age, gender, crime, lastSeen, contact } = req.body;
  const photo = req.file ? '/uploads/' + req.file.filename : '';

  db.query(
    'INSERT INTO wanted_criminals (photo,name,age,gender,crime,last_seen_location,contact) VALUES (?,?,?,?,?,?,?)',
    [photo, name, age, gender, crime, lastSeen, contact],
    () => res.json({ success: true })
  );
});


// ================= MISSING =================
app.get('/api/missing', (req, res) => {
  db.query('SELECT * FROM missing_persons', (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, data: results });
  });
});


// ================= REPORT =================
app.post('/api/report', (req, res) => {
  db.query('INSERT INTO crime_reports SET ?', req.body, (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

app.get('/api/reports', (req, res) => {
  db.query('SELECT * FROM crime_reports', (err, results) => {
    if (err) return res.status(500).json([]);
    res.json(results);
  });
});

app.get("/", (req, res) => {
  res.send("Server is working");
});
// ================= START SERVER =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});