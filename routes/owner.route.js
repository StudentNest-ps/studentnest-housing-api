const express = require('express');
const router = express.Router();
const Property = require('../models/Property.model');
const { protect, authorize } = require('../middleware/auth.middleware');

// Apply middleware to all routes - must be logged in and an owner
router.use(protect, authorize('owner'));

// GET /api/owner/properties/count - Get count of properties owned by the logged-in owner
router.get('/properties/count', async (req, res) => {
  try {
    const count = await Property.countDocuments({ ownerId: req.user.id });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching property count', error: error.message });
  }
});

// POST /api/owner/:ownerId/properties - Add a new property for a specific owner
router.post('/:ownerId/properties', async (req, res) => {
  try {
    // Ensure the owner can only add properties for themselves
    // if (req.params.ownerId !== req.user.id) {
    //   return res.status(403).json({ message: 'You can only add properties for your own account' });
    // }
    
    // Create the property with the owner ID from the URL
    const propertyData = {
      ...req.body,
      ownerId: req.params.ownerId
    };
    
    const property = await Property.create(propertyData);
    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create property', error: error.message });
  }
});

// PUT /api/owner/:ownerId/properties/:propertyId - Edit a property
router.put('/:ownerId/properties/:propertyId', async (req, res) => {
  try {
    // Ensure the owner can only edit their own properties
    if (req.params.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own properties' });
    }
    
    // Find the property
    const property = await Property.findById(req.params.propertyId);
    
    // Check if property exists
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Verify ownership
    if (property.ownerId.toString() !== req.params.ownerId) {
      return res.status(403).json({ message: 'This property does not belong to you' });
    }
    
    // Update the property
    Object.assign(property, req.body);
    await property.save();
    
    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update property', error: error.message });
  }
});

module.exports = router;