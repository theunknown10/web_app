const express = require('express');
const router = express.Router();
const Order = require('../models/Order');


// Get all active and served orders
router.get('/active', async (req, res) => {
  try {
    console.log('Fetching active and served orders...');
    const activeOrders = await Order.find({ status: { $in: ['active', 'served'] } })
      .populate('table')
      .populate('items.dish');
    
    // Filter out orders with null tables
    const validOrders = activeOrders.filter(order => order.table != null);
    
    console.log(`Found ${validOrders.length} valid active/served orders`);
    res.json(validOrders);
  } catch (error) {
    console.error('Error fetching active and served orders:', error);
    res.status(500).json({ message: 'Error fetching active and served orders', error: error.message });
  }
});

// Get the latest order for a specific table
router.get('/latest/:tableId', async (req, res) => {
  try {
    const latestOrder = await Order.findOne({ 
      table: req.params.tableId, 
      status: { $in: ['active', 'served'] } 
    })
      .sort({ createdAt: -1 })
      .populate('table')
      .populate('items.dish');
    
    if (!latestOrder) {
      return res.status(404).json({ message: 'No active or served orders found for this table' });
    }
    
    res.json(latestOrder);
  } catch (error) {
    console.error('Error fetching latest order:', error);
    res.status(500).json({ message: 'Error fetching latest order', error: error.message });
  }
});

// Create a new order
router.post('/', async (req, res) => {
  try {
    console.log('Received order data:', req.body);
    const { table, items } = req.body;
    
    if (!table || !items || items.length === 0) {
      return res.status(400).json({ message: 'Invalid order data' });
    }

    const newOrder = new Order({
      table,
      items,
      status: 'active'
    });

    console.log('Creating new order:', newOrder);
    const savedOrder = await newOrder.save();
    console.log('Order saved successfully:', savedOrder);

    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('table')
      .populate('items.dish');

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ message: 'Error creating order', error: error.message });
  }
});

// Update an order
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { table, items, status } = req.body;

    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only update status if it's provided and different from the current status
    const updatedStatus = status && status !== existingOrder.status ? status : existingOrder.status;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { table, items, status: updatedStatus },
      { new: true, runValidators: true }
    ).populate('table').populate('items.dish');

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
});

// Cancel an order
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order cancelled and deleted successfully', order: deletedOrder });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Error cancelling order', error: error.message });
  }
});

// Mark an order as served
router.put('/:id/serve', async (req, res) => {
  try {
    const { id } = req.params;
    const servedOrder = await Order.findByIdAndUpdate(
      id,
      { status: 'served' },
      { new: true }
    ).populate('table').populate('items.dish');

    if (!servedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(servedOrder);
  } catch (error) {
    console.error('Error marking order as served:', error);
    res.status(500).json({ message: 'Error marking order as served', error: error.message });
  }
});

// Mark an order as paid
router.put('/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;
    const paidOrder = await Order.findByIdAndUpdate(
      id,
      { status: 'paid' },
      { new: true }
    ).populate('table').populate('items.dish');

    if (!paidOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(paidOrder);
  } catch (error) {
    console.error('Error marking order as paid:', error);
    res.status(500).json({ message: 'Error marking order as paid', error: error.message });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('table')
      .populate('items.dish');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

module.exports = router;

