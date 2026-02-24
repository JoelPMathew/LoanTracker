const mongoose = require('mongoose');

const repaymentSchema = new mongoose.Schema({
    loanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan',
        required: true
    },
    borrowerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    paidDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['PENDING', 'PENDING_ADMIN_CONFIRMATION', 'CONFIRMED', 'REJECTED', 'PAID', 'OVERDUE'],
        default: 'PENDING'
    },
    paymentMethod: {
        type: String
    },
    proof: {
        type: String // URL to proof image (optional)
    },
    remarks: {
        type: String // Admin remarks for rejection/approval
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Repayment', repaymentSchema);
