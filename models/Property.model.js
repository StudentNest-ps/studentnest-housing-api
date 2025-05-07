const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: String,
  description: String,
  type: { type: String, enum: ['room', 'apartment'] },
  price: Number,
  address: String,
  blockedDates: [Date],
  location: {
    lat: Number,
    lng: Number
  },
  images: [String],
  amenities: [String],
  availability: {
    startDate: Date,
    endDate: Date
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, 
{ timestamps: true 

});

module.exports = mongoose.model('Property', propertySchema);
