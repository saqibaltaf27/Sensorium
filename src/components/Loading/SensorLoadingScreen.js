import React from 'react';
import './SensorLoadingScreen.css'; // Make sure to create this CSS file

const SensorLoadingScreen = () => {
  return (
    <div className="sensor-loading-overlay">
      <div className="sensor-loading-container">
        <div className="sensor-pulse-grid">
          <div className="sensor-pulse-item"></div>
          <div className="sensor-pulse-item"></div>
          <div className="sensor-pulse-item"></div>
          <div className="sensor-pulse-item"></div>
          <div className="sensor-pulse-item"></div>
          <div className="sensor-pulse-item"></div>
          <div className="sensor-pulse-item"></div>
          <div className="sensor-pulse-item"></div>
          <div className="sensor-pulse-item"></div>
        </div>
        <div className="sensor-loading-text">
          <span className="connecting-text">Connecting to Sensors</span>
          <span className="dot-animation">...</span>
        </div>
      </div>
    </div>
  );
};

export default SensorLoadingScreen;