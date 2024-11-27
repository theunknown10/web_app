const express = require('express');
const router = express.Router();
const Table = require('../models/Table');

// GET all tables
router.get('/', async (req, res) => {
  try {
    const tables = await Table.find();
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new table
router.post('/', async (req, res) => {
  const table = new Table({
    number: req.body.number,
    capacity: req.body.capacity
  });

  try {
    const newTable = await table.save();
    res.status(201).json(newTable);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT (update) a table
router.put('/:id', async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    table.number = req.body.number || table.number;
    table.capacity = req.body.capacity || table.capacity;

    const updatedTable = await table.save();
    res.json(updatedTable);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a table
router.delete('/:id', async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    await Table.deleteOne({ _id: req.params.id });
    res.json({ message: 'Table deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;