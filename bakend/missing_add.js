const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql');

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

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'police'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL - Missing Persons Database');
});

// Get all missing persons
app.get('/api/missing', (req, res) => {
  const sql = 'SELECT * FROM missing_persons ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching missing persons:', err);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    res.json({ success: true, data: results });
  });
});

// Get all missing person responses
app.get('/api/missing-responses', (req, res) => {
  const sql = 'SELECT * FROM missing_responses ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching responses:', err);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    res.json({ success: true, data: results });
  });
});

// Update missing person status
app.patch('/api/missing/:id', (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  const sql = 'UPDATE missing_persons SET status = ? WHERE id = ?';
  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error('Error updating missing person:', err);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    res.json({ success: true, message: 'Status updated successfully.' });
  });
});

// Mark missing person as found
app.patch('/api/missing/:id/found', (req, res) => {
  const id = req.params.id;
  const sql = 'UPDATE missing_persons SET status = "found" WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error updating missing person status:', err);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    res.json({ success: true, message: 'Missing person marked as found.' });
  });
});

// Delete missing person record
app.delete('/api/missing/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM missing_persons WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting missing person:', err);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    res.json({ success: true, message: 'Missing person deleted successfully.' });
  });
});

// Post missing person response (sighting tip)
app.post('/api/missing-response', (req, res) => {
  const { missing_id, location, time, person, contact, details, aadhaar, organization, designation } = req.body;
  if (!missing_id || !location || !person || !contact || !aadhaar || !organization || !designation) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }
  const sql = 'INSERT INTO missing_responses (missing_id, location, time, person, contact, details, aadhaar, organization, designation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [missing_id, location, time, person, contact, details, aadhaar, organization, designation], (err, result) => {
    if (err) {
      console.error('Error saving response:', err);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    res.json({ success: true, message: 'Response submitted successfully.' });
  });
});

// Add a new missing person
app.post('/api/missing', upload.single('photo'), (req, res) => {
  const { name, age, gender, last_seen_location, last_seen_datetime, clothing, identification_marks, contact } = req.body;
  const photoPath = req.file ? '/uploads/' + req.file.filename : '';

  const sql = 'INSERT INTO missing_persons (photo, name, age, gender, last_seen_location, last_seen_datetime, clothing, identification_marks, contact, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [photoPath, name, age, gender, last_seen_location, last_seen_datetime, clothing, identification_marks, contact, 'missing'], (err, result) => {
    if (err) {
      console.error('Error inserting missing person:', err);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    res.json({ success: true, message: 'Missing person added successfully.' });
  });
});

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Start server
const PORT = 3005;
app.listen(PORT, () => {
  console.log(`Missing persons server running on port ${PORT}`);
});
