import React from "react";

const AllSensorsDisplay = ({ allSensorsData, deviceInfo, selectedSensor }) => {
  if (!allSensorsData || allSensorsData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center text-black">
        No data found for <span className="font-semibold">{selectedSensor}</span>.
      </div>
    );
  }

  const sensorsByDevice = allSensorsData.reduce((acc, sensor) => {
    const { deviceId } = sensor;
    if (!acc[deviceId]) acc[deviceId] = [];
    acc[deviceId].push(sensor);
    return acc;
  }, {});

  const deviceInfoMap = deviceInfo.reduce((acc, dev) => {
    acc[dev.deviceId] = dev;
    return acc;
  }, {});

  const renderValue = (value) =>
    value !== null && value !== undefined ? value.toFixed(1) : "N/A";

  const renderSensorCard = (sensor, index) => (
    <div
      key={index}
      className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl hover:scale-[1.03] transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4 border-b pb-2">
        <span
          className={`w-3 h-3 rounded-full ${
            sensor.active ? "bg-green-500" : "bg-gray-400"
          }`}
        ></span>
        <h3 className="text-lg font-semibold text-black">{sensor.label || `Sensor ${sensor.sensorId}`}</h3>
      </div>

      {/* Digital Sensors */}
      {sensor.temperature !== undefined && sensor.humidity !== undefined && (
        <>
          <div className="mb-4 pb-3 border-b">
            <p className="text-sm text-black font-medium">Temperature</p>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-black">{renderValue(sensor.temperature)} °C</span>
              <div className="flex flex-col text-xs text-right">
                <span className="text-red-600 font-semibold">▲ {renderValue(sensor.temperatureHigh)} °C</span>
                <span className="text-blue-600 font-semibold">▼ {renderValue(sensor.temperatureLow)} °C</span>
              </div>
            </div>
          </div>

          <div className="mb-4 pb-3 border-b">
            <p className="text-sm text-black font-medium">Humidity</p>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-black">{renderValue(sensor.humidity)} %RH</span>
              <div className="flex flex-col text-xs text-right">
                <span className="text-red-600 font-semibold">▲ {renderValue(sensor.humidityHigh)} %RH</span>
                <span className="text-blue-600 font-semibold">▼ {renderValue(sensor.humidityLow)} %RH</span>
              </div>
            </div>
          </div>

          {sensor.heatIndex !== undefined && (
            <div className="mb-4 pb-3 border-b">
              <p className="text-sm text-black font-medium">Heat Index</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-black">{renderValue(sensor.heatIndex)} °C</span>
                <div className="flex flex-col text-xs text-right">
                  <span className="text-red-600 font-semibold">▲ {renderValue(sensor.heatIndexHigh)} °C</span>
                  <span className="text-blue-600 font-semibold">▼ {renderValue(sensor.heatIndexLow)} °C</span>
                </div>
              </div>
            </div>
          )}

          {sensor.dewPoint !== undefined && (
            <div>
              <p className="text-sm text-black font-medium">Dew Point</p>
              <span className="text-xl font-bold text-black">{renderValue(sensor.dewPoint)} °C</span>
            </div>
          )}
        </>
      )}

      {/* Other sensor types */}
      {selectedSensor === "Switch Sensors" && sensor.state !== undefined && (
        <div>
          <p className="text-sm text-black font-medium">State</p>
          <span className="text-xl font-bold text-black">
            {sensor.enabled === true ? "OPEN" : "CLOSED"}
          </span>
        </div>
      )}

      {selectedSensor === "Power Sensors" && sensor.connected !== undefined && (
        <>
          <div className="mb-4 pb-3 border-b">
            <p className="text-sm text-black font-medium">Status</p>
            <span className="text-xl font-bold text-black">
              {sensor.connected === 1 ? "Connected" : "Disconnected"}
            </span>
          </div>
          <div>
            <p className="text-sm text-black font-medium">State</p>
            <span className="text-xl font-bold text-black">{sensor.state === 1 ? "ON" : "OFF"}</span>
          </div>
        </>
      )}

      {(selectedSensor === "Internal Relays" ||
        selectedSensor === "External Relays") &&
        sensor.state !== undefined && (
          <div>
            <p className="text-sm text-black font-medium">State</p>
            <span className="text-xl font-bold text-black">{sensor.state === 1 ? "ON" : "OFF"}</span>
          </div>
        )}
    </div>
  );

  return (
    <div>
      {Object.entries(sensorsByDevice).map(([deviceId, sensors]) => {
        const devInfo = deviceInfoMap[deviceId] || {};

        return (
          <div key={deviceId} className="mb-10">
            {/* Device Header */}
            <h2 className="text-xl font-bold text-black mb-4 border-b-2 border-gray-300 inline-block pb-1">
              {devInfo.deviceName || `Device ${deviceId}`}
            </h2>

            {/* Device Info Card */}
            <div className="bg-gray-50 rounded-xl shadow-md border border-gray-200 p-6 mb-6 max-w-3xl">
              <div className="space-y-2 text-sm text-black">
                <p>
                  <span className="font-semibold">Serial Number:</span> {devInfo.serialNumber}
                </p>
                <p>
                  <span className="font-semibold">Firmware Version:</span> {devInfo.firmwareVersion}
                </p>
                <p>
                  <span className="font-semibold">IPv4 Address:</span> {devInfo.ipv4Address}
                </p>
                <p>
                  <span className="font-semibold">MAC Address:</span> {devInfo.macAddress}
                </p>
                <p>
                  <span className="font-semibold">Port:</span> {devInfo.httpPort}
                </p>
              </div>
            </div>

            {/* Sensor Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sensors.map((sensor, index) => renderSensorCard(sensor, index))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AllSensorsDisplay;
