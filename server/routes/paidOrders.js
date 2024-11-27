const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// GET all paid orders
router.get('/', async (req, res) => {
  try {
    const paidOrders = await Order.find({ status: 'paid' })
      .populate('table')
      .populate('items.dish')
      .sort({ updatedAt: -1 });  // Sort by most recent first

    const formattedOrders = paidOrders.map(order => ({
      id: order._id,
      date: order.updatedAt,
      table: order.table.number,
      items: order.items.map(item => `${item.quantity}x ${item.dish.name}`).join(', '),
      total: order.items.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0)
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching paid orders:', error);
    res.status(500).json({ message: 'Error fetching paid orders', error: error.message });
  }
});

module.exports = router;
