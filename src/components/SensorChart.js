import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './SensorChart.css';

const API_HISTORY_URL = 'http://127.0.0.1:5000/api/sensor-history';
const COLORS = {
  temperature: '#00509d',
  humidity: '#007ba7',
};

const SensorChart = ({ sensorName, timeRange }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const url = `${API_HISTORY_URL}?sensor_name=${sensorName}&time_range=${timeRange}`;
        const response = await fetch(url);
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };
    fetchHistory();
  }, [sensorName, timeRange]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    if (timeRange === 'daily') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timeRange === 'weekly') {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="sensor-chart-container">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="timestamp" tickFormatter={formatTimestamp} stroke="#bdbdbd" />
          <YAxis stroke="#bdbdbd" />
          <Tooltip />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
          <Line type="monotone" dataKey="temperature" stroke={COLORS.temperature} name="Temperature" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="humidity" stroke={COLORS.humidity} name="Humidity" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SensorChart;