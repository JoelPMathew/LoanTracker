const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['LOAN_APPLIED', 'LOAN_APPROVED', 'LOAN_REJECTED', 'PAYMENT_MADE'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    amount: {
        type: Number
    },
    status: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);
