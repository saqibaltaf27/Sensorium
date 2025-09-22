import React, { useState } from 'react';
import './Sidebar.css'; // Assuming you have a CSS file for styling

const menuItems = [
  'Digital Sensors',
  'Analog Sensors',
  'Switch Sensors',
  'Internal Relays',
  'External Relays',
  'Power Sensors'
];

const Sidebar = ({ onSensorSelect, activeSensorType }) => {
  return (
    <aside className="sidebar-container">
      <div className="sidebar-header">
        <h1 className="logo">Dashboard</h1>
      </div>
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map(item => (
            <li key={item} className="sidebar-item">
              <button 
                className={`sidebar-button ${activeSensorType === item ? 'active' : ''}`}
                onClick={() => onSensorSelect(item)}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {/* You can add a footer or other elements here */}
      <div className="sidebar-footer">
        <p>&copy; 2025 GMS</p>
      </div>
    </aside>
  );
};

export default Sidebar;