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
    const booking = await Booking.findById(bookingId);

    if (!booking) return res.status(404).json({ error: 'booking not found' });
    if (booking.status === 'success') return res.status(400).json({ detail: 'booking already completed' });

    const payload = {
      amount: String(parseInt(booking.propertyId.price * 100)), // Convert to agorot
      currency: 'ILS',
      email: "test@gmail.com", // or from auth middleware
      callback_url: 'https://your-app.com/payment-success',
      webhook_url: 'https://your-app.com/api/payments/webhook'
    };

    const response = await axios.post(
      `${process.env.LAHZA_API_URL}/transaction/initialize`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.LAHZA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data.data;
    const payment = new Payment({
      bookingId: booking._id,
      amount: booking.propertyId.price,
      currency: 'ILS',
      status: 'pending',
      transaction_id : data.reference,
      transaction_type : 'payment'
    });
    // Save transaction ID and status
    
    res.json({
      checkout_url: data.authorization_url,
      transaction_id: data.reference
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Payment initiation failed' });
  }
});

// POST /api/payments/webhook
router.post('/webhook', async (req, res) => {
  const { transaction_id, status } = req.body;

  try {
    const payment = await Payment.findOne({ transaction_id });

    if (payment) {
      payment.status = status;
      await payment.save();
      // you may update Booking model if needed
    }
  } catch (err) {
    console.error(err);
  }

  res.json({ detail: 'Webhook processed' });
});

module.exports = router;
