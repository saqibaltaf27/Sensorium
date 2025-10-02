import React, { useEffect, useState } from "react";
import {
  Thermometer,
  Droplets,
  Activity,
  Server,
  AlertCircle,
} from "lucide-react";
import axios from "axios";

const WelcomePage = () => {
  const [data, setData] = useState({
    totalDevices: 0,
    activeSensors: 0,
    avgTemperature: null,
    avgHumidity: null,
    activeAlerts: 0,
  });
  const [lastSync, setLastSync] = useState(new Date());

  const fetchData = async () => {
    try {
      const devicesRes = await axios.get(
        "https://sensorium-api.vercel.app/api/devices"
      );
      const devices = devicesRes.data;
      const totalDevices = devices.length;

      let activeSensors = 0;
      const sensorPromises = devices.map((device) =>
        axios.get(
          `https://sensorium-api.vercel.app/api/sensors/${device.deviceId}`
        )
      );

      const sensorResponses = await Promise.all(sensorPromises);
      sensorResponses.forEach((res) => {
        activeSensors += res.data.length;
      });

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
      setLastSync(new Date());
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData(); // initial fetch
    const interval = setInterval(() => {
      fetchData();
      setLastSync(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: "Total Devices",
      value: data.totalDevices,
      icon: <Server size={28} className="text-blue-600" />,
      iconBg: "bg-blue-100",
    },
    {
      title: "Active Sensors",
      value: data.activeSensors,
      icon: <Activity size={28} className="text-green-600" />,
      iconBg: "bg-green-100",
    },
    {
      title: "Avg. Temperature",
      value: data.avgTemperature !== null ? `${data.avgTemperature}°C` : "N/A",
      icon: <Thermometer size={28} className="text-red-600" />,
      iconBg: "bg-red-100",
    },
    {
      title: "Avg. Humidity",
      value: data.avgHumidity !== null ? `${data.avgHumidity}%` : "N/A",
      icon: <Droplets size={28} className="text-purple-600" />,
      iconBg: "bg-purple-100",
    },
    {
      title: "Active Alerts",
      value: data.activeAlerts,
      icon: <AlertCircle size={28} className="text-yellow-500" />,
      iconBg: "bg-yellow-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      {/* Hero Section */}
      <div className="relative mb-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Welcome to <span className="text-blue-600">Sensorium</span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-700">
            Centralized hub for <span className="font-semibold">real-time sensor monitoring</span> and intelligent insights.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Last synced: {lastSync.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center rounded-xl border shadow-sm p-6 text-center bg-white hover:shadow-lg transition"
          >
            <div className={`mb-4 p-4 rounded-full ${card.iconBg} flex items-center justify-center`}>
              {card.icon}
            </div>
            <p className="text-sm font-medium text-gray-500">{card.title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      {/* Reports Section */}
      <div className="max-w-4xl mx-auto bg-white shadow-xl border border-gray-200 rounded-xl p-10 text-center hover:shadow-2xl transition">
        <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
          📊 Reports & Analytics
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-lg">
          View historical sensor data, detailed analytics, and trends for better decision-making.
        </p>
        <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Go to Reports
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;
