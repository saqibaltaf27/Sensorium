import React from 'react';
import './SensorLoadingScreen.css';

const SensorLoadingScreen = () => {
  return (
    <div className="sensor-loading-overlay">
      <div className="sensor-loading-container">
        {/* REVISED: New sleek spinner animation */}
        <div className="sensor-loader-spinner"></div>
        {/* END REVISED */}
        
        <div className="sensor-loading-text">
          <span className="connecting-text">Connecting to Sensors</span>
          {/* REVISED: New elegant dot animation */}
          <span className="dot-animation">.</span>
          <span className="dot-animation">.</span>
          <span className="dot-animation">.</span>
          {/* END REVISED */}
        </div>
      </div>
    </div>
  );
};

export default SensorLoadingScreen;
