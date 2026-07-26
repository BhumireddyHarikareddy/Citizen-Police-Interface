// Express backend for adding wanted criminals
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql');
require('dotenv').config(); // ✅ added
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// ✅ FIXED MySQL connection (using Railway env variables)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});
db.connect((err) => {
  if (err) {
    console.error('DB connection failed:', err);
  } else {
    console.log('DB connected successfully');
  }
});

// ================= ROUTES =================

// Get all wanted responses
app.get('/api/wanted-responses', (req, res) => {
  const sql = 'SELECT * FROM wanted_responses ORDER BY id DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true, data: results });
  });
});

// Update wanted criminal
app.patch('/api/wanted/:id', (req, res) => {
  const id = req.params.id;
  const { name, crime, last_seen_location } = req.body;

  const sql = 'UPDATE wanted_criminals SET name=?, crime=?, last_seen_location=? WHERE id=?';
  db.query(sql, [name, crime, last_seen_location, id], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

// Mark as caught
app.patch('/api/wanted/:id/caught', (req, res) => {
  const id = req.params.id;
  const sql = 'UPDATE wanted_criminals SET status="Caught" WHERE id=?';

  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

// Delete criminal
app.delete('/api/wanted/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM wanted_criminals WHERE id=?';

  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

// Save public response
app.post('/api/wanted-response', (req, res) => {
  const { wanted_id, location, time, person, contact, details, aadhaar, organization, designation } = req.body;

  const sql = 'INSERT INTO wanted_responses (wanted_id, location, time, person, contact, details, aadhaar, organization, designation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

  db.query(sql, [wanted_id, location, time, person, contact, details, aadhaar, organization, designation], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

// Get all criminals
app.get('/api/wanted', (req, res) => {
  const sql = 'SELECT * FROM wanted_criminals ORDER BY created_at DESC';

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, data: results });
  });
});

// Add criminal
app.post('/api/wanted', upload.single('photo'), (req, res) => {
  const { name, age, gender, crime, lastSeen, contact } = req.body;
  const photoPath = req.file ? '/uploads/' + req.file.filename : '';

  const sql = 'INSERT INTO wanted_criminals (photo, name, age, gender, crime, last_seen_location, contact) VALUES (?, ?, ?, ?, ?, ?, ?)';

  db.query(sql, [photoPath, name, age, gender, crime, lastSeen, contact], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});