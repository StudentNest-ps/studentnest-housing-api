const express = require('express');
const router = express.Router();
const Booking = require('../models/booking.model');
const { Property } = require('../models/Property.model');
const { protect, authorize } = require('../middleware/auth.middleware');

// (Student) Book a property
router.post('/', protect, authorize('student'), async (req, res) => {
    try {
      const { propertyId, dateFrom, dateTo } = req.body;
  
      // Validate required fields
      if (!propertyId || !dateFrom || !dateTo) {
        return res.status(400).json({ message: 'All fields are required.' });
      }
  
      // Validate and parse dates
      const parsedDateFrom = new Date(dateFrom);
      const parsedDateTo = new Date(dateTo);
  
      if (isNaN(parsedDateFrom) || isNaN(parsedDateTo)) {
        return res.status(400).json({ message: 'Invalid date format. Use ISO format (YYYY-MM-DD).' });
      }
      
      console.log('Parsed Dates:',propertyId);
  
      // Optional: Check if property exists
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({ message: 'Property not found.' });
      }
  
      // Create booking
      const booking = await Booking.create({
        studentId: req.user.id,
        propertyId,
        dateFrom: parsedDateFrom,
        dateTo: parsedDateTo,
        status: 'pending'
      });
  
      res.status(201).json({ message: 'Booking created successfully.', booking });
    } catch (err) {
      console.error('Booking error:', err.message);
      res.status(500).json({ message: 'Server error.', error: err.message });
    }
  });
  

// (Student) View my bookings
router.get('/me', protect, authorize('student'), async (req, res) => {
  try {
    const bookings = await Booking.find({ studentId: req.user.id }).populate('propertyId');
    res.status(200).json(bookings);
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

    const bookings = await Booking.find({ propertyId: { $in: propertyIds } }).populate('studentId');
    res.status(200).json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel a booking
router.delete('/:id', protect, async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
  
      // Force IDs to string to compare properly
      const studentId = booking.studentId.toString();
      const loggedUserId = req.user._id?.toString() || req.user.id; // in case your token gives _id instead of id
      const userRole = req.user.role;
  
      console.log('Booking Student ID:', studentId);
      console.log('Logged in User ID:', loggedUserId);
      console.log('Logged in User Role:', userRole);
  
      // Check if user is allowed to cancel
      if (studentId !== loggedUserId && userRole !== 'owner' && userRole !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Not authorized to cancel this booking' });
      }
  
      booking.status = 'cancelled';
      await booking.save();
  
      res.status(200).json({ message: 'Booking cancelled successfully' });
    } catch (err) {
      console.error('Error cancelling booking:', err.message);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
  
  

module.exports = router;
