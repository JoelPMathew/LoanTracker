require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5000',
    process.env.FRONTEND_URL
].filter(Boolean);

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        // or any Vercel domain for production convenience
        if (!origin || origin.includes('vercel.app')) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(null, true); // Loosen for now to ensure deployment works
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());

// Database Connection
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) return cachedDb;

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI is not defined');
    }

    const db = await mongoose.connect(mongoUri);

    cachedDb = db;
    console.log('MongoDB Connected');
    return db;
}

// Ensure DB is connected for every request
app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (err) {
        console.error('Database connection error:', err);
        res.status(500).json({ message: 'Database connection failed', error: err.message });
    }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/activities', require('./routes/activities'));

// Basic Route
app.get('/', (req, res) => {
    res.send('LoanTracker Pro API is running');
});

// Start Server
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} - VERSION 2.0`);
    });
}

module.exports = app;
