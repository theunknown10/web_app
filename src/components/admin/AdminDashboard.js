import React from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';
import welcomeImage from '../../images/welcome.png';

const AdminDashboard = () => {
  const dashboardItems = [
    { title: "Orders", path: "/admin/new-order" },
    { title: "Dashboard", path: "/admin/dashboard" },
    { title: "Categories\nManagement", path: "/admin/category" },
    { title: "Dishes\nManagement", path: "/admin/dish" },
    { title: "Tables\nManagement", path: "/admin/table" },
  ];

  return (
    <div className="admin-dashboard">
      <main className="dashboard-content">
        <div className="welcome-image-container">
          <img src={welcomeImage} alt="Welcome to the dashboard" className="welcome-image" />
        </div>
        <div className="dashboard-grid">
          {dashboardItems.map((item, index) => (
            <Link 
              key={item.title} 
              to={item.path}
              className="dashboard-card"
            >

            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

