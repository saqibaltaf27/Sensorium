import React from 'react';
import { FiThermometer, FiDroplet, FiSun, FiCloud } from 'react-icons/fi';
import './SensorSummary.css';

const SensorSummary = ({ sensor }) => {
    return (
        <div className="sensor-summary">
            <h3 className="sensor-name">{sensor.sensor_name}</h3>
            <div className="metrics-grid">
                <div className="metric">
                    <FiThermometer className="metric-icon" />
                    <span className="metric-label">Temperature</span>
                    <span className="metric-value">{sensor.temperature}°C</span>
                </div>
                <div className="metric">
                    <FiDroplet className="metric-icon" />
                    <span className="metric-label">Humidity</span>
                    <span className="metric-value">{sensor.humidity}%</span>
                </div>
                <div className="metric">
                    <FiSun className="metric-icon" />
                    <span className="metric-label">Heat Index</span>
                    <span className="metric-value">{sensor.heat_index}°C</span>
                </div>
                <div className="metric">
                    <FiCloud className="metric-icon" />
                    <span className="metric-label">Dew Point</span>
                    <span className="metric-value">{sensor.dew_point}°C</span>
                </div>
            </div>
        </div>
    );
};

export default SensorSummary;