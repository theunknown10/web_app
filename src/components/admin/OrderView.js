import React from 'react';
import {
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
} from '@mui/material';

export default function OrderView({ order, onEdit, onCancel, onBack, onServed, onPaid }) {
  const totalAmount = order.items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Order for Table {order.table.number}
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
      </Typography>
      <List>
        {order.items.map((item) => (
          <ListItem key={item._id}>
            <ListItemText
              primary={item.dish.name}
              secondary={`$${item.dish.price} x ${item.quantity}`}
            />
          </ListItem>
        ))}
      </List>
      <Typography variant="h6" sx={{ mt: 2 }}>
        Total: ${totalAmount.toFixed(2)}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>
        <Button variant="contained" color="primary" onClick={onEdit}>
          Edit Order
        </Button>
        {order.status === 'active' && (
          <Button variant="contained" color="success" onClick={onServed}>
            Mark as Served
          </Button>
        )}
        {order.status === 'served' && (
          <Button variant="contained" color="success" onClick={onPaid}>
            Mark as Paid
          </Button>
        )}
        <Button variant="contained" color="error" onClick={onCancel}>
          Cancel Order
        </Button>
      </Box>
    </Paper>
  );
}

