// Express backend for adding wanted criminals
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
  password: '', // update as needed
  database: 'police' // update as needed
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// POST endpoint to add wanted criminal
// GET endpoint to fetch all wanted criminals
// GET endpoint to fetch all wanted responses
app.get('/api/wanted-responses', (req, res) => {
  const sql = 'SELECT * FROM wanted_responses ORDER BY id DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching wanted responses:', err);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    res.json({ success: true, data: results });
  });
});
// POST endpoint to save public response to a wanted criminal
// DELETE endpoint to remove a wanted criminal by ID
// PATCH endpoint to mark a wanted criminal as caught
// PATCH endpoint to edit a wanted criminal
app.patch('/api/wanted/:id', (req, res) => {
  const id = req.params.id;
  const { name, crime, last_seen_location } = req.body;
  if (!name || !crime || !last_seen_location) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }
  const sql = 'UPDATE wanted_criminals SET name = ?, crime = ?, last_seen_location = ? WHERE id = ?';
  db.query(sql, [name, crime, last_seen_location, id], (err, result) => {
    if (err) {
      console.error('Error updating wanted criminal:', err);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    res.json({ success: true, message: 'Criminal updated successfully.' });
  });
});
app.patch('/api/wanted/:id/caught', (req, res) => {
  const id = req.params.id;
  const sql = 'UPDATE wanted_criminals SET status = "Caught" WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error marking as caught:', err);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    res.json({ success: true, message: 'Criminal marked as caught.' });
  });
});
app.delete('/api/wanted/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM wanted_criminals WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting wanted criminal:', err);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    res.json({ success: true, message: 'Criminal deleted successfully.' });
  });
});
app.post('/api/wanted-response', (req, res) => {
  const { wanted_id, location, time, person, contact, details, aadhaar, organization, designation } = req.body;
  if (!wanted_id || !location || !person || !contact || !aadhaar || !organization || !designation) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }
  const sql = 'INSERT INTO wanted_responses (wanted_id, location, time, person, contact, details, aadhaar, organization, designation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [wanted_id, location, time, person, contact, details, aadhaar, organization, designation], (err, result) => {
    if (err) {
      console.error('Error saving response:', err);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    res.json({ success: true, message: 'Response submitted successfully.' });
  });
});
app.get('/api/wanted', (req, res) => {
  const sql = 'SELECT * FROM wanted_criminals ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching wanted criminals:', err);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    res.json({ success: true, data: results });
  });
});
app.post('/api/wanted', upload.single('photo'), (req, res) => {
  const { name, age, gender, crime, lastSeen, contact } = req.body;
  const photoPath = req.file ? '/uploads/' + req.file.filename : '';

  const sql = 'INSERT INTO wanted_criminals (photo, name, age, gender, crime, last_seen_location, contact) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [photoPath, name, age, gender, crime, lastSeen, contact], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    res.json({ success: true, message: 'Wanted criminal added successfully.' });
  });
});

// Start server
const PORT = 3002;
app.listen(PORT, () => {
      app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
  console.log(`Wanted add server running on port ${PORT}`);
});
