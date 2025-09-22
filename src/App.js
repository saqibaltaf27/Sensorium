import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import MainContent from './components/MainContent/MainContent';
import SensorLoadingScreen from './components/Loading/SensorLoadingScreen'; // Import the new component
import './styles.css';

const App = () => {
  const [selectedSensor, setSelectedSensor] = useState('Digital Sensors');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); 
    return () => clearTimeout(timer);
  }, []);

  const handleSensorSelect = (sensorType) => {
    setSelectedSensor(sensorType);
  };

  if (loading) {
    // Use the new SensorLoadingScreen component here
    return <SensorLoadingScreen />;
  }

  return (
    <div className="app-container">
      <Sidebar onSensorSelect={handleSensorSelect} />
      <MainContent selectedSensor={selectedSensor} />
    </div>
  );
};

export default App;