const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportedProperty: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  reason: { type: String, required: true },
  message: String,
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
