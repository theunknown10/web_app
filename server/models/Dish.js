const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  ingredients: { type: String, required: true },
  price: { type: Number, required: true },
  picture: { type: String }
});

module.exports = mongoose.model('Dish', dishSchema);