import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  Button,
  Grid,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Paper,
  Tab,
  Tabs,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { CheckCircle, AttachMoney } from '@mui/icons-material';
import OrderView from './OrderView';

const API_URL = 'http://localhost:5000/api';

export default function NewOrder() {
  const [tables, setTables] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tablesWithOrders, setTablesWithOrders] = useState([]);
  const [servedTables, setServedTables] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const [viewingOrder, setViewingOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchTables(),
        fetchDishes(),
        fetchCategories(),
        fetchActiveOrders(),
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Failed to fetch initial data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await fetch(`${API_URL}/tables`);
      if (!response.ok) throw new Error('Failed to fetch tables');
      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setError('Failed to fetch tables. Please try again later.');
    }
  };

  const fetchDishes = async () => {
    try {
      const response = await fetch(`${API_URL}/dishes`);
      if (!response.ok) throw new Error('Failed to fetch dishes');
      const data = await response.json();
      setDishes(data);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      setError('Failed to fetch dishes. Please try again later.');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories. Please try again later.');
    }
  };

  const fetchActiveOrders = async () => {
    try {
      console.log('Fetching active orders...');
      const response = await fetch(`${API_URL}/orders/active`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const activeOrders = await response.json();
      console.log('Active orders fetched:', activeOrders);

      const tablesWithActiveOrders = activeOrders
        .filter(order => order.status === 'active' && order.table && order.table._id)
        .map(order => order.table._id);
      const tablesWithServedOrders = activeOrders
        .filter(order => order.status === 'served' && order.table && order.table._id)
        .map(order => order.table._id);
      
      setTablesWithOrders(tablesWithActiveOrders);
      setServedTables(tablesWithServedOrders);
    } catch (error) {
      console.error('Error fetching active orders:', error);
      setSnackbar({ open: true, message: `Failed to fetch active orders: ${error.message}`, severity: 'error' });
    }
  };

  const handleTableSelect = async (table) => {
    if (tablesWithOrders.includes(table._id) || servedTables.includes(table._id)) {
      try {
        const response = await fetch(`${API_URL}/orders/latest/${table._id}`);
        if (!response.ok) throw new Error('Failed to fetch latest order');
        const latestOrderData = await response.json();
        setViewingOrder(latestOrderData);
        setSelectedTable(table);
      } catch (error) {
        console.error('Error fetching latest order:', error);
        setSnackbar({ open: true, message: 'Failed to fetch latest order', severity: 'error' });
      }
    } else {
      setSelectedTable(table);
      setOrder([]);
    }
  };

  const handleCancelOrder = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/${viewingOrder._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      setSnackbar({ open: true, message: 'Order cancelled successfully', severity: 'success' });
      setViewingOrder(null);
      
      setTablesWithOrders(prevTables => prevTables.filter(tableId => tableId !== viewingOrder.table._id));
      setServedTables(prevTables => prevTables.filter(tableId => tableId !== viewingOrder.table._id));
      
      setSelectedTable(null);
      
      fetchActiveOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      setSnackbar({ open: true, message: 'Failed to cancel order', severity: 'error' });
    }
  };

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddToOrder = (dish) => {
    const existingItem = order.find(item => item.dish._id === dish._id);
    if (existingItem) {
      setOrder(order.map(item =>
        item.dish._id === dish._id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setOrder([...order, { dish, quantity: 1 }]);
    }
  };

  const handleRemoveFromOrder = (dish) => {
    const existingItem = order.find(item => item.dish._id === dish._id);
    if (existingItem.quantity > 1) {
      setOrder(order.map(item =>
        item.dish._id === dish._id ? { ...item, quantity: item.quantity - 1 } : item
      ));
    } else {
      setOrder(order.filter(item => item.dish._id !== dish._id));
    }
  };

  const handleDeleteFromOrder = (dish) => {
    setOrder(order.filter(item => item.dish._id !== dish._id));
  };

  const handleSubmitOrder = async () => {
    try {
      console.log('Submitting order:', { table: selectedTable._id, items: order });
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table: selectedTable._id,
          items: order.map(item => ({
            dish: item.dish._id,
            quantity: item.quantity
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit order');
      }

      const newOrder = await response.json();
      console.log('Order submitted successfully:', newOrder);

      setTablesWithOrders(prev => [...prev, selectedTable._id]);

      setOrder([]);
      setSelectedTable(null);

      setSnackbar({ open: true, message: `Order submitted successfully`, severity: 'success' });

      fetchActiveOrders();
    } catch (error) {
      console.error('Error submitting order:', error);
      setSnackbar({ open: true, message: `Failed to submit order: ${error.message}`, severity: 'error' });
    }
  };

  const handleEditOrder = () => {
    setEditingOrder(viewingOrder);
    setSelectedTable(viewingOrder.table);
    setOrder(viewingOrder.items);
    setViewingOrder(null);
  };

  const handleUpdateOrder = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/${editingOrder._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table: selectedTable._id,
          items: order.map(item => ({
            dish: item.dish._id,
            quantity: item.quantity
          })),
          status: editingOrder.status // Preserve the current status
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order');
      }

      const updatedOrder = await response.json();
      console.log('Order updated successfully:', updatedOrder);

      setEditingOrder(null);
      setSelectedTable(null);
      setOrder([]);

      setSnackbar({ open: true, message: `Order updated successfully`, severity: 'success' });

      fetchActiveOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      setSnackbar({ open: true, message: `Failed to update order: ${error.message}`, severity: 'error' });
    }
  };

  const handleServedOrder = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/${viewingOrder._id}/serve`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to mark order as served');
      }

      const updatedOrder = await response.json();
      setViewingOrder(updatedOrder);
      setServedTables(prev => [...prev, updatedOrder.table._id]);
      setTablesWithOrders(prev => prev.filter(tableId => tableId !== updatedOrder.table._id));
      setSnackbar({ open: true, message: 'Order marked as served', severity: 'success' });
      fetchActiveOrders();
    } catch (error) {
      console.error('Error marking order as served:', error);
      setSnackbar({ open: true, message: 'Failed to mark order as served', severity: 'error' });
    }
  };

  const handlePaidOrder = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/${viewingOrder._id}/pay`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to mark order as paid');
      }

      const updatedOrder = await response.json();
      setViewingOrder(null);
      setTablesWithOrders(prev => prev.filter(tableId => tableId !== updatedOrder.table._id));
      setServedTables(prev => prev.filter(tableId => tableId !== updatedOrder.table._id));
      setSelectedTable(null);
      setSnackbar({ open: true, message: 'Order marked as paid', severity: 'success' });
      fetchActiveOrders();
    } catch (error) {
      console.error('Error marking order as paid:', error);
      setSnackbar({ open: true, message: 'Failed to mark order as paid', severity: 'error' });
    }
  };

  const filteredDishes = dishes.filter(dish => 
    (selectedCategory === 'all' || dish.category._id === selectedCategory) &&
    dish.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        {editingOrder ? 'Edit Order' : 'New Order'}
      </Typography>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 4 }}>
          <Typography color="error">{error}</Typography>
          <Button onClick={fetchInitialData} variant="contained" sx={{ mt: 2 }}>
            Retry
          </Button>
        </Box>
      ) : (
        <>
          {!selectedTable && !viewingOrder ? (
            <Box>
              <Typography variant="h5" sx={{ mb: 2 }}>Select a Table</Typography>
              <Grid container spacing={2}>
                {tables.map((table) => (
                  <Grid item key={table._id} xs={4} sm={3} md={2}>
                    <Button
                      variant="outlined"
                      onClick={() => handleTableSelect(table)}
                      sx={{
                        width: '100%',
                        height: '100px',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        backgroundColor: servedTables.includes(table._id) 
                          ? 'green' 
                          : tablesWithOrders.includes(table._id) 
                            ? 'yellow' 
                            : 'inherit',
                      }}
                    >
                      {table.number}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : viewingOrder ? (
            <OrderView
              order={viewingOrder}
              onEdit={handleEditOrder}
              onCancel={handleCancelOrder}
              onBack={() => {
                setViewingOrder(null);
                setSelectedTable(null);
              }}
              onServed={handleServedOrder}
              onPaid={handlePaidOrder}
            />
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2, mb: 2 }}>
<Typography variant="h6" sx={{ mb: 2 }}>
                    Table {selectedTable.number} - Select Dishes
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search dishes..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    sx={{ mb: 2 }}
                  />
                  <Tabs
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ mb: 2 }}
                  >
                    <Tab label="All" value="all" />
                    {categories.map((category) => (
                      <Tab key={category._id} label={category.name} value={category._id} />
                    ))}
                  </Tabs>
                  <List>
                    {filteredDishes.map((dish) => (
                      <ListItem key={dish._id}>
                        <ListItemText
                          primary={dish.name}
                          secondary={`${dish.category.name} - $${dish.price}`}
                        />
                        <ListItemSecondaryAction>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleAddToOrder(dish)}
                          >
                            Add to Order
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Current Order
                  </Typography>
                  <List>
                    {order.map((item) => (
                      <ListItem key={item.dish._id}>
                        <ListItemText
                          primary={item.dish.name}
                          secondary={`$${item.dish.price} x ${item.quantity}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton onClick={() => handleAddToOrder(item.dish)}>
                            <AddIcon />
                          </IconButton>
                          <IconButton onClick={() => handleRemoveFromOrder(item.dish)}>
                            <RemoveIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteFromOrder(item.dish)}>
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Total: ${order.reduce((sum, item) => sum + item.dish.price * item.quantity, 0).toFixed(2)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      onClick={() => {
                        setSelectedTable(null);
                        setOrder([]);
                        setEditingOrder(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={editingOrder ? handleUpdateOrder : handleSubmitOrder}
                      disabled={order.length === 0}
                    >
                      {editingOrder ? 'Update Order' : 'Submit Order'}
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Box>
  );
}

