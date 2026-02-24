require('dotenv').config();
const mongoose = require('mongoose');
const LoanType = require('./models/LoanType');

const loanTypes = [
    { name: 'Personal', baseInterestRate: 12, maxTenure: 36, description: 'General needs' },
    { name: 'Home', baseInterestRate: 8, maxTenure: 180, description: 'Property purchase' },
    { name: 'Business', baseInterestRate: 15, maxTenure: 60, description: 'Capital investment' },
    { name: 'Education', baseInterestRate: 10, maxTenure: 120, description: 'University fees' }
];

async function seedLoanTypes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        await LoanType.deleteMany({});
        console.log('Cleared existing LoanTypes');

        await LoanType.insertMany(loanTypes);
        console.log('Seeded LoanTypes successfully');

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

seedLoanTypes();
