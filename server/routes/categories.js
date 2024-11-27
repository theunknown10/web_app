const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Category = require('../models/Category');

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

// GET all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new category
router.post('/', upload.single('picture'), async (req, res) => {
  const category = new Category({
    name: req.body.name,
    description: req.body.description,
    picture: req.file ? req.file.path : ''
  });

  try {
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT (update) a category
router.put('/:id', upload.single('picture'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.name = req.body.name || category.name;
    category.description = req.body.description || category.description;

    if (req.file) {
      if (category.picture) {
        await fs.unlink(category.picture).catch(err => console.error('Error deleting old picture:', err));
      }
      category.picture = req.file.path;
    }

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (category.picture) {
      await fs.unlink(category.picture).catch(err => console.error('Error deleting picture:', err));
    }

    await Category.deleteOne({ _id: req.params.id });
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ message: 'Error deleting category', error: err.message });
  }
});

module.exports = router;