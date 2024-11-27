import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';

const API_URL = 'http://localhost:5000/api';

export default function DishManagement() {
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newDish, setNewDish] = useState({ name: '', category: '', ingredients: '', price: '', picture: null });
  const [editingDish, setEditingDish] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchDishes();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterDishes();
  }, [dishes, searchTerm, selectedCategory]);

  const fetchDishes = async () => {
    try {
      const response = await fetch(`${API_URL}/dishes`);
      if (!response.ok) {
        throw new Error('Failed to fetch dishes');
      }
      const data = await response.json();
      setDishes(data);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      setSnackbar({ open: true, message: 'Error fetching dishes', severity: 'error' });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setSnackbar({ open: true, message: 'Error fetching categories', severity: 'error' });
    }
  };

  const filterDishes = () => {
    let filtered = dishes;

    if (searchTerm) {
      filtered = filtered.filter(dish => 
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.ingredients.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(dish => dish.category._id === selectedCategory);
    }

    setFilteredDishes(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDish({ ...newDish, [name]: value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingDish({ ...editingDish, [name]: value });
  };

  const handleFileChange = (e) => {
    setNewDish({ ...newDish, picture: e.target.files[0] });
  };

  const handleEditFileChange = (e) => {
    setEditingDish({ ...editingDish, picture: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newDish.name);
    formData.append('category', newDish.category);
    formData.append('ingredients', newDish.ingredients);
    formData.append('price', newDish.price);
    if (newDish.picture) {
      formData.append('picture', newDish.picture);
    }

    try {
      const response = await fetch(`${API_URL}/dishes`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add dish');
      }

      setNewDish({ name: '', category: '', ingredients: '', price: '', picture: null });
      fetchDishes();
      setSnackbar({ open: true, message: 'Dish added successfully', severity: 'success' });
    } catch (error) {
      console.error('Error adding dish:', error);
      setSnackbar({ open: true, message: `Error adding dish: ${error.message}`, severity: 'error' });
    }
  };

  const handleEdit = (dish) => {
    setEditingDish(dish);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    const formData = new FormData();
    formData.append('name', editingDish.name);
    formData.append('category', editingDish.category);
    formData.append('ingredients', editingDish.ingredients);
    formData.append('price', editingDish.price);
    if (editingDish.picture && editingDish.picture instanceof File) {
      formData.append('picture', editingDish.picture);
    }

    try {
      const response = await fetch(`${API_URL}/dishes/${editingDish._id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update dish');
      }

      setIsEditDialogOpen(false);
      fetchDishes();
      setSnackbar({ open: true, message: 'Dish updated successfully', severity: 'success' });
    } catch (error) {
      console.error('Error updating dish:', error);
      setSnackbar({ open: true, message: `Error updating dish: ${error.message}`, severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this dish?')) {
      try {
        const response = await fetch(`${API_URL}/dishes/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete dish');
        }

        fetchDishes();
        setSnackbar({ open: true, message: 'Dish deleted successfully', severity: 'success' });
      } catch (error) {
        console.error('Error deleting dish:', error);
        setSnackbar({ open: true, message: `Error deleting dish: ${error.message}`, severity: 'error' });
      }
    }
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, bgcolor: '#ffffff', borderRadius: 2, boxShadow: 3 }}>
              <Typography variant="h5" gutterBottom color="primary">
                Add New Dish
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Name"
                  name="name"
                  value={newDish.name}
                  onChange={handleInputChange}
                  required
                />
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={newDish.category}
                    onChange={handleInputChange}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Ingredients"
                  name="ingredients"
                  value={newDish.ingredients}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Price"
                  name="price"
                  type="number"
                  value={newDish.price}
                  onChange={handleInputChange}
                  required
                />
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="raised-button-file"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="raised-button-file">
                  <Button variant="outlined" component="span" sx={{ mt: 2, mb: 2 }}>
                    Upload Picture
                  </Button>
                </label>
                {newDish.picture && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    File selected: {newDish.picture.name}
                  </Typography>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                >
                  Add Dish
                </Button>
              </form>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, bgcolor: '#ffffff', borderRadius: 2, boxShadow: 3 }}>
              <Typography variant="h5" gutterBottom color="primary">
                Dishes List
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Search dishes"
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
                  }}
                />
                <FormControl fullWidth>
                  <InputLabel id="category-filter-label">Category</InputLabel>
                  <Select
                    labelId="category-filter-label"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <List>
                {filteredDishes.map((dish) => (
                  <ListItem key={dish._id}>
                    <Card sx={{ display: 'flex', width: '100%' }}>
                      <CardMedia
                        component="img"
                        sx={{ width: 100, height: 100, objectFit: 'cover' }}
                        image={dish.picture ? `http://localhost:5000/${dish.picture}`: '/placeholder.svg'}
                        alt={dish.name}
                      />
                      <CardContent sx={{ flex: '1 0 auto' }}>
                        <Typography variant="h6">{dish.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Category: {dish.category.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Price: ${dish.price}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Button
                            startIcon={<EditIcon />}
                            onClick={() => handleEdit(dish)}
                            size="small"
                          >
                            Edit
                          </Button>
                          <Button
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDelete(dish._id)}
                            size="small"
                            color="error"
                          >
                            Delete
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <DialogTitle>Edit Dish</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            name="name"
            value={editingDish?.name || ''}
            onChange={handleEditInputChange}
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="edit-category-label">Category</InputLabel>
            <Select
              labelId="edit-category-label"
              name="category"
              value={editingDish?.category || ''}
              onChange={handleEditInputChange}
              label="Category"
            >
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Ingredients"
            name="ingredients"
            value={editingDish?.ingredients || ''}
            onChange={handleEditInputChange}
            multiline
            rows={4}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Price"
            name="price"
            type="number"
            value={editingDish?.price || ''}
            onChange={handleEditInputChange}
            required
          />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="edit-raised-button-file"
            type="file"
            onChange={handleEditFileChange}
          />
          <label htmlFor="edit-raised-button-file">
            <Button variant="outlined" component="span" sx={{ mt: 2, mb: 2 }}>
              Change Picture
            </Button>
          </label>
          {editingDish?.picture && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">
                Current picture: {typeof editingDish.picture === 'string' ? editingDish.picture : editingDish.picture.name}
              </Typography>
              {typeof editingDish.picture === 'string' && (
                <img 
                  src={`${API_URL}/uploads/${editingDish.picture}`} 
                  alt="Current dish" 
                  style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '8px' }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}