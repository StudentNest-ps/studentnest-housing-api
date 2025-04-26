const express = require('express');
const router = express.Router();
const Property = require('../models/Property.model');
const { protect, authorize } = require('../middleware/auth.middleware');

// POST /api/properties — Owner only
router.post('/', protect, authorize('owner'), async (req, res) => {
    try {
      const property = await Property.create(req.body);
      res.status(201).json(property);
    } catch (err) {
      res.status(500).json({ message: 'Failed to create property', error: err.message });
    }
  });

// GET /api/properties — Public
router.get('/', async (req, res) => {
  const properties = await Property.find();
  res.status(200).json(properties);
});

// GET /api/properties/:id — Public
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.status(200).json(property);
  } catch {
    res.status(400).json({ message: 'Invalid ID' });
  }
});

// PUT /api/properties/:id — Owner only
router.put('/:id', protect, authorize('owner'), async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ message: 'Not found' });
  if (property.ownerId.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Not your property' });

  Object.assign(property, req.body);
  await property.save();
  res.status(200).json(property);
});

// DELETE /api/properties/:id — Owner or Admin
router.delete('/:id', protect, authorize('owner', 'admin'), async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ message: 'Not found' });

  // If owner, ensure it's theirs
  if (req.user.role === 'owner' && property.ownerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not your property' });
  }

  await property.deleteOne();
  res.status(200).json({ message: 'Property deleted' });
});

module.exports = router;
