// backend/server.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3001;


app.use(cors({
  origin: 'http://localhost:5173'
}));

//app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./seats.db');

// Create tables if not exist
db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    seats TEXT,
    yuvakmandal TEXT,
    whatsapp TEXT,
    note TEXT
)`);

// API to get booked seats
app.get('/api/booked-seats', (req, res) => {
    db.all('SELECT seats FROM bookings', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const allSeats = rows.map(r => r.seats.split(',')).flat();
        res.json({ booked: allSeats });
    });
});

// API to book seats
app.post('/api/book', (req, res) => {
  const { name, email, seats, yuvakmandal, whatsapp, note} = req.body;

  db.all('SELECT seats FROM bookings', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const alreadyBooked = rows.flatMap(row => row.seats.split(','));
    const conflict = seats.some(seat => alreadyBooked.includes(seat));

    if (conflict) {
      return res.status(409).json({ error: 'Some seats already booked' });
    }

    db.run('INSERT INTO bookings (name, email, seats, yuvakmandal, whatsapp, note) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, seats.join(','), yuvakmandal, whatsapp, note],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
      });
  });
});


app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});
