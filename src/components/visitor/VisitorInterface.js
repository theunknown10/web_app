import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Restaurant as RestaurantIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const API_URL = 'http://localhost:5000/api';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#1a237e',
}));

const TableButton = styled(Button)(({ theme, selected }) => ({
  width: 100,
  height: 100,
  margin: theme.spacing(1),
  borderRadius: '50%',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  backgroundColor: selected ? theme.palette.secondary.main : theme.palette.primary.main,
  '&:hover': {
    backgroundColor: selected ? theme.palette.secondary.dark : theme.palette.primary.dark,
  },
}));

const DishCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(2),
}));

export default function VisitorInterface() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [order, setOrder] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchTables();
    fetchCategories();
    fetchDishes();
  }, []);

  useEffect(() => {
    filterDishes();
  }, [dishes, searchTerm, tabValue]);

  const fetchTables = async () => {
    try {
      const response = await fetch(`${API_URL}/tables`);
      if (!response.ok) throw new Error('Failed to fetch tables');
      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setSnackbar({ open: true, message: 'Error fetching tables', severity: 'error' });
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
      setSnackbar({ open: true, message: 'Error fetching categories', severity: 'error' });
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
      setSnackbar({ open: true, message: 'Error fetching dishes', severity: 'error' });
    }
  };

  const filterDishes = () => {
    let filtered = dishes;
    if (searchTerm) {
      filtered = filtered.filter(dish => 
        dish.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (tabValue !== 0) { // 0 is "All" category
      filtered = filtered.filter(dish => dish.category._id === categories[tabValue - 1]._id);
    }
    setFilteredDishes(filtered);
  };

  const handleTableSelect = (table) => {
    setSelectedTable(table);
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
    if (!selectedTable) {
      setSnackbar({ open: true, message: 'Please select a table first', severity: 'warning' });
      return;
    }
    if (order.length === 0) {
      setSnackbar({ open: true, message: 'Your order is empty', severity: 'warning' });
      return;
    }
    // Here you would typically send the order to your backend
    console.log('Submitting order:', { table: selectedTable, items: order });
    setSnackbar({ open: true, message: 'Order submitted successfully', severity: 'success' });
    setOrder([]);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <StyledAppBar position="static">
        <Toolbar>
          <RestaurantIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Luxe Hotel Restaurant
          </Typography>
        </Toolbar>
      </StyledAppBar>

      <Container sx={{ mt: 4 }}>
        {!selectedTable ? (
          <Box>
            <Typography variant="h4" gutterBottom>
              Please select a table:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {tables.map((table) => (
                <TableButton
                  key={table._id}
                  onClick={() => handleTableSelect(table)}
                  variant="contained"
                  color="primary"
                >
                  {table.number}
                </TableButton>
              ))}
            </Box>
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom>
                Menu for Table {selectedTable.number}
              </Typography>
              <TextField
                fullWidth
                margin="normal"
                label="Search dishes"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 2 }}
              >
                <Tab label="All" />
                {categories.map((category) => (
                  <Tab key={category._id} label={category.name} />
                ))}
              </Tabs>
              {filteredDishes.map((dish) => (
                <DishCard key={dish._id}>
                  <CardMedia
                    component="img"
                    sx={{ width: 151 }}
                    image={dish.picture ? `${API_URL}/${dish.picture}` : '/placeholder.svg'}
                    alt={dish.name}
                  />
                  <CardContent sx={{ flex: '1 0 auto' }}>
                    <Typography component="div" variant="h5">
                      {dish.name}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" component="div">
                      {dish.ingredients}
                    </Typography>
                    <Typography variant="h6" color="primary" component="div">
                      ${dish.price}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => handleAddToOrder(dish)}
                      sx={{ mt: 1 }}
                    >
                      Add to Order
                    </Button>
                  </CardContent>
                </DishCard>
              ))}
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h5" gutterBottom>
                Your Order
              </Typography>
              <List>
                {order.map((item) => (
                  <ListItem key={item.dish._id}>
                    <ListItemText
                      primary={item.dish.name}
                      secondary={`$${item.dish.price} x ${item.quantity}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="add" onClick={() => handleAddToOrder(item.dish)}>
                        <AddIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="remove" onClick={() => handleRemoveFromOrder(item.dish)}>
                        <RemoveIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteFromOrder(item.dish)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <Typography variant="h6" align="right" sx={{ mt: 2 }}>
                Total: ${order.reduce((total, item) => total + item.dish.price * item.quantity, 0).toFixed(2)}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSubmitOrder}
                sx={{ mt: 2 }}
              >
                Submit Order
              </Button>
            </Grid>
          </Grid>
        )}
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}