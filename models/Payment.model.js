const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  transaction_type: { type: String, enum: ['payment', 'payout'] },
  transaction_id: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  status: String
});

module.exports = mongoose.model('Payment', paymentSchema);
