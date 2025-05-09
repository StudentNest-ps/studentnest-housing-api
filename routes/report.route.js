const express = require('express');
const Report = require('../models/Report.model');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');

const router = express.Router();

// POST /api/reports — Submit a report
router.post('/', protect, async (req, res) => {
  const { reportedUser, reportedProperty, reason, message } = req.body;

  if (!reportedUser && !reportedProperty) {
    return res.status(400).json({ message: 'Must report a user or property.' });
  }

  try {
    const report = new Report({
      reporter: req.user.id,
      reportedUser,
      reportedProperty,
      reason,
      message
    });
    await report.save();
    res.status(201).json({ message: 'Report submitted.' });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting report.' });
  }
});

// GET /api/reports — Admin only
router.get('/', protect, isAdmin, async (req, res) => {
  const reports = await Report.find()
    .populate('reporter', 'email username')
    .populate('reportedUser', 'email username')
    .populate('reportedProperty', 'title');

  res.json(reports);
});

module.exports = router;
