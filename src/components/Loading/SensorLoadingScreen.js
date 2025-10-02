import React from "react";

const SensorLoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-950 bg-opacity-90 backdrop-blur-md z-50 animate-fadeIn">
      <div className="flex flex-col items-center space-y-8">
        {/* Futuristic Spinner */}
        <div className="relative w-20 h-20">
          {/* Outer Halo Glow */}
          <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 blur-2xl animate-ping"></div>

          {/* Static Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-gray-700/40"></div>

          {/* Dual Rotating Rings */}
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/70 border-t-transparent animate-spin-slow"></div>
          <div className="absolute inset-2 rounded-full border-4 border-blue-400/70 border-b-transparent animate-spin-reverse"></div>

          {/* Center Core */}
          <div className="absolute inset-6 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 animate-pulse"></div>
        </div>

        {/* Animated Text */}
        <div className="flex flex-col items-center space-y-2">
          <p className="text-xl font-semibold text-gray-100 tracking-wide animate-fadeUp">
            Connecting to Sensors
          </p>
          <div className="flex space-x-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce animate-delay-150"></span>
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce animate-delay-300"></span>
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce animate-delay-500"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorLoadingScreen;
