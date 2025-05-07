const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  seen: { type: Boolean, default: false },
  type: { type: String, enum: ['system', 'message'], default: 'system' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
