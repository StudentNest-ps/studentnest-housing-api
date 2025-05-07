const express = require('express');
const Review = require('../models/review.model');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// POST /api/reviews — Add review
router.post('/', protect, async (req, res) => {
  const { propertyId, rating, comment } = req.body;

  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only students can write reviews' });
  }

  try {
    const newReview = await Review.create({
      propertyId,
      studentId: req.user.id,
      rating,
      comment
    });
    res.status(201).json(newReview);
  } catch (err) {
    console.error('Review creation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/reviews/:propertyId — Get reviews for a property
router.get('/:propertyId', async (req, res) => {
  try {
    const reviews = await Review.find({ propertyId: req.params.propertyId }).populate('studentId', 'username');
    res.status(200).json(reviews);
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/reviews/:id — Author or admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const isAuthor = review.studentId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
