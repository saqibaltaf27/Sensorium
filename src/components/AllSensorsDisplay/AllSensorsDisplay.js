import React from 'react';
import './AllSensorsDisplay.css';

const AllSensorsDisplay = ({ allSensorsData, deviceInfo, selectedSensor }) => {
  if (!allSensorsData || allSensorsData.length === 0) {
    return <div className="loading-state-card">No data found for {selectedSensor.toLowerCase()}.</div>;
  }
  
  const sensorsByDevice = allSensorsData.reduce((acc, sensor) => {
    const { deviceId } = sensor;
    if (!acc[deviceId]) {
      acc[deviceId] = [];
    }
    acc[deviceId].push(sensor);
    return acc;
  }, {});

  const deviceInfoMap = deviceInfo.reduce((acc, dev) => {
    acc[dev.deviceId] = dev;
    return acc;
  }, {});

  const renderSensorCard = (sensor, index) => {
    // Helper function to safely render a numeric value
    const renderValue = (value) => {
      return value !== null && value !== undefined ? value.toFixed(1) : 'N/A';
    };

    return (
      <div key={index} className="sensor-card">
        <div className="card-header">
          <span className="status-icon connected-icon">✓</span>
          <h3 className="card-title">{sensor.label || `Sensor ${sensor.sensorId}`}</h3>
        </div>
        
        {/* === Digital Sensors === */}
        {sensor.temperature !== undefined && sensor.humidity !== undefined && (
          <>
            <div className="data-section">
              <span className="data-label">Temperature</span>
              <div className="data-values">
                <span className="main-value">{renderValue(sensor.temperature)} °C</span>
                <div className="range-values">
                  <span className="high-value"> {renderValue(sensor.temperatureHigh)} °C</span>
                  <span className="low-value"> {renderValue(sensor.temperatureLow)} °C</span>
                </div>
              </div>
            </div>
            <div className="data-section">
              <span className="data-label">Humidity</span>
              <div className="data-values">
                <span className="main-value">{renderValue(sensor.humidity)} %RH</span>
                <div className="range-values">
                  <span className="high-value"> {renderValue(sensor.humidityHigh)} %RH</span>
                  <span className="low-value"> {renderValue(sensor.humidityLow)} %RH</span>
                </div>
              </div>
            </div>
            {sensor.heatIndex !== undefined && (
              <div className="data-section">
                <span className="data-label">Heat Index</span>
                <div className="data-values">
                  <span className="main-value">{renderValue(sensor.heatIndex)} °C</span>
                  <div className="range-values">
                  <span className="high-value"> {renderValue(sensor.heatIndexHigh)} %RH</span>
                  <span className="low-value"> {renderValue(sensor.heatIndexLow)} %RH</span>
                </div>
                </div>
              </div>
            )}
            {sensor.dewPoint !== undefined && (
              <div className="data-section">
                <span className="data-label">Dew Point</span>
                <div className="data-values">
                  <span className="main-value">{renderValue(sensor.dewPoint)} °C</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* === Switch Sensors === */}
        {selectedSensor === 'Switch Sensors' && sensor.state !== undefined && (
          <div className="data-section">
            <span className="data-label">State</span>
            <div className="data-values">
              <span className="main-value">{sensor.enabled === true ? 'OPEN' : 'CLOSED'}</span>
            </div>
          </div>
        )}

        {/* === Power Sensors === */}
        {selectedSensor === 'Power Sensors' && sensor.connected !== undefined && (
          <>
            <div className="data-section">
              <span className="data-label">Status</span>
              <div className="data-values">
                <span className="main-value">{sensor.connected === 1 ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
            <div className="data-section">
              <span className="data-label">State</span>
              <div className="data-values">
                <span className="main-value">{sensor.state === 1 ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          </>
        )}

        {/* === Relays (Internal & External) === */}
        {(selectedSensor === 'Internal Relays' || selectedSensor === 'External Relays') && sensor.state !== undefined && (
          <div className="data-section">
            <span className="data-label">State</span>
            <div className="data-values">
              <span className="main-value">{sensor.state === 1 ? 'ON' : 'OFF'}</span>
            </div>
          </div>
        )}
        
      </div>
    );
  };

  return (
    <div>
      {Object.entries(sensorsByDevice).map(([deviceId, sensors]) => {
        const devInfo = deviceInfoMap[deviceId] || {};
        
        return (
          <div key={deviceId} className="device-section">
            <h2>{devInfo.deviceName || `Device ${deviceId}`}</h2>
            <br></br>
            <div className="device-info-container">
              <div className="device-details">
                <p><strong>Serial Number:</strong> {devInfo.serialNumber}</p>
                <p><strong>Firmware Version:</strong> {devInfo.firmwareVersion}</p>
                <p><strong>IPv4 Address:</strong> {devInfo.ipv4Address}</p>
                <p><strong>MAC Address:</strong> {devInfo.macAddress}</p>
                <p><strong>Port:</strong> {devInfo.httpPort}</p>
              </div>
            </div>

            <div className="sensor-details-container">
              {sensors.map((sensor, index) => renderSensorCard(sensor, index))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AllSensorsDisplay;