const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  dateFrom: { type: Date, required: true },
  dateTo: { type: Date, required: true },
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'already_booked'],
    default: 'pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
