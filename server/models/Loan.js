const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    borrowerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    remainingBalance: {
        type: Number,
        required: true
    },
    interestRate: {
        type: Number,
        required: true
    },
    tenure: {
        type: Number,
        required: true // in months
    },
    startDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACTIVE', 'REJECTED', 'OVERDUE', 'PAID'],
        default: 'PENDING'
    },
    typeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LoanType',
        required: true
    },
    repaidPercentage: {
        type: Number,
        default: 0
    },
    nextPaymentDate: {
        type: Date
    },
    nextPaymentAmount: {
        type: Number
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Loan', loanSchema);
