// Express backend for login functionality
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // update as needed
  database: 'police' // update as needed
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL (login)');
});

// POST /api/login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Missing username or password.' });
  }
  // Check credentials in 'police_users' table
  const sql = 'SELECT * FROM police_users WHERE username = ? AND password = ? LIMIT 1';
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    if (results.length === 1) {
      res.json({ success: true, user: results[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
  });
});

// Start server
const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Login server running on port ${PORT}`);
});
