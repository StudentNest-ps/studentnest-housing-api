const express = require('express');
const Payment = require('../models/Payment.model');
const Booking = require('../models/booking.model');
const Property = require('../models/Property.model');
const User = require('../models/User.model');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();


// POST /api/payments — Pay for a booking
router.post('/', protect, async (req, res) => {
    const { bookingId, amount, paymentMethod } = req.body;
  
    try {
      const booking = await Booking.findById(bookingId);
      if (!booking) return res.status(404).json({ message: 'Booking not found' });
  
      if (booking.studentId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to pay for this booking' });
      }
  
      // Check if payment already exists for this booking
      const existingPayment = await Payment.findOne({ bookingId });
      if (existingPayment) {
        return res.status(400).json({ message: 'Payment for this booking already exists' });
      }
  
      const payment = await Payment.create({
        bookingId,
        studentId: req.user.id,
        amount,
        paymentMethod
        
      });
  
      res.status(201).json(payment);
    } catch (err) {
      console.error('Payment creation error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

 // PATCH /api/payments/:id — Update a payment (Owner/Admin only for amount & status)
router.patch('/:id', protect, async (req, res) => {
    const { amount, paymentMethod, status } = req.body;
  
    try {
      const payment = await Payment.findById(req.params.id);
      if (!payment) return res.status(404).json({ message: 'Payment not found' });
  
      // Only Admin or Owner can update sensitive fields
      if (amount !== undefined || status !== undefined) {
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
          return res.status(403).json({ message: 'Only admin or owner can update payment amount or status' });
        }
      }
  
      if (amount !== undefined) payment.amount = amount;
      if (paymentMethod !== undefined) payment.paymentMethod = paymentMethod; // Any user can update paymentMethod if needed
      if (status !== undefined) payment.status = status;
  
      const updatedPayment = await payment.save();
  
      res.status(200).json(updatedPayment);
    } catch (err) {
      console.error('Payment update error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

// GET /api/payments/history — View payment history
router.get('/history', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ studentId: req.user.id }).populate('bookingId');
    res.status(200).json(payments);
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/payments/owner-history — View payments for properties owned by owner
router.get('/owner-history', protect, async (req, res) => {
    try {
      if (req.user.role !== 'owner' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only owners or admins can view this' });
      }
  
      // Find properties owned by this owner
      const properties = await Property.find({ ownerId: req.user.id }).select('_id');
      const propertyIds = properties.map(p => p._id);
  
      if (propertyIds.length === 0) {
        return res.status(200).json([]); // No properties, no payments
      }
  
      // Find bookings for these properties
      const bookings = await Booking.find({ propertyId: { $in: propertyIds } }).select('_id');
      const bookingIds = bookings.map(b => b._id);
  
      if (bookingIds.length === 0) {
        return res.status(200).json([]); // No bookings, no payments
      }
  
      // Find payments related to these bookings
      const payments = await Payment.find({ bookingId: { $in: bookingIds } })
        .populate('bookingId')
        .populate('studentId', 'username email');
  
      res.status(200).json(payments);
    } catch (err) {
      console.error('Owner history error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

// GET /api/invoices/:bookingId — Download/preview invoice
router.get('/invoices/:bookingId', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate('propertyId studentId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.studentId._id.toString() !== req.user.id && req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this invoice' });
    }

    const invoice = {
      invoiceNumber: `INV-${booking._id.toString().slice(-6)}`,
      student: {
        name: booking.studentId.username,
        email: booking.studentId.email
      },
      property: booking.propertyId.title,
      amount: booking.propertyId.price,
      date: new Date()
    };

    res.status(200).json(invoice);
  } catch (err) {
    console.error('Invoice error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;



