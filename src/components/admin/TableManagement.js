import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  Category as CategoryIcon,
  TableRestaurant as TableIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#1a237e',
}));

const LogoIcon = styled(RestaurantIcon)(({ theme }) => ({
  marginRight: theme.spacing(2),
  fontSize: '2rem',
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTab-root': {
    minWidth: 120,
    fontWeight: 'bold',
  },
}));

const API_URL = 'http://localhost:5000/api';

export default function TableManagement() {
  const [tables, setTables] = useState([]);
  const [newTable, setNewTable] = useState({ number: '', capacity: '' });
  const [editTable, setEditTable] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(2); // Set to 2 for Tables tab

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await fetch(`${API_URL}/tables`);
      if (!response.ok) {
        throw new Error('Failed to fetch tables');
      }
      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setSnackbar({ open: true, message: 'Error fetching tables', severity: 'error' });
    }
  };

  const handleAddTable = async () => {
    try {
      const response = await fetch(`${API_URL}/tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTable),
      });

      if (!response.ok) {
        throw new Error('Failed to add table');
      }

      setNewTable({ number: '', capacity: '' });
      fetchTables();
      setSnackbar({ open: true, message: 'Table added successfully', severity: 'success' });
    } catch (error) {
      console.error('Error adding table:', error);
      setSnackbar({ open: true, message: 'Error adding table', severity: 'error' });
    }
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(`${API_URL}/tables/${editTable._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ number: editTable.number, capacity: editTable.capacity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update table');
      }

      setEditTable(null);
      fetchTables();
      setSnackbar({ open: true, message: 'Table updated successfully', severity: 'success' });
    } catch (error) {
      console.error('Error updating table:', error);
      setSnackbar({ open: true, message: 'Error updating table', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/tables/${tableToDelete._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete table');
      }

      setDeleteConfirmOpen(false);
      setTableToDelete(null);
      fetchTables();
      setSnackbar({ open: true, message: 'Table deleted successfully', severity: 'success' });
    } catch (error) {
      console.error('Error deleting table:', error);
      setSnackbar({ open: true, message: 'Error deleting table', severity: 'error' });
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <StyledAppBar position="static">
        
      </StyledAppBar>

      <Container sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <TextField
              label="Table Number"
              value={newTable.number}
              onChange={(e) => setNewTable({ ...newTable, number: e.target.value })}
            />
            <TextField
              label="Capacity"
              type="number"
              value={newTable.capacity}
              onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddTable}
              disabled={!newTable.number.trim() || !newTable.capacity}
            >
              Add Table
            </Button>
          </Box>

          <List>
            {tables.map((table) => (
              <ListItem
                key={table._id}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemText primary={`Table ${table.number} (Capacity: ${table.capacity})`} />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => setEditTable(table)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => {
                      setTableToDelete(table);
                      setDeleteConfirmOpen(true);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Container>

      <Dialog open={Boolean(editTable)} onClose={() => setEditTable(null)}>
        <DialogTitle>Edit Table</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Table Number"
            fullWidth
            value={editTable?.number || ''}
            onChange={(e) => setEditTable({ ...editTable, number: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Capacity"
            type="number"
            fullWidth
            value={editTable?.capacity || ''}
            onChange={(e) => setEditTable({ ...editTable, capacity: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTable(null)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete Table {tableToDelete?.number}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
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