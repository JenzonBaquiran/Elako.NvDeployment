const mongoose = require('mongoose');

const MSMESchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    clientProfilingNumber: { type: String, required: true, unique: true },
    category: { type: String, required: true, enum: ['food', 'artisan'] },
    businessName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, default: 'msme' },
    status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { collection: 'msmes' }
);

module.exports = mongoose.model('MSME', MSMESchema);