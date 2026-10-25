require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mindora';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    process.exit(1);
  }
};

connectDB();

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/mood', require('./routes/moodRoutes'));
app.use('/api/movements', require('./routes/movementRoutes'));
app.use('/api/journal', require('./routes/journalRoutes'));


app.use((req, res) => {
  res.status(404).json({ error: `Not Found - ${req.originalUrl}` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] Live and listening on ${PORT}`);
});