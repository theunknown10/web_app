const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Dish = require('../models/Dish');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// GET all dishes
router.get('/', async (req, res) => {
  try {
    const dishes = await Dish.find().populate('category');
    res.json(dishes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new dish
router.post('/', upload.single('picture'), async (req, res) => {
  const dish = new Dish({
    name: req.body.name,
    category: req.body.category,
    ingredients: req.body.ingredients,
    price: req.body.price,
    picture: req.file ? req.file.path : ''
  });

  try {
    const newDish = await dish.save();
    res.status(201).json(newDish);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT (update) a dish
router.put('/:id', upload.single('picture'), async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    dish.name = req.body.name || dish.name;
    dish.category = req.body.category || dish.category;
    dish.ingredients = req.body.ingredients || dish.ingredients;
    dish.price = req.body.price || dish.price;

    if (req.file) {
      if (dish.picture) {
        await fs.unlink(dish.picture).catch(err => console.error('Error deleting old picture:', err));
      }
      dish.picture = req.file.path;
    }

    const updatedDish = await dish.save();
    const populatedDish = await Dish.findById(updatedDish._id).populate('category');
    res.json(populatedDish);
  } catch (err) {
    console.error('Error updating dish:', err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE a dish
router.delete('/:id', async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    if (dish.picture) {
      await fs.unlink(dish.picture).catch(err => console.error('Error deleting picture:', err));
    }

    await Dish.deleteOne({ _id: req.params.id });
    res.json({ message: 'Dish deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;