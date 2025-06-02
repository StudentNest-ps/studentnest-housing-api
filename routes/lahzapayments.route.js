const express = require('express');
const axios = require('axios');
const router = express.Router();
const Payment = require('../models/Payment.model'); // your payment model
const Booking = require('../models/booking.model'); // your booking model
require('dotenv').config();

// POST /api/payments/initiate/:paymentId
router.post('/initiate/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Populate property details
    const booking = await Booking.findById(bookingId).populate('propertyId');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (['pending', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ detail: 'You cannot pay for this booking' });
    }

    if (!booking.propertyId || typeof booking.propertyId.price !== 'number') {
      return res.status(400).json({ error: 'Property price not found' });
    }

    const amountInAgorot = Math.round(booking.propertyId.price * 100); // ILS to agorot

    const payload = {
      amount: amountInAgorot.toString(),
      currency: 'ILS',
      email: 'test@gmail.com', // Ideally use: req.user.email (if you have auth middleware)
      callback_url: `${process.env.FRONTEND_URL}/payment-success`,
      webhook_url: 'https://your-app.com/api/payments/webhook'
    };

    const response = await axios.post(
      `${process.env.LAHZA_API_URL}transaction/initialize`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.LAHZA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data.data;

    // Create a new payment record
    const payment = new Payment({
      bookingId: booking._id,
      studentId: booking.studentId,
      amount: booking.propertyId.price,
      currency: 'ILS',
      status: 'pending',
      transaction_id: data.reference,
      transaction_type: 'payment'
    });

    await payment.save();

    res.json({
      checkout_url: data.authorization_url,
      transaction_id: data.reference
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Payment initiation failed', detail: err?.response?.data || err.message });
  }
});

// POST /api/payments/webhook
router.post('/webhook', async (req, res) => {
  try {
    const event = req.body;

    console.log(" Lahza Webhook Event:", event);

    if (!event.reference || event.status !== 'success') {
      return res.status(400).json({ error: 'Invalid webhook event' });
    }

    // Find payment by transaction_id (i.e., Lahza reference)
    const payment = await Payment.findOne({ transaction_id: event.reference });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update payment status
    payment.status = 'completed';
    await payment.save();

    res.status(200).json({ message: 'Payment marked as completed' });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});


module.exports = router;
