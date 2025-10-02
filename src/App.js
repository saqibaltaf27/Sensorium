import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import MainContent from "./components/MainContent/MainContent";
import SensorLoadingScreen from "./components/Loading/SensorLoadingScreen";
import ReportsPage from "./components/Reports/ReportsPage";
import WelcomePage from "./components/Welcome/Welcome";

const App = () => {
  const [selectedPage, setSelectedPage] = useState("welcome");
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportsOpen, setReportsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSensorSelect = (sensorType) => {
    setSelectedPage("sensors");
    setSelectedSensor(sensorType);
    setSelectedReport(null);
    setReportsOpen(false);
  };

  const handleReportSelect = (reportType) => {
    setSelectedPage("reports");
    setSelectedReport(reportType);
    setSelectedSensor(null);
    setReportsOpen(true);
  };

  const handleWelcomeSelect = () => {
    setSelectedPage("welcome");
    setSelectedSensor(null);
    setSelectedReport(null);
    setReportsOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        onSensorSelect={handleSensorSelect}
        onReportSelect={handleReportSelect}
        onWelcomeSelect={handleWelcomeSelect}
        activeSensorType={selectedSensor}
        selectedPage={selectedPage}
        selectedReport={selectedReport}
        reportsOpen={reportsOpen}
        setReportsOpen={setReportsOpen}
      />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {loading ? (
          <div className="flex justify-center items-center h-[70vh]">
            <SensorLoadingScreen />
          </div>
        ) : (
          <>
            {selectedPage === "welcome" && <WelcomePage />}
            {selectedPage === "reports" && selectedReport && (
              <ReportsPage period={selectedReport} />
            )}
            {selectedPage === "sensors" && selectedSensor && (
              <MainContent selectedSensor={selectedSensor} />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
