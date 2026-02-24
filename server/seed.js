require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing test users to avoid confusion
        await User.deleteMany({ email: { $in: ['admin@loantracker.com', 'bob@example.com'] } });
        console.log('Cleaned up old test users');

        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('admin123', salt);
        const bobPassword = await bcrypt.hash('bob123', salt);

        const admin = new User({
            name: 'System Admin',
            email: 'admin@loantracker.com',
            password: adminPassword,
            role: 'ADMIN'
        });

        const bob = new User({
            name: 'Bob Borrower',
            email: 'bob@example.com',
            password: bobPassword,
            role: 'BORROWER'
        });

        await admin.save();
        await bob.save();

        console.log('\nSEED COMPLETE:');
        console.log('-----------------');
        console.log('ADMIN LOGIN:');
        console.log('Email: admin@loantracker.com');
        console.log('Pass: admin123');
        console.log('\nBORROWER LOGIN:');
        console.log('Email: bob@example.com');
        console.log('Pass: bob123');
        console.log('-----------------');

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

seed();
