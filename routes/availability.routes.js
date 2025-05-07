const express = require('express');
const Property = require('../models/Property.model');
const Booking = require('../models/booking.model');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/properties/:id/availability — See booked & blocked dates
router.get('/:id/availability', async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      propertyId: req.params.id,
      status: { $ne: 'cancelled' }
    });

    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // Gather all booked date ranges
    const bookedDates = bookings.flatMap(b => {
      const from = new Date(b.dateFrom);
      const to = new Date(b.dateTo);
      const dates = [];
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
      return dates;
    });

    const blockedDates = property.blockedDates || [];

    res.status(200).json({
      bookedDates,
      blockedDates
    });
  } catch (err) {
    console.error('Availability error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/properties/:id/block-dates — (Owner) Mark unavailable dates
router.post('/:id/block-dates', protect, async (req, res) => {
  const { dates } = req.body;
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // Ensure only owner can mark dates
    if (req.user.role !== 'owner' || property.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const uniqueDates = [...new Set([...(property.blockedDates || []), ...dates.map(d => new Date(d))])];

    property.blockedDates = uniqueDates;
    await property.save();

    res.status(200).json({ message: 'Dates blocked successfully', blockedDates: property.blockedDates });
  } catch (err) {
    console.error('Block dates error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
