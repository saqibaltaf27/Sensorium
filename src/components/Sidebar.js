import React from 'react';
import './Sidebar.css';
import { FiCalendar, FiSun, FiClock } from 'react-icons/fi';

const Sidebar = ({ activeRange, setActiveRange }) => {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h3 className="sidebar-title">Temperature Sensor Analytics</h3>
      </div>
      <ul className="sidebar-menu">
        <li className={activeRange === 'daily' ? 'active' : ''}>
          <button onClick={() => setActiveRange('daily')}>
            <FiClock />
            Daily
          </button>
        </li>
        <li className={activeRange === 'weekly' ? 'active' : ''}>
          <button onClick={() => setActiveRange('weekly')}>
            <FiCalendar />
            Weekly
          </button>
        </li>
        <li className={activeRange === 'monthly' ? 'active' : ''}>
          <button onClick={() => setActiveRange('monthly')}>
            <FiSun />
            Monthly
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;