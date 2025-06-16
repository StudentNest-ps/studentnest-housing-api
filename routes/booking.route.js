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
  student: {
    id: b.studentId._id.toString(),
    name: b.studentId.username,
    email: b.studentId.email,
    phone: b.studentId.phoneNumber
  },
  checkIn: b.dateFrom.toISOString(),
  checkOut: b.dateTo.toISOString(),
  totalAmount: b.totalAmount,
  status: b.status,
  bookingDate: b.createdAt.toISOString()
});

// Helper to calculate number of days between two dates
const calculateDays = (dateFrom, dateTo) => {
  const diffTime = Math.abs(dateTo - dateFrom);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

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

    if (parsedDateFrom >= parsedDateTo) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date.' });
    }

    const property = await Property.findById(propertyId).populate('ownerId');
    if (!property) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    // Check for existing bookings that overlap with the requested dates
    const confirmedBooking = await Booking.findOne({
      propertyId,
      status: 'confirmed',
      $or: [
        {
          dateFrom: { $lte: parsedDateTo },
          dateTo: { $gte: parsedDateFrom }
        }
      ]
    });
    
    if (confirmedBooking) {
      return res.status(400).json({ 
        message: 'This property is already confirmed as booked during the selected dates.',
        status: 'already_booked'
      });
    }

    // Calculate total amount based on number of days and property price
    const numberOfDays = calculateDays(parsedDateFrom, parsedDateTo);
    const totalAmount = property.price * numberOfDays;

    const booking = await Booking.create({
      studentId: req.user.id,
      propertyId,
      dateFrom: parsedDateFrom,
      dateTo: parsedDateTo,
      totalAmount,
      status: 'pending'
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate({
        path: 'propertyId',
        populate: { path: 'ownerId' }
      })
      .populate('studentId', 'username email phoneNumber');

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
      })
      .populate('studentId', 'username email phoneNumber');

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
      })
      .populate('studentId', 'username email phoneNumber');

    const formatted = bookings.map(formatBooking);
    res.status(200).json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// bookings/:id Cancel a booking
// bookings/:id — Cancel and remove a booking
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'propertyId',
        populate: { path: 'ownerId' }
      })
      .populate('studentId', 'username email phoneNumber');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const studentId = booking.studentId._id.toString();
    const loggedUserId = req.user._id?.toString() || req.user.id;
    const userRole = req.user.role;

    if (studentId !== loggedUserId && userRole !== 'owner' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Not authorized to cancel this booking' });
    }

    await booking.deleteOne(); // Deletes the booking from DB

    res.status(200).json({ message: 'Booking cancelled and deleted successfully.' });
  } catch (err) {
    console.error('Error cancelling booking:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// (Owner) Approve a booking and update overlapping bookings
router.patch('/:id/approve', protect, authorize('owner'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'propertyId',
        populate: { path: 'ownerId' }
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify that the logged-in user is the owner of the property
    if (booking.propertyId.ownerId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to approve this booking' });
    }

    // Update the approved booking status
    booking.status = 'confirmed';
    await booking.save();

    // Find and update all overlapping pending bookings to 'already_booked'
    const overlappingBookings = await Booking.find({
      propertyId: booking.propertyId._id,
      _id: { $ne: booking._id },
      status: 'pending',
      $or: [
        {
          dateFrom: { $lte: booking.dateTo },
          dateTo: { $gte: booking.dateFrom }
        }
      ]
    });

    // Update all overlapping bookings
    await Promise.all(
      overlappingBookings.map(async (overlappingBooking) => {
        overlappingBooking.status = 'already_booked';
        await overlappingBooking.save();
      })
    );

    const updatedBooking = await Booking.findById(booking._id)
      .populate({
        path: 'propertyId',
        populate: { path: 'ownerId' }
      });

    res.status(200).json(formatBooking(updatedBooking));
  } catch (err) {
    console.error('Error approving booking:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// (Owner) Reject a booking
router.patch('/:id/reject', protect, authorize('owner'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'propertyId',
        populate: { path: 'ownerId' }
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify that the logged-in user is the owner of the property
    if (booking.propertyId.ownerId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to reject this booking' });
    }

    // Update the booking status to rejected
    booking.status = 'cancelled';
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate({
        path: 'propertyId',
        populate: { path: 'ownerId' }
      });

    res.status(200).json(formatBooking(updatedBooking));
  } catch (err) {
    console.error('Error rejecting booking:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// (Owner) Clean up rejected bookings for their properties
router.delete('/cleanup/cancelled', protect, authorize('owner'), async (req, res) => {
  try {
    // Find all properties owned by the current user
    const properties = await Property.find({ ownerId: req.user.id }).select('_id');
    const propertyIds = properties.map(p => p._id);

    // Delete all rejected bookings for these properties
    const result = await Booking.deleteMany({
      propertyId: { $in: propertyIds },
      status: 'cancelled'
    });

    res.status(200).json({
      message: 'Successfully cleaned up cancelled bookings',
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('Error cleaning up cancelled bookings:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
