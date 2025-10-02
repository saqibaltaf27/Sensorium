import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_HISTORY_URL =
  "https://tempmonitoringcontrolpanel-production.up.railway.app/api/sensor-history";

const COLORS = {
  temperature: "#2563eb", // Tailwind blue-600
  humidity: "#10b981", // Tailwind green-500
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
    if (timeRange === "daily") {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (timeRange === "weekly") {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {sensorName} Trends <span className="text-sm text-gray-500">({timeRange})</span>
      </h3>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTimestamp}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              padding: "0.5rem 0.75rem",
              color: "#374151",
            }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "10px",
              fontSize: "0.875rem",
              color: "#4b5563",
            }}
          />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke={COLORS.temperature}
            name="Temperature"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="humidity"
            stroke={COLORS.humidity}
            name="Humidity"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SensorChart;
