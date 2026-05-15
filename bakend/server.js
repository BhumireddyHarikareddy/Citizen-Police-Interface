require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mysql = require("mysql2");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= UPLOAD FOLDER =================
const uploadPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

app.use('/uploads', express.static(uploadPath));

// ================= MULTER =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

// ================= DATABASE =================
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT)
});

db.connect(err => {
  if (err) console.error("❌ DB ERROR:", err);
  else console.log("✅ DB Connected");
});

// ================= HELPER =================
const formatDatetime = (value) => {
  if (!value) return null;
  if (value.includes("T")) return value.replace("T", " ") + ":00";
  return value;
};

// ================= LOGIN =================
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.query(
    'SELECT * FROM police_users WHERE username=? AND password=?',
    [username, password],
    (err, results) => {
      if (err) return res.status(500).json({ success: false });

      if (results.length > 0) {
        res.json({ success: true, user: results[0] });
      } else {
        res.status(401).json({ success: false });
      }
    }
  );
});

// ================= REPORT =================
app.post('/api/report', (req, res) => {

  const data = {};

  Object.keys(req.body).forEach(key => {
    let value = req.body[key];

    if (value !== undefined && value !== "") {

      if (key.includes("datetime")) {
        value = formatDatetime(value);
      }

      data[key] = value;
    }
  });

  // Required fields (as per SQL NOT NULL)
  if (!data.reporterName || !data.reporterAge || !data.reporterGender ||
      !data.reporterPhone || !data.reporterEmail || !data.reporterAddress ||
      !data.crimeType) {

    return res.status(400).json({
      success: false,
      message: "Required fields missing"
    });
  }

  db.query('INSERT INTO crime_reports SET ?', data, (err) => {
    if (err) {
      console.error("REPORT ERROR:", err);
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }

    res.json({ success: true });
  });
});

// ================= WANTED =================
app.get('/api/wanted', (req, res) => {
  db.query('SELECT * FROM wanted_criminals', (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, data: results });
  });
});

app.post('/api/wanted', upload.single('photo'), (req, res) => {

  const { name, age, gender, crime, lastSeen, contact } = req.body;
  const photo = req.file ? '/uploads/' + req.file.filename : '';

  if (!name || !age || !gender || !crime || !lastSeen || !contact) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  db.query(
    'INSERT INTO wanted_criminals (photo,name,age,gender,crime,last_seen_location,contact) VALUES (?,?,?,?,?,?,?)',
    [photo, name, age, gender, crime, lastSeen, contact],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false });
      }
      res.json({ success: true });
    }
  );
});

// ================= WANTED RESPONSES =================
app.get('/api/wanted-responses', (req, res) => {
  db.query('SELECT * FROM wanted_responses', (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, data: results });
  });
});

app.post('/api/wanted-responses', (req, res) => {

  const { wanted_id, location, time, person, contact, details, aadhaar, organization, designation } = req.body;

  db.query(
    `INSERT INTO wanted_responses 
    (wanted_id, location, time, person, contact, details, aadhaar, organization, designation)
    VALUES (?,?,?,?,?,?,?,?,?)`,
    [wanted_id, location, time, person, contact, details, aadhaar, organization, designation],
    (err) => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true });
    }
  );
});

// ================= MISSING =================
app.get('/api/missing', (req, res) => {
  db.query('SELECT * FROM missing_persons', (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, data: results });
  });
});

app.post('/api/missing', upload.single('photo'), (req, res) => {

  const {
    name, age, gender,
    last_seen_location,
    last_seen_datetime,
    clothing,
    identification_marks,
    contact
  } = req.body;

  const photo = req.file ? '/uploads/' + req.file.filename : '';

  if (!name || !age || !gender || !last_seen_location || !last_seen_datetime || !clothing || !contact) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  db.query(
    `INSERT INTO missing_persons 
    (photo,name,age,gender,last_seen_location,last_seen_datetime,clothing,identification_marks,contact,status)
    VALUES (?,?,?,?,?,?,?,?,?,'missing')`,
    [photo, name, age, gender, last_seen_location, formatDatetime(last_seen_datetime), clothing, identification_marks, contact],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false });
      }
      res.json({ success: true });
    }
  );
});

// ================= MISSING RESPONSES =================
app.get('/api/missing-responses', (req, res) => {
  db.query('SELECT * FROM missing_responses', (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, data: results });
  });
});

app.post('/api/missing-responses', (req, res) => {

  const { missing_id, location, time, person, contact, details, aadhaar, organization, designation } = req.body;

  db.query(
    `INSERT INTO missing_responses 
    (missing_id, location, time, person, contact, details, aadhaar, organization, designation)
    VALUES (?,?,?,?,?,?,?,?,?)`,
    [missing_id, location, time, person, contact, details, aadhaar, organization, designation],
    (err) => {
      if (err) return res.status(500).json({ success: false });
      res.json({ success: true });
    }
  );
});

// ================= HOME =================
app.get("/", (req, res) => {
  res.send("Server is working");
});

// ================= START =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});