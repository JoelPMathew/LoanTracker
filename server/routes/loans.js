const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Loan = require('../models/Loan');
const Activity = require('../models/Activity');
const LoanType = require('../models/LoanType');
const Repayment = require('../models/Repayment');

// @route   POST api/loans
// @desc    Apply for a loan
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { amount, tenure, type, borrowerEmail } = req.body;

        // Determine Borrower ID
        let borrowerId = req.user.id;
        if (req.user.role === 'ADMIN') {
            if (!borrowerEmail) {
                return res.status(400).json({ message: 'Borrower email is required for Admin-created loans' });
            }
            const borrower = await require('../models/User').findOne({ email: borrowerEmail.toLowerCase() });
            if (!borrower) {
                return res.status(404).json({ message: 'Borrower not found with that email' });
            }
            borrowerId = borrower._id;
        }

        // Fetch interest rate from normalized LoanType model
        const loanTypeData = await LoanType.findOne({ name: type });
        if (!loanTypeData) {
            return res.status(400).json({ message: 'Invalid loan type selected' });
        }
        const interestRate = loanTypeData.baseInterestRate;

        // Business Logic: Credit Check Simulation
        // In a real app, this would call an external credit bureau API
        const creditScore = Math.floor(Math.random() * (850 - 300 + 1)) + 300;

        if (creditScore < 650) {
            return res.status(400).json({
                message: `Loan rejected due to low credit score (${creditScore}). Minimum required: 650`
            });
        }

        // Business Logic: Calculate Monthly Payment (EMI)
        // Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
        const r = interestRate / 12 / 100;
        const n = tenure;
        const emi = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

        // Calculate start date (today)
        const startDate = new Date();

        const newLoan = new Loan({
            borrowerId,
            amount,
            remainingBalance: amount,
            interestRate,
            tenure,
            startDate,
            typeId: loanTypeData._id,
            status: 'PENDING',
            nextPaymentAmount: emi.toFixed(2),
            nextPaymentDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
        });

        const loan = await newLoan.save();

        // Log Activity
        const activity = new Activity({
            userId: req.user.id,
            type: 'LOAN_APPLIED',
            title: `Applied for ${type} Loan`,
            amount: amount,
            status: 'PENDING'
        });
        await activity.save();

        res.json(loan);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/loans
// @desc    Get all loans (Admin) or User loans (Borrower)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        let loans;
        if (req.user.role === 'ADMIN') {
            console.log('Admin fetching all loans');
            loans = await Loan.find().populate('borrowerId', 'name').populate('typeId').sort({ date: -1 });
        } else {
            console.log(`User ${req.user.id} fetching their loans`);
            loans = await Loan.find({ borrowerId: req.user.id }).populate('borrowerId', 'name').populate('typeId').sort({ date: -1 });
        }
        console.log(`Found ${loans.length} loans`);
        res.json(loans);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/loans/:id
// @desc    Update loan status (Admin only)
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const loan = await Loan.findById(req.params.id);
        if (!loan) return res.status(404).json({ message: 'Loan not found' });

        const { status } = req.body;
        const oldStatus = loan.status;
        if (status) loan.status = status;

        if (status === 'ACTIVE' && oldStatus !== 'ACTIVE') {
            const installments = [];
            const monthlyAmount = loan.nextPaymentAmount;

            for (let i = 1; i <= loan.tenure; i++) {
                const dueDate = new Date(); // Use current date as base
                dueDate.setMonth(dueDate.getMonth() + i);

                installments.push({
                    loanId: loan._id,
                    borrowerId: loan.borrowerId,
                    amount: monthlyAmount,
                    dueDate: dueDate,
                    status: 'PENDING'
                });
            }
            await Repayment.insertMany(installments);
            console.log(`Generated ${loan.tenure} installments for loan ${loan._id}`);
        }

        await loan.save();

        // Log Activity if status changed
        if (status && status !== oldStatus) {
            const activityType = status === 'ACTIVE' ? 'LOAN_APPROVED' : (status === 'REJECTED' ? 'LOAN_REJECTED' : null);
            if (activityType) {
                const activity = new Activity({
                    userId: loan.borrowerId,
                    type: activityType,
                    title: `Loan ${status === 'ACTIVE' ? 'Approved' : 'Rejected'}`,
                    amount: loan.amount,
                    status: status
                });
                await activity.save();
            }
        }

        res.json(loan);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/loans/:id/pay
// @desc    Record a payment for a loan
// @access  Private
router.post('/:id/pay', auth, async (req, res) => {
    try {
        if (req.user.role !== 'BORROWER') {
            return res.status(403).json({ message: 'Access denied. Only borrowers can initiate payments.' });
        }

        const { amount, paymentMethod, proof } = req.body;
        const loan = await Loan.findById(req.params.id);
        if (!loan) return res.status(404).json({ message: 'Loan not found' });

        // Find the oldest pending or rejected installment to attach this payment to
        const installment = await Repayment.findOne({
            loanId: loan._id,
            status: { $in: ['PENDING', 'REJECTED', 'OVERDUE'] }
        }).sort({ dueDate: 1 });

        console.log(`DEBUG: Found installment ${installment ? installment._id : 'NONE'} for loan ${loan._id}`);

        if (!installment) {
            return res.status(400).json({ message: 'No pending installments found to pay against.' });
        }

        installment.status = 'PENDING_ADMIN_CONFIRMATION';
        installment.paymentMethod = paymentMethod || 'Manual/Transfer';
        installment.proof = proof;
        installment.paidDate = new Date();
        await installment.save();

        // Log Activity
        const activity = new Activity({
            userId: loan.borrowerId,
            type: 'PAYMENT_MADE',
            title: `Payment Initiated: $${amount}${proof ? ' (Ref: ' + proof + ')' : ''}`,
            amount: amount,
            status: 'PENDING_CONFIRMATION'
        });
        await activity.save();

        res.json({ message: 'Payment initiated. Waiting for Admin confirmation.', installment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// @route   POST api/loans/repayments/:id/confirm
// @desc    Admin confirm or reject payment
// @access  Private (Admin)
router.post('/repayments/:id/confirm', auth, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied. Only admins can confirm payments.' });
        }

        const { status, remarks } = req.body; // status: 'CONFIRMED' or 'REJECTED'
        const repayment = await Repayment.findById(req.params.id);
        if (!repayment) return res.status(404).json({ message: 'Repayment not found' });

        const loan = await Loan.findById(repayment.loanId);
        if (!loan) return res.status(404).json({ message: 'Loan not found' });

        if (status === 'CONFIRMED') {
            repayment.status = 'CONFIRMED';
            // repayment.paidDate is already set when user initiated

            // Update Loan Balance
            loan.remainingBalance = Math.max(0, loan.remainingBalance - repayment.amount);
            loan.repaidPercentage = Math.round(((loan.amount - loan.remainingBalance) / loan.amount) * 100);

            if (loan.remainingBalance <= 0) {
                loan.status = 'PAID';
            }
            await loan.save();

            // Log Activity
            const activity = new Activity({
                userId: loan.borrowerId,
                type: 'PAYMENT_MADE',
                title: `Payment Confirmed: $${repayment.amount}`,
                amount: repayment.amount,
                status: 'CONFIRMED'
            });
            await activity.save();

        } else if (status === 'REJECTED') {
            repayment.status = 'REJECTED';
            repayment.remarks = remarks;

            // Log Activity
            const activity = new Activity({
                userId: loan.borrowerId,
                type: 'PAYMENT_MADE', // Or LOAN_REJECTED? sticking to PAYMENT_MADE for transaction context
                title: `Payment Rejected: $${repayment.amount}`,
                amount: repayment.amount,
                status: 'REJECTED'
            });
            await activity.save();
        } else {
            return res.status(400).json({ message: 'Invalid status' });
        }

        await repayment.save();
        res.json({ repayment });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// @route   GET api/loans/:id/repayments
// @desc    Get all repayments for a loan
// @access  Private
router.get('/:id/repayments', auth, async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);
        if (!loan) return res.status(404).json({ message: 'Loan not found' });

        if (req.user.role !== 'ADMIN' && loan.borrowerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const repayments = await Repayment.find({ loanId: req.params.id }).sort({ dueDate: 1 });
        res.json(repayments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// @route   GET api/loans/repayments/pending
// @desc    Get all pending repayments for admin approval
// @access  Private (Admin)
router.get('/repayments/pending', auth, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const repayments = await Repayment.find({ status: 'PENDING_ADMIN_CONFIRMATION' })
            .populate('borrowerId', 'name email')
            .populate('loanId', 'amount typeId') // Populate loan details if needed
            .sort({ paidDate: -1 });

        res.json(repayments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
