const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

// Middleware'ler
app.use(cors());
app.use(express.json());

// Rotalar
app.use('/api/auth', authRoutes); 
app.use('/api/appointments', appointmentRoutes);

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Çamaşırhane Randevu Sistemi API Çalışıyor! 🚀' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});