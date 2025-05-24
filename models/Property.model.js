const mongoose = require('mongoose');

const propertyTypes = [ 
  { id: 'apartment', label: 'Apartment' }, 
  { id: 'house', label: 'House' }, 
  { id: 'studio', label: 'Studio' }, 
  { id: 'condo', label: 'Condominium' }, 
  { id: 'room', label: 'Room' }, 
]; 

const propertySchema = new mongoose.Schema({
  title: String,
  description: String,
  type: { type: String, enum: propertyTypes.map(type => type.id) },
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

module.exports = { Property: mongoose.model('Property', propertySchema), propertyTypes };
