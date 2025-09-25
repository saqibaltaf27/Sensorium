import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx"; // ✅ Excel export
import { saveAs } from "file-saver"; // ✅ file download
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
import {
  Thermometer,
  Droplets,
  Activity,
  Cloud,
  Calendar,
  Download, // ✅ download icon
} from "lucide-react";
import SensorLoadingScreen from "../Loading/SensorLoadingScreen";
import "./ReportsPage.css";

const ReportPage = ({ period }) => {
  const [devices, setDevices] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [selectedSensor, setSelectedSensor] = useState("");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch devices
  useEffect(() => {
    axios.get("https://sensorium-api.vercel.app/api/devices").then((res) => {
      setDevices(res.data);
    });
  }, []);

  // Fetch sensors when device changes
  useEffect(() => {
    if (selectedDevice) {
      axios
        .get(`https://sensorium-api.vercel.app/api/sensors/${selectedDevice}`)
        .then((res) => {
          setSensors(res.data);
          setSelectedSensor("");
        });
    } else {
      setSensors([]);
      setSelectedSensor("");
    }
  }, [selectedDevice]);

  const periodMap = {
    "Daily Report": "daily",
    "Weekly Report": "weekly",
    "Monthly Report": "monthly",
  };

  // Fetch report when device/sensor/period changes
  useEffect(() => {
    if (selectedDevice && selectedSensor && period) {
      const backendPeriod = periodMap[period];
      if (!backendPeriod) {
        setReportData([]);
        return;
      }
      setLoading(true);
      axios
        .get(
          `https://sensorium-api.vercel.app/api/reports?deviceId=${selectedDevice}&sensorId=${selectedSensor}&period=${backendPeriod}`
        )
        .then((res) => {
          setReportData(res.data);
        })
        .catch((error) => {
          console.error("Error fetching report:", error);
          setReportData([]);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedDevice, selectedSensor, period]);

  const formatPeriodLabel = (date) => {
    const d = new Date(date);
    if (period === "Daily Report") {
      return d.toLocaleString([], {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return d.toLocaleDateString();
  };

  // ✅ Export to Excel
  const handleDownloadExcel = () => {
    if (!reportData.length) return;

    const formattedData = reportData.map((row) => ({
      Period: formatPeriodLabel(row.period),
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

  return (
    <div className="report-container">
      {/* Header */}
      <div className="report-header">
        <h2 className="report-title">
          <Calendar className="w-6 h-6 text-blue-600 mr-2" />
          Reports - {period}
        </h2>

        <div className="filters">
          <div className="filter-box">
            <select
              className="dropdown"
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
          </div>

          <div className="filter-box">
            <select
              className="dropdown"
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
          </div>

          {/* ✅ Download button */}
          {reportData.length > 0 && (
            <button
              className="download-btn"
              onClick={handleDownloadExcel}
              title="Download Excel"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="inline-loading">
          <SensorLoadingScreen />
        </div>
      ) : reportData.length > 0 ? (
        <>
          {/* Table */}
          <h3 className="sub-heading">Average Report</h3>
          <div className="table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th><Calendar className="inline w-4 h-4 mr-1" /> Period</th>
                  <th><Thermometer className="inline w-4 h-4 mr-1" /> Min Temp</th>
                  <th><Thermometer className="inline w-4 h-4 mr-1" /> Avg Temp</th>
                  <th><Thermometer className="inline w-4 h-4 mr-1" /> Max Temp</th>
                  <th><Droplets className="inline w-4 h-4 mr-1" /> Avg Humidity</th>
                  <th><Activity className="inline w-4 h-4 mr-1" /> Avg Heat Index</th>
                  <th><Cloud className="inline w-4 h-4 mr-1" /> Avg Dew Point</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{formatPeriodLabel(row.period)}</td>
                    <td>{row.minTemp !== null ? row.minTemp.toFixed(2) : "-"}</td>
                    <td>{row.avgTemp !== null ? row.avgTemp.toFixed(2) : "-"}</td>
                    <td>{row.maxTemp !== null ? row.maxTemp.toFixed(2) : "-"}</td>
                    <td>{row.avgHumidity !== null ? row.avgHumidity.toFixed(2) : "-"}</td>
                    <td>{row.avgHeatIndex !== null ? row.avgHeatIndex.toFixed(2) : "-"}</td>
                    <td>{row.avgDewPoint !== null ? row.avgDewPoint.toFixed(2) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Chart */}
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tickFormatter={formatPeriodLabel} />
                <YAxis />
                <Tooltip labelFormatter={formatPeriodLabel} />
                <Legend />
                <Line type="monotone" dataKey="avgTemp" stroke="#007bff" name="Avg Temp" />
                <Line type="monotone" dataKey="avgHumidity" stroke="#28a745" name="Avg Humidity" />
                <Line type="monotone" dataKey="avgHeatIndex" stroke="#ff5722" name="Avg Heat Index" />
                <Line type="monotone" dataKey="avgDewPoint" stroke="#6f42c1" name="Avg Dew Point" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <p className="no-data-message">Select a device and sensor to view the report.</p>
      )}
    </div>
  );
};

export default ReportPage;
