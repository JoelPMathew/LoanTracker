const mongoose = require('mongoose');

const loanTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    baseInterestRate: {
        type: Number,
        required: true
    },
    maxTenure: {
        type: Number,
        default: 60
    },
    description: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LoanType', loanTypeSchema);
