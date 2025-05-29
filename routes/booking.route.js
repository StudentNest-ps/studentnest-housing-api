const express = require('express');
const router = express.Router();
const Booking = require('../models/booking.model');
const { Property } = require('../models/Property.model');
const { protect, authorize } = require('../middleware/auth.middleware');

// Helper to format booking to desired response shape
const formatBooking = (b) => ({
  id: b._id.toString(),
  apartment: {
    id: b.propertyId._id.toString(),
    name: b.propertyId.title, 
    location: `${b.propertyId.city}, ${b.propertyId.country}`, 
    image: b.propertyId.image,
    owner: {
      id: b.propertyId.ownerId._id.toString(),
      name: b.propertyId.ownerId.username, 
      phone: b.propertyId.ownerId.phoneNumber, 
      email: b.propertyId.ownerId.email
    }
  },
  checkIn: b.dateFrom.toISOString(),
  checkOut: b.dateTo.toISOString(),
  guests: b.guests ?? 1,
  totalAmount: b.totalAmount ?? 0,
  status: b.status,
  bookingDate: b.createdAt.toISOString()
});



// (Student) Book a property
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { propertyId, dateFrom, dateTo } = req.body;

    if (!propertyId || !dateFrom || !dateTo) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const parsedDateFrom = new Date(dateFrom);
    const parsedDateTo = new Date(dateTo);

    if (isNaN(parsedDateFrom) || isNaN(parsedDateTo)) {
      return res.status(400).json({ message: 'Invalid date format. Use ISO format (YYYY-MM-DD).' });
    }

    const property = await Property.findById(propertyId).populate('ownerId');
    if (!property) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    const booking = await Booking.create({
      studentId: req.user.id,
      propertyId,
      dateFrom: parsedDateFrom,
      dateTo: parsedDateTo,
      status: 'pending'
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate({
        path: 'propertyId',
        populate: { path: 'ownerId' }
      });

    res.status(201).json(formatBooking(populatedBooking));
  } catch (err) {
    console.error('Booking error:', err.message);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});
// (Student) View my bookings
router.get('/me', protect, authorize('student'), async (req, res) => {
  try {
    const bookings = await Booking.find({ studentId: req.user.id })
      .populate({
        path: 'propertyId',
        populate: { path: 'ownerId' }
      });

    const formatted = bookings.map(formatBooking);
    res.status(200).json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// (Owner) View bookings for my properties
router.get('/owner', protect, authorize('owner'), async (req, res) => {
  try {
    const properties = await Property.find({ ownerId: req.user.id }).select('_id');
    const propertyIds = properties.map(p => p._id);

    const bookings = await Booking.find({ propertyId: { $in: propertyIds } })
      .populate({
        path: 'propertyId',
        populate: { path: 'ownerId' }
      });

    const formatted = bookings.map(formatBooking);
    res.status(200).json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel a booking
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'propertyId',
        populate: { path: 'ownerId' }
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const studentId = booking.studentId.toString();
    const loggedUserId = req.user._id?.toString() || req.user.id;
    const userRole = req.user.role;

    if (studentId !== loggedUserId && userRole !== 'owner' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Not authorized to cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json(formatBooking(booking));
  } catch (err) {
    console.error('Error cancelling booking:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
