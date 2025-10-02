import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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
import { Calendar, Download, Thermometer, Droplets, Activity, Cloud } from "lucide-react";
import SensorLoadingScreen from "../Loading/SensorLoadingScreen";

const ReportPage = ({ period }) => {
  const [devices, setDevices] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [selectedSensor, setSelectedSensor] = useState("");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch devices
  useEffect(() => {
    axios.get("https://sensorium-api.vercel.app/api/devices").then((res) => setDevices(res.data));
  }, []);

  // Fetch sensors when device changes
  useEffect(() => {
    if (selectedDevice) {
      axios.get(`https://sensorium-api.vercel.app/api/sensors/${selectedDevice}`)
        .then((res) => {
          setSensors(res.data);
          setSelectedSensor("");
        });
    } else {
      setSensors([]);
      setSelectedSensor("");
    }
  }, [selectedDevice]);

  const periodMap = { "Daily Report": "daily", "Weekly Report": "weekly", "Monthly Report": "monthly" };

  // Fetch report
  useEffect(() => {
    if (selectedDevice && selectedSensor && period) {
      const backendPeriod = periodMap[period];
      if (!backendPeriod) {
        setReportData([]);
        return;
      }
      setLoading(true);
      axios.get(`https://sensorium-api.vercel.app/api/reports?deviceId=${selectedDevice}&sensorId=${selectedSensor}&period=${backendPeriod}`)
        .then((res) => setReportData(res.data))
        .catch((err) => {
          console.error("Error fetching report:", err);
          setReportData([]);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedDevice, selectedSensor, period]);

  const formatPeriodLabel = (date) => {
    const d = new Date(date);
    if (period === "Daily Report") {
      return (
        <div className="flex flex-col">
          <span>{d.toLocaleDateString()}</span>
          <span>{d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</span>
        </div>
      );
    }
    return d.toLocaleDateString();
  };

  const handleDownloadExcel = () => {
    if (!reportData.length) return;

    const formattedData = reportData.map((row) => ({
      Period: formatPeriodLabel(row.period).props
        ? `${formatPeriodLabel(row.period).props.children[0].props.children} ${formatPeriodLabel(row.period).props.children[1].props.children}`
        : row.period,
      "Min Temp": row.minTemp !== null ? row.minTemp.toFixed(2) : "-",
      "Avg Temp": row.avgTemp !== null ? row.avgTemp.toFixed(2) : "-",
      "Max Temp": row.maxTemp !== null ? row.maxTemp.toFixed(2) : "-",
      "Avg Humidity": row.avgHumidity !== null ? row.avgHumidity.toFixed(2) : "-",
      "Avg Heat Index": row.avgHeatIndex !== null ? row.avgHeatIndex.toFixed(2) : "-",
      "Avg Dew Point": row.avgDewPoint !== null ? row.avgDewPoint.toFixed(2) : "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Report_${period}_${selectedDevice}_${selectedSensor}.xlsx`);
  };

  const columns = [
    { label: "Period", icon: <Calendar size={16} className="inline mr-1 text-blue-600" /> },
    { label: "Min Temp", icon: <Thermometer size={16} className="inline mr-1 text-red-500" /> },
    { label: "Avg Temp", icon: <Thermometer size={16} className="inline mr-1 text-red-400" /> },
    { label: "Max Temp", icon: <Thermometer size={16} className="inline mr-1 text-red-600" /> },
    { label: "Avg Humidity", icon: <Droplets size={16} className="inline mr-1 text-purple-500" /> },
    { label: "Avg Heat Index", icon: <Activity size={16} className="inline mr-1 text-orange-500" /> },
    { label: "Avg Dew Point", icon: <Cloud size={16} className="inline mr-1 text-blue-400" /> },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="flex items-center text-2xl font-bold text-gray-800">
          <Calendar className="w-6 h-6 text-blue-600 mr-2" />
          Reports - {period}
        </h2>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring focus:ring-blue-200"
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
          >
            <option value="">Select Device</option>
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.deviceName}
              </option>
            ))}
          </select>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring focus:ring-blue-200"
            value={selectedSensor}
            onChange={(e) => setSelectedSensor(e.target.value)}
            disabled={!selectedDevice}
          >
            <option value="">Select Sensor</option>
            {sensors.map((s) => (
              <option key={s.sensorId} value={s.sensorId}>
                {s.label || `Sensor ${s.sensorId}`}
              </option>
            ))}
          </select>
          {reportData.length > 0 && (
            <button
              onClick={handleDownloadExcel}
              className="p-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition"
              title="Download Excel"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <SensorLoadingScreen />
        </div>
      ) : reportData.length > 0 ? (
        <>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Average Report</h3>
          <div className="overflow-x-auto shadow-lg rounded-2xl p-4 mb-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-gradient-to-r from-blue-100 to-blue-200 sticky top-0 shadow-md rounded-t-xl">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.label}
                      className="px-4 py-3 text-left font-semibold text-gray-800 tracking-wide"
                    >
                      {col.icon}
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors duration-300 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50`}
                  >
                    <td className="px-4 py-3 font-medium">{formatPeriodLabel(row.period)}</td>
                    <td className="px-4 py-3">{row.minTemp !== null ? row.minTemp.toFixed(2) : "-"}</td>
                    <td className="px-4 py-3">{row.avgTemp !== null ? row.avgTemp.toFixed(2) : "-"}</td>
                    <td className="px-4 py-3">{row.maxTemp !== null ? row.maxTemp.toFixed(2) : "-"}</td>
                    <td className="px-4 py-3">{row.avgHumidity !== null ? row.avgHumidity.toFixed(2) : "-"}</td>
                    <td className="px-4 py-3">{row.avgHeatIndex !== null ? row.avgHeatIndex.toFixed(2) : "-"}</td>
                    <td className="px-4 py-3">{row.avgDewPoint !== null ? row.avgDewPoint.toFixed(2) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Chart */}
          <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
  dataKey="period"
  stroke="#6b7280"
  fontSize={12}
  angle={0}
  textAnchor="middle"
  interval="preserveStartEnd" // Shows start, end, and evenly spaced intermediate labels
  tickFormatter={(date) => {
    const d = new Date(date);
    if (period === "Daily Report") {
      // Show only hours for daily reports
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    } else if (period === "Weekly Report") {
      // Show day & month for weekly
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    } else if (period === "Monthly Report") {
      // Show month & year for monthly
      return d.toLocaleDateString([], { month: "short", year: "numeric" });
    }
    return d.toLocaleDateString();
  }}
/>

                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  labelFormatter={(label) => {
                    const d = new Date(label);
                    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}`;
                  }}
                  contentStyle={{ backgroundColor: "#f9fafb", borderRadius: "8px" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgTemp"
                  stroke="#3b82f6"
                  name="Avg Temp"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="avgHumidity"
                  stroke="#10b981"
                  name="Avg Humidity"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="avgHeatIndex"
                  stroke="#ef4444"
                  name="Avg Heat Index"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="avgDewPoint"
                  stroke="#8b5cf6"
                  name="Avg Dew Point"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-center mt-10">Select a device and sensor to view the report.</p>
      )}
    </div>
  );
};

export default ReportPage;
