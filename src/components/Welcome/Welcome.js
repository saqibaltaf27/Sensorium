import React, { useEffect, useState } from "react";
import { Thermometer, Droplets, Activity, Server, AlertCircle } from "lucide-react";
import axios from "axios";
import "./Welcome.css";

const WelcomePage = () => {
  const [data, setData] = useState({
    totalDevices: 0,
    activeSensors: 0,
    avgTemperature: null,
    avgHumidity: null,
    activeAlerts: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const devicesRes = await axios.get("https://sensorium-api.vercel.app/api/devices");
        const devices = devicesRes.data;
        const totalDevices = devices.length;

        let activeSensors = 0;
        const sensorPromises = devices.map((device) =>
          axios.get(`https://sensorium-api.vercel.app/api/sensors/${device.deviceId}`)
        );

        const sensorResponses = await Promise.all(sensorPromises);
        sensorResponses.forEach((res) => {
          activeSensors += res.data.length;
        });

        // Mock data for now
        const mockAvgTemperature = 22.5;
        const mockAvgHumidity = 65;
        const mockActiveAlerts = 2;

        setData({
          totalDevices,
          activeSensors,
          avgTemperature: mockAvgTemperature,
          avgHumidity: mockAvgHumidity,
          activeAlerts: mockActiveAlerts,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: "Total Devices",
      value: data.totalDevices,
      icon: <Server size={32} className="icon blue" />,
      color: "blue",
    },
    {
      title: "Active Sensors",
      value: data.activeSensors,
      icon: <Activity size={32} className="icon green" />,
      color: "green",
    },
    {
      title: "Avg. Temperature",
      value: data.avgTemperature !== null ? `${data.avgTemperature}°C` : "N/A",
      icon: <Thermometer size={32} className="icon red" />,
      color: "red",
    },
    {
      title: "Avg. Humidity",
      value: data.avgHumidity !== null ? `${data.avgHumidity}%` : "N/A",
      icon: <Droplets size={32} className="icon purple" />,
      color: "purple",
    },
    {
      title: "Active Alerts",
      value: data.activeAlerts,
      icon: <AlertCircle size={32} className="icon yellow" />,
      color: "yellow",
    },
  ];

  return (
    <div className="welcome-container">
      {/* Header */}
      <div className="welcome-header">
        <div>
          <h1>Welcome to Sensorium</h1>
          <p>Your centralized hub for real-time sensor monitoring.</p>
        </div>
      </div>

      {/* Overview */}
      <h2 className="section-title">System Overview</h2>
      <div className="stat-grid">
        {statCards.map((card, index) => (
          <div key={index} className={`stat-card ${card.color}`}>
            <div className="stat-icon">{card.icon}</div>
            <p className="stat-title">{card.title}</p>
            <h3 className="stat-value">{card.value}</h3>
          </div>
        ))}
      </div>

      {/* Placeholder Section */}
      <div className="reports-placeholder">
        <h3>Detailed Reports and Analytics</h3>
        <p>Navigate to the reports section to view historical data and detailed graphs.</p>
      </div>
    </div>
  );
};

export default WelcomePage;
