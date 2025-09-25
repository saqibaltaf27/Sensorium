import React, { useState, useEffect } from 'react';
import AllSensorsDisplay from '../AllSensorsDisplay/AllSensorsDisplay';
import SensorLoadingScreen from '../Loading/SensorLoadingScreen';
import './MainContent.css';

const API_BASE_URL = 'https://sensorium-api.vercel.app/api';

const MainContent = ({ selectedSensor }) => {
  const [allSensorsData, setAllSensorsData] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchAllData = async () => {
    try {
      const endpoint = selectedSensor.replace(' ', '-').toLowerCase();

      const [sensorsResponse, devicesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/live/${endpoint}`),
        fetch(`${API_BASE_URL}/live/devices`),
      ]);

      if (!sensorsResponse.ok || !devicesResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const sensorsData = await sensorsResponse.json();
      const devicesData = await devicesResponse.json();

      setAllSensorsData(sensorsData);
      setDeviceInfo(devicesData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAllData();

    const intervalId = setInterval(() => {
      fetchAllData();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [selectedSensor]);

  return (
    <main className="main-content-container">
      <header className="main-header">
        <h2 className="header-title">Live {selectedSensor} Data</h2>
        <span className="last-updated">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </span>
      </header>

      <div className="content-area">
        {loading ? (
          <div className="inline-loading">
            <SensorLoadingScreen />
          </div>
        ) : (
          <AllSensorsDisplay
            allSensorsData={allSensorsData}
            deviceInfo={deviceInfo}
            selectedSensor={selectedSensor}
          />
        )}
      </div>
    </main>
  );
};

export default MainContent;
