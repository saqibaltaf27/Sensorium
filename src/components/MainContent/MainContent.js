import React, { useState, useEffect } from "react";
import AllSensorsDisplay from "../AllSensorsDisplay/AllSensorsDisplay";
import SensorLoadingScreen from "../Loading/SensorLoadingScreen";

const API_BASE_URL = "https://sensorium-api.vercel.app/api";

const MainContent = ({ selectedSensor }) => {
  const [allSensorsData, setAllSensorsData] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchAllData = async () => {
    try {
      const endpoint = selectedSensor.replace(" ", "-").toLowerCase();
      const [sensorsRes, devicesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/live/${endpoint}`),
        fetch(`${API_BASE_URL}/live/devices`),
      ]);

      if (!sensorsRes.ok || !devicesRes.ok) throw new Error("Failed to fetch");

      const sensorsData = await sensorsRes.json();
      const devicesData = await devicesRes.json();

      setAllSensorsData(sensorsData);
      setDeviceInfo(devicesData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAllData();
    const id = setInterval(fetchAllData, 5000);
    return () => clearInterval(id);
  }, [selectedSensor]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Live {selectedSensor} Data
        </h2>
        <span className="text-sm text-gray-500">
          Last updated:{" "}
          <span className="font-medium">  {lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
        </span>
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
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
  );
};

export default MainContent;
