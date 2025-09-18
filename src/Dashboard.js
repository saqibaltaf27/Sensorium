import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import SensorSummary from './components/SensorSummary';
import SensorChart from './components/SensorChart';
import './Dashboard.css';

const API_LATEST_URL = 'http://127.0.0.1:5000/api/sensor-data';
const API_HISTORY_URL = 'http://127.0.0.1:5000/api/sensor-history';

const Dashboard = () => {
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRange, setActiveRange] = useState('daily');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_LATEST_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSensorData(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="loading">Loading sensor data...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div className="app-container">
      <Sidebar activeRange={activeRange} setActiveRange={setActiveRange} />
      <div className="main-content">
        <header className="main-header">
          <h1 className="main-title">Sensor Metrics Dashboard</h1>
          <p className="main-subtitle">Live and Historical data for Digital Sensors {activeRange}</p>
        </header>
        <div className="dashboard-grid">
          {sensorData.map(sensor => (
            <div key={sensor.sensor_name} className="dashboard-card">
              <SensorSummary sensor={sensor} />
              <SensorChart sensorName={sensor.sensor_name} timeRange={activeRange} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;