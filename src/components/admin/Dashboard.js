import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  TextField,
  Tabs,
  Tab
} from '@mui/material';
import { format, parse, isWithinInterval, startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_URL = 'http://localhost:5000/api';

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDish, setSelectedDish] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [graphData, setGraphData] = useState({ daily: [], weekly: [], monthly: [] });
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchOrders();
    fetchTables();
    fetchCategories();
    fetchDishes();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, selectedTable, selectedCategory, selectedDish, startDate, endDate]);

  useEffect(() => {
    generateGraphData();
  }, [filteredOrders]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
      setFilteredOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders. Please try again later.');
      setLoading(false);
    }
  };

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
      setError('Failed to fetch tables. Please try again later.');
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
      setError('Failed to fetch categories. Please try again later.');
    }
  };

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
      setError('Failed to fetch dishes. Please try again later.');
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (selectedTable) {
      filtered = filtered.filter(order => order.table && order.table._id === selectedTable);
    }

    if (selectedCategory) {
      filtered = filtered.filter(order => 
        order.items.some(item => item.dish && item.dish.category === selectedCategory)
      );
    }

    if (selectedDish) {
      filtered = filtered.filter(order => 
        order.items.some(item => item.dish && item.dish._id === selectedDish)
      );
    }

    if (startDate && endDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return isWithinInterval(orderDate, { 
          start: startDate, 
          end: endDate 
        });
      });
    }

    setFilteredOrders(filtered);
    setPage(0);
  };

  const generateGraphData = () => {
    if (filteredOrders.length === 0) {
      setGraphData({ daily: [], weekly: [], monthly: [] });
      return;
    }

    const startDate = new Date(Math.min(...filteredOrders.map(order => new Date(order.createdAt))));
    const endDate = new Date(Math.max(...filteredOrders.map(order => new Date(order.createdAt))));

    const dailyData = eachDayOfInterval({ start: startDate, end: endDate }).map(day => ({
      date: format(day, 'yyyy-MM-dd'),
      total: 0
    }));

    const weeklyData = eachWeekOfInterval({ start: startDate, end: endDate }).map(week => ({
      date: format(week, 'yyyy-MM-dd'),
      total: 0
    }));

    const monthlyData = eachMonthOfInterval({ start: startDate, end: endDate }).map(month => ({
      date: format(month, 'yyyy-MM'),
      total: 0
    }));

    filteredOrders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const orderTotal = order.items.reduce((total, item) => {
        if (item.dish && item.dish.price) {
          return total + (item.dish.price * item.quantity);
        }
        return total;
      }, 0);

      const dailyIndex = dailyData.findIndex(d => d.date === format(orderDate, 'yyyy-MM-dd'));
      if (dailyIndex !== -1) {
        dailyData[dailyIndex].total += orderTotal;
      }

      const weeklyIndex = weeklyData.findIndex(w => isWithinInterval(orderDate, {
        start: parse(w.date, 'yyyy-MM-dd', new Date()),
        end: endOfWeek(parse(w.date, 'yyyy-MM-dd', new Date()))
      }));
      if (weeklyIndex !== -1) {
        weeklyData[weeklyIndex].total += orderTotal;
      }

      const monthlyIndex = monthlyData.findIndex(m => m.date === format(orderDate, 'yyyy-MM'));
      if (monthlyIndex !== -1) {
        monthlyData[monthlyIndex].total += orderTotal;
      }
    });

    setGraphData({ daily: dailyData, weekly: weeklyData, monthly: monthlyData });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTableChange = (event) => {
    setSelectedTable(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setSelectedDish(''); // Reset dish when category changes
  };

  const handleDishChange = (event) => {
    setSelectedDish(event.target.value);
  };

  const handleStartDateChange = (event) => {
    const date = event.target.value 
      ? parse(event.target.value, 'yyyy-MM-dd', new Date()) 
      : null;
    setStartDate(date);
  };

  const handleEndDateChange = (event) => {
    const date = event.target.value 
      ? parse(event.target.value, 'yyyy-MM-dd', new Date()) 
      : null;
    setEndDate(date);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Dashboard</Typography>
      
      {/* Date Range Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Start Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
          onChange={handleStartDateChange}
          sx={{ flex: 1 }}
        />
        <TextField
          label="End Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
          onChange={handleEndDateChange}
          sx={{ flex: 1 }}
        />
      </Box>

      {/* Graphs */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Daily" />
          <Tab label="Weekly" />
          <Tab label="Monthly" />
        </Tabs>
        <Box sx={{ height: 300, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={graphData[['daily', 'weekly', 'monthly'][activeTab]]}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="orders table">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>
                <FormControl fullWidth size="small">
                  <InputLabel id="table-select-label">Table</InputLabel>
                  <Select
                    labelId="table-select-label"
                    id="table-select"
                    value={selectedTable}
                    label="Table"
                    onChange={handleTableChange}
                  >
                    <MenuItem value="">All Tables</MenuItem>
                    {tables.map((table) => (
                      <MenuItem key={table._id} value={table._id}>
                        Table {table.number}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell>
                <FormControl fullWidth size="small">
                  <InputLabel id="category-select-label">Category</InputLabel>
                  <Select
                    labelId="category-select-label"
                    id="category-select"
                    value={selectedCategory}
                    label="Category"
                    onChange={handleCategoryChange}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell>
                <FormControl fullWidth size="small">
                  <InputLabel id="dish-select-label">Dish</InputLabel>
                  <Select
                    labelId="dish-select-label"
                    id="dish-select"
                    value={selectedDish}
                    label="Dish"
                    onChange={handleDishChange}
                    disabled={!selectedCategory}
                  >
                    <MenuItem value="">All Dishes</MenuItem>
                    {dishes
                      .filter(dish => !selectedCategory || dish.category === selectedCategory)
                      .map((dish) => (
                        <MenuItem key={dish._id} value={dish._id}>
                          {dish.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm')}</TableCell>
                  <TableCell>{order.table && order.table.number ? order.table.number : 'N/A'}</TableCell>
                  <TableCell colSpan={2}>
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, index) => (
                        <Box key={index}>
                          {item.dish && item.dish.name ? (
                            `${item.dish.name} x${item.quantity} - $${(item.dish.price * item.quantity).toFixed(2)}`
                          ) : (
                            'Invalid item'
                          )}
                        </Box>
                      ))
                    ) : (
                      'No items'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    ${order.items && order.items.length > 0
                      ? order.items.reduce((total, item) => {
                          if (item.dish && item.dish.price) {
                            return total + item.dish.price * item.quantity;
                          }
                          return total;
                        }, 0).toFixed(2)
                      : '0.00'
                    }
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredOrders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}

