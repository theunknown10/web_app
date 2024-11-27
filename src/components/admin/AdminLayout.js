import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  Category as CategoryIcon,
  TableRestaurant as TableIcon,
  ShoppingCart as OrderIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

import AdminDashboard from './AdminDashboard';
import CategoryManagement from './CategoryManagement';
import DishManagement from './DishManagement';
import TableManagement from './TableManagement';
import NewOrder from './NewOrder';
import Dashboard from './Dashboard';

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

export default function AdminDashboard_dash() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <StyledAppBar position="static">
        <Toolbar>
          <LogoIcon />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Luxe Hotel Restaurant Management
          </Typography>
        </Toolbar>
        <Box sx={{ px: 2 }}>
          <StyledTabs value={tabValue} onChange={handleTabChange}>
          <Tab
              icon={<CategoryIcon />}
              label="Home"
              sx={{ color: tabValue === 0 ? '#fff' : 'rgba(255, 255, 255, 0.7)' }}
            />
            <Tab
              icon={<CategoryIcon />}
              label="CATEGORIES"
              sx={{ color: tabValue === 1 ? '#fff' : 'rgba(255, 255, 255, 0.7)' }}
            />
            <Tab
              icon={<RestaurantIcon />}
              label="DISHES"
              sx={{ color: tabValue === 2 ? '#fff' : 'rgba(255, 255, 255, 0.7)' }}
            />
            <Tab
              icon={<TableIcon />}
              label="TABLES"
              sx={{ color: tabValue === 3 ? '#fff' : 'rgba(255, 255, 255, 0.7)' }}
            />
            <Tab
              icon={<OrderIcon />}
              label="NEW ORDERS"
              sx={{ color: tabValue === 4 ? '#fff' : 'rgba(255, 255, 255, 0.7)' }}
            />
            <Tab
              icon={<OrderIcon />}
              label="Dashboard"
              sx={{ color: tabValue === 5 ? '#fff' : 'rgba(255, 255, 255, 0.7)' }}
            />
          </StyledTabs>
        </Box>
      </StyledAppBar>

      <Container sx={{ mt: 6 }}>
        {tabValue === 0 && <AdminDashboard />}
        {tabValue === 1 && <CategoryManagement />}
        {tabValue === 2 && <DishManagement />}
        {tabValue === 3 && <TableManagement />}
        {tabValue === 4 && <NewOrder />}
        {tabValue === 5 && <Dashboard />}
      </Container>
    </Box>
  );
}