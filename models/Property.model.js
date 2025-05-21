const mongoose = require('mongoose');
const propertySchema = new mongoose.Schema({
  title: String,
  description: String,
  type: { type: String, enum: ['room', 'apartment'] },
  price: Number,
  address: String,
  city: String,
  country: String,
  availableFrom: String,
  availableTo: String,
  maxGuests: String,
  city: String,
  country: String,
  image: String,
  amenities: [String],
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, 
{ timestamps: true 

});

module.exports = mongoose.model('Property', propertySchema);
