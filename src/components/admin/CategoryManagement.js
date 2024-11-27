import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restaurant as RestaurantIcon,
  Category as CategoryIcon,
  SetMeal as DishIcon,
  TableBar as TableIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const StyledTab = styled(Tab)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  margin: '0 4px',
}));

const CategoryCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  marginBottom: '1rem',
  border: `2px solid ${theme.palette.primary.main}`,
  borderRadius: '8px',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
}));

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', picture: null });
  const [editCategory, setEditCategory] = useState(null);
  const [deleteCategory, setDeleteCategory] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setSnackbar({ open: true, message: 'Error fetching categories', severity: 'error' });
    }
  };

  const handleInputChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (isEdit) {
      setEditCategory({ ...editCategory, [name]: value });
    } else {
      setNewCategory({ ...newCategory, [name]: value });
    }
  };

  const handleFileChange = (e, isEdit = false) => {
    if (isEdit) {
      setEditCategory({ ...editCategory, picture: e.target.files[0] });
    } else {
      setNewCategory({ ...newCategory, picture: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newCategory.name);
    formData.append('description', newCategory.description);
    if (newCategory.picture) {
      formData.append('picture', newCategory.picture);
    }

    try {
      await axios.post(`${API_URL}/categories`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSnackbar({ open: true, message: 'Category added successfully', severity: 'success' });
      setNewCategory({ name: '', description: '', picture: null });
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      setSnackbar({ open: true, message: `Error adding category: ${error.message}`, severity: 'error' });
    }
  };

  const handleEdit = (category) => {
    setEditCategory(category);
    setDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    const formData = new FormData();
    formData.append('name', editCategory.name);
    formData.append('description', editCategory.description);
    if (editCategory.picture instanceof File) {
      formData.append('picture', editCategory.picture);
    }

    try {
      await axios.put(`${API_URL}/categories/${editCategory._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSnackbar({ open: true, message: 'Category updated successfully', severity: 'success' });
      setDialogOpen(false);
      setEditCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      setSnackbar({ open: true, message: `Error updating category: ${error.message}`, severity: 'error' });
    }
  };

  const handleDeleteConfirmation = (category) => {
    setDeleteCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/categories/${deleteCategory._id}`);
      setSnackbar({ open: true, message: 'Category deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
      setDeleteCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      setSnackbar({ open: true, message: `Error deleting category: ${error.message}`, severity: 'error' });
    }
  };

  return (
    <Box sx={{ bgcolor: '#', minHeight: '100vh' }}>

      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, bgcolor: '#ffffff', borderRadius: 2, boxShadow: 3 }}>
              <Typography variant="h5" gutterBottom color="primary">
                Add New Category
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Name"
                  name="name"
                  value={newCategory.name}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Description"
                  name="description"
                  value={newCategory.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                />
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="raised-button-file"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="raised-button-file">
                  <Button 
                    variant="outlined" 
                    component="span" 
                    sx={{ mt: 2 }}
                  >
                    Upload Picture
                  </Button>
                </label>
                {newCategory.picture && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    File selected: {newCategory.picture.name}
                  </Typography>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                >
                  Add Category
                </Button>
              </form>
            </Paper>
          </Grid>

          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, bgcolor: '#ffffff', borderRadius: 2, boxShadow: 3 }}>
              <Typography variant="h5" gutterBottom color="primary">
                Existing Categories
              </Typography>
              {categories.map((category) => (
                <CategoryCard key={category._id}>
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" component="h2" color="primary">
                      {category.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                  </CardContent>
                  <CardMedia
                    component="img"
                    sx={{ width: 150 }}
                    image={`http://localhost:5000/${category.picture}`}
                    alt={category.name}
                  />
                  <CardActions>
                    <IconButton onClick={() => handleEdit(category)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteConfirmation(category)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </CategoryCard>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            name="name"
            value={editCategory?.name || ''}
            onChange={(e) => handleInputChange(e, true)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Description"
            name="description"
            value={editCategory?.description || ''}
            onChange={(e) => handleInputChange(e, true)}
            multiline
            rows={4}
          />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="edit-button-file"
            type="file"
            onChange={(e) => handleFileChange(e, true)}
          />
          <label htmlFor="edit-button-file">
            <Button 
              variant="outlined" 
              component="span" 
              sx={{ mt: 2 }}
            >
              Change Picture
            </Button>
          </label>
          {editCategory?.picture instanceof File && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              New file selected: {editCategory.picture.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the category "{deleteCategory?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
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