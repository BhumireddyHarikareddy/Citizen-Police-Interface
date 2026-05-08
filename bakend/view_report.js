// Express server for viewing and updating crime reports
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // change as needed
  password: '', // change as needed
  database: 'police'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database.');
});

// Get all reports
app.get('/api/reports', (req, res) => {
  db.query('SELECT * FROM crime_reports', (err, results) => {
    if (err) {
      console.error('Error fetching reports:', err);
      return res.status(500).json([]);
    }
    res.json(results);
  });
});

// Toggle status (Pending <-> Solved)
app.patch('/api/reports/:id/toggle-status', (req, res) => {
  const id = req.params.id;
  db.query('SELECT status FROM crime_reports WHERE id = ?', [id], (err, results) => {
    if (err || !results.length) {
      return res.status(404).json({ success: false });
    }
    const current = results[0].status === 'Solved' ? 'Pending' : 'Solved';
    db.query('UPDATE crime_reports SET status = ? WHERE id = ?', [current, id], (err2) => {
      if (err2) return res.status(500).json({ success: false });
      res.json({ success: true });
    });
  });
});

const PORT = 3004;
app.listen(PORT, () => {
  console.log(`View report server running on port ${PORT}`);
});
