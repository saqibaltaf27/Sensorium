import React, { useState } from "react";
import {
  Home,
  Cpu,
  Activity,
  ToggleLeft,
  ToggleRight,
  Zap,
  Battery,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import "./Sidebar.css";

const menuItems = [
  { label: "Digital Sensors", icon: <Cpu size={18} /> },
  { label: "Analog Sensors", icon: <Activity size={18} /> },
  { label: "Switch Sensors", icon: <ToggleLeft size={18} /> },
  { label: "Internal Relays", icon: <ToggleRight size={18} /> },
  { label: "External Relays", icon: <Zap size={18} /> },
  { label: "Power Sensors", icon: <Battery size={18} /> },
];

const reportItems = [
  { label: "Daily Report", icon: <FileText size={16} /> },
  { label: "Weekly Report", icon: <FileText size={16} /> },
  { label: "Monthly Report", icon: <FileText size={16} /> },
];

const Sidebar = ({ onSensorSelect, onReportSelect, onWelcomeSelect, activeSensorType, selectedPage, selectedReport }) => {
  const [reportsOpen, setReportsOpen] = useState(false);

  return (
    <aside className="sidebar-container">
      <div className="sidebar-header">
        <h1 className="logo">Sensorium</h1>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {/* Welcome Page */}
          <li className="sidebar-item">
            <button
              className={`sidebar-button ${selectedPage === "welcome" ? "active" : ""}`}
              onClick={onWelcomeSelect}
            >
              <Home size={18} />
              <span className="sidebar-label">Welcome</span>
            </button>
          </li>

          {/* Sensor Menu */}
          {menuItems.map(({ label, icon }) => (
            <li key={label} className="sidebar-item">
              <button
                className={`sidebar-button ${activeSensorType === label ? "active" : ""}`}
                onClick={() => onSensorSelect(label)}
              >
                {icon}
                <span className="sidebar-label">{label}</span>
              </button>
            </li>
          ))}

          {/* Reports Dropdown */}
          <li className="sidebar-item">
            <button
              className={`sidebar-button ${selectedPage === "reports" ? "active" : ""}`}
              onClick={() => setReportsOpen(!reportsOpen)}
            >
              <FileText size={18} />
              <span className="sidebar-label">Reports</span>
              {reportsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {reportsOpen && (
              <ul className="sidebar-submenu">
                {reportItems.map(({ label, icon }) => (
                  <li key={label} className="sidebar-subitem">
                    <button
                     className={`sidebar-subbutton ${selectedPage === "reports" && selectedReport === label ? "active" : ""}`}
                      onClick={() => onReportSelect(label)}
                    >
                      {icon}
                      <span>{label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <p>&copy; 2025 GMS</p>
      </div>
    </aside>
  );
};

export default Sidebar;
