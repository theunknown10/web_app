const mongoose = require('mongoose');

const personnelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  picture: { type: String },
});

module.exports = mongoose.model('Personnel', personnelSchema);