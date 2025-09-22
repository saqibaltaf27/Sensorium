# Sensorium Dashboard

## Project Overview

**Sensorium** is a high-performance, real-time monitoring and visualization platform for a network of digital sensors and devices. This solution is built on a robust, multi-layered architecture that ensures seamless data flow from the device level to the end-user interface. The system leverages a **Python service for data acquisition**, a **Node.js/Express API for data distribution**, and a dynamic **React.js front-end** for an intuitive and professional user experience. This unified approach provides live, actionable insights into sensor metrics such as temperature, humidity, and device status.

## Key Features

* **Real-time Monitoring**: Data is automatically refreshed every 5 seconds, providing up-to-the-minute insights.
* **Multi-Tier Architecture**:
    * **Data Acquisition (Tier 1)**: A dedicated **Python-based service** acts as the data collector, fetching information directly from devices and storing it in a SQL Server database. This service runs as a **NSSM (Non-Sucking Service Manager)**, ensuring reliable, uninterrupted operation in the background.
    * **Data Distribution (Tier 2)**: A **Node.js/Express API** serves as the communication layer, providing a RESTful interface for the front-end to efficiently query live sensor data.
    * **Presentation (Tier 3)**: A responsive **React.js dashboard** provides a clean, professional, and interactive user interface.
* **Dynamic Data Display**: Visualizes sensor data in a structured, easy-to-read format, including critical metrics and device-specific information.
* **Professional UI/UX**: Features a modern, polished design with a unique, sensor-themed loading animation to enhance the user experience during data fetching.
* **Scalable & Maintainable**: The modular component structure and layered architecture facilitate easy maintenance, debugging, and future expansion.

## Technologies Used

### Backend & Data
* **Python**: For the device data acquisition service.
* **NSSM**: To run the Python service as a resilient Windows background service.
* **SQL Server**: The primary database for storing all sensor and device data.
* **Node.js/Express.js**: For the RESTful API that serves data to the front-end.

### Frontend
* **React.js**: For building the dynamic user interface.
* **HTML5, CSS3**: For structure and styling.

## Getting Started

Follow these steps to set up and run the entire system locally.

### Prerequisites

* Node.js (v14 or higher)
* Python 3.x
* SQL Server (or another compatible database)
* NSSM (Non-Sucking Service Manager)

### Installation & Setup

1.  **Backend Setup (Python Service):**
    * Place your Python script for data fetching in a dedicated folder.
    * Use **NSSM** to install the script as a Windows service, ensuring it automatically starts on boot and restarts on failure.

2.  **API Server Setup (Node.js):**
    * Navigate to the root of your Node.js backend directory.
    * Install dependencies: `npm install`
    * Start the API server: `npm start`
    * Ensure the API is correctly configured to connect to your SQL Server database.

3.  **Frontend Setup (React.js):**
    * Navigate to the `src` folder of your front-end project.
    * Install dependencies: `npm install`
    * Start the development server: `npm start`

> The dashboard will be available at `http://localhost:3000` and will fetch data from your Node.js API, which in turn gets data from the Python service and SQL Server.

## Project Structure

├── Backend (Node.js API)
│   ├── ...
│   └── server.js
├── Python-Service
│   ├── ...
│   └── data-collector.py
├── Frontend (React.js)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ...
│   │   └── App.js
│   ├── styles.css
│   └── README.md
└── SQL Server Database

## Contributing & Support

We welcome contributions and feedback. If you encounter any issues or have suggestions, please open a new issue on the repository.

---

## License

This project is licensed under the MIT License.


