import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import CategoryManagement from './components/admin/CategoryManagement';
import DishManagement from './components/admin/DishManagement';
import PersonnelManagement from './components/admin/PersonnelManagement';
import TableManagement from './components/admin/TableManagement';
import Dashboard from './components/admin/Dashboard';
import NewOrder from './components/admin/NewOrder';
import "react-datepicker/dist/react-datepicker.css";

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="dishes" element={<DishManagement />} />
            <Route path="personnel" element={<PersonnelManagement />} />
            <Route path="tables" element={<TableManagement />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="new-order" element={<NewOrder />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;