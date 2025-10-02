import React, { useState } from "react";
import {
  Home,
  Cpu,
  Activity,
  ToggleLeft,
  ToggleRight,
  Zap,
  Battery,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const menuItems = [
  { label: "Digital Sensors", icon: <Cpu size={18} /> },
  { label: "Analog Sensors", icon: <Activity size={18} /> },
  { label: "Switch Sensors", icon: <ToggleLeft size={18} /> },
  { label: "Internal Relays", icon: <ToggleRight size={18} /> },
  { label: "External Relays", icon: <Zap size={18} /> },
  { label: "Power Sensors", icon: <Battery size={18} /> },
];

const reportItems = [
  { label: "Daily Report", icon: <FileText size={16} /> },
  { label: "Weekly Report", icon: <FileText size={16} /> },
  { label: "Monthly Report", icon: <FileText size={16} /> },
];

const Sidebar = ({
  onSensorSelect,
  onReportSelect,
  onWelcomeSelect,
  activeSensorType,
  selectedPage,
  selectedReport,
}) => {
  const [reportsOpen, setReportsOpen] = useState(false);

  const activeClass =
    "bg-blue-100 text-blue-700 border-l-4 border-blue-500 font-semibold shadow-sm";
  const inactiveClass = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

  const baseButtonClass =
    "flex items-center w-full px-4 py-3 rounded-lg text-sm transition-all duration-300 transform hover:scale-[1.02]";

  return (
    <aside className="bg-white text-gray-800 flex flex-col shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600 tracking-widest">
          SENSORIUM
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto hide-scrollbar">
        <ul className="space-y-2 px-3 pt-5">
          {/* Dashboard */}
          <li>
            <button
              className={`${baseButtonClass} ${
                selectedPage === "welcome" ? activeClass : inactiveClass
              }`}
              onClick={onWelcomeSelect}
            >
              <Home size={20} className="mr-3" />
              <span>Dashboard Overview</span>
            </button>
          </li>

          {/* Sensor Items */}
          <li className="pt-4">
            <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2 px-4 font-semibold">
              Sensors & Devices
            </h3>
          </li>
          {menuItems.map(({ label, icon }) => (
            <li key={label}>
              <button
                className={`${baseButtonClass} ${
                  activeSensorType === label ? activeClass : inactiveClass
                }`}
                onClick={() => onSensorSelect(label)}
              >
                <span className="mr-3">{icon}</span>
                {label}
              </button>
            </li>
          ))}

          {/* Reports */}
          <li className="pt-4">
            <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2 px-4 font-semibold">
              Data & Reports
            </h3>
            <button
              className={`${baseButtonClass} flex justify-between items-center ${
                selectedPage === "reports" && !activeSensorType
                  ? activeClass
                  : inactiveClass
              }`}
              onClick={() => setReportsOpen(!reportsOpen)}
            >
              <div className="flex items-center">
                <FileText size={20} className="mr-3" />
                <span>Reports & Analytics</span>
              </div>
              {reportsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {reportsOpen && (
              <ul className="pl-6 mt-1 space-y-1 transition-all duration-300 ease-in-out">
                {reportItems.map(({ label, icon }) => (
                  <li key={label}>
                    <button
                      className={`flex items-center w-full px-4 py-2 rounded-lg text-sm transition-all duration-300 hover:scale-[1.02] ${
                        selectedPage === "reports" && selectedReport === label
                          ? "bg-blue-100 text-blue-700 font-medium border-l-2 border-blue-500"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                      onClick={() => onReportSelect(label)}
                    >
                      <span className="mr-2 opacity-75">{icon}</span>
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 text-xs text-gray-500 text-center font-light mt-auto">
        © 2025 Sensorium IoT.
        <br></br>
        <br />
        System Status: <span className="text-green-600">Online</span>
      </div>
    </aside>
  );
};

export default Sidebar;
