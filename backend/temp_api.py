from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import threading
import requests
import time
import pyodbc
import signal
import sys

app = Flask(__name__)
CORS(app)

# ------------------------
# Configuration
# ------------------------
sql_server_connection_string = (
    "DRIVER={ODBC Driver 18 for SQL Server};"
    "SERVER=192.168.10.1;"
    "DATABASE=RoomAlert;"
    "UID=sa;"
    "PWD=AdmTsg@2020;"
    "Encrypt=no;"
    "TrustServerCertificate=yes;"
)

DEVICE_IP = "125.209.65.114"
DEVICE_PORT = "8090"
POLL_INTERVAL = 5  # seconds

# Global flag for clean shutdown
stop_polling = False

# ------------------------
# Requests Session
# ------------------------
session = requests.Session()

def fetch_sensor_data(ip_address, port):
    """Fetches sensor data from Room Alert device."""
    url = f"http://{ip_address}:{port}/status.json"
    try:
        response = session.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to sensor at {url}: {e}")
        return None

def insert_data_to_sql_server(data):
    """Insert sensor data into SQL Server."""
    try:
        with pyodbc.connect(sql_server_connection_string) as conn:
            cursor = conn.cursor()
            digital_sensors = data.get('digitalSensors', [])
            for sensor in digital_sensors:
                if sensor.get('connected'):
                    label = sensor.get('label', 'N/A')
                    temperature = sensor.get('temperature')
                    humidity = sensor.get('humidity')
                    heat_index = sensor.get('heatIndex')
                    dew_point = sensor.get('dewPoint')

                    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    cursor.execute("""
                        INSERT INTO SensorReadings (
                            timestamp, sensor_name, temperature,
                            humidity, heat_index, dew_point
                        ) VALUES (?, ?, ?, ?, ?, ?)
                    """, (timestamp, label.strip(), temperature, humidity, heat_index, dew_point))
            conn.commit()
            print("Data successfully inserted.")
    except pyodbc.Error as e:
        print(f"SQL Server Error: {e}")

def sensor_polling_job():
    """Background thread to poll sensors and insert data."""
    while not stop_polling:
        try:
            data = fetch_sensor_data(DEVICE_IP, DEVICE_PORT)
            if data:
                insert_data_to_sql_server(data)
        except Exception as e:
            print(f"Polling error: {e}")
        time.sleep(POLL_INTERVAL)

# ------------------------
# Flask API Endpoints
# ------------------------
@app.route('/api/sensor-data', methods=['GET'])
def get_sensor_data():
    try:
        with pyodbc.connect(sql_server_connection_string) as conn:
            cursor = conn.cursor()
            query = """
            WITH RankedReadings AS (
                SELECT
                    sensor_name,
                    temperature,
                    humidity,
                    heat_index,
                    dew_point,
                    ROW_NUMBER() OVER (PARTITION BY sensor_name ORDER BY timestamp DESC) as rn
                FROM SensorReadings
            )
            SELECT
                sensor_name,
                temperature,
                humidity,
                heat_index,
                dew_point
            FROM RankedReadings
            WHERE rn = 1;
            """
            cursor.execute(query)
            columns = [column[0] for column in cursor.description]
            rows = [dict(zip(columns, row)) for row in cursor.fetchall()]
            return jsonify(rows)
    except pyodbc.Error as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to retrieve sensor data"}), 500

@app.route('/api/sensor-history', methods=['GET'])
def get_sensor_history():
    sensor_name = request.args.get('sensor_name')
    time_range = request.args.get('time_range', 'daily')

    if not sensor_name:
        return jsonify({"error": "sensor_name parameter is required"}), 400

    end_time = datetime.now()
    if time_range == 'daily':
        start_time = end_time - timedelta(hours=24)
    elif time_range == 'weekly':
        start_time = end_time - timedelta(days=7)
    elif time_range == 'monthly':
        start_time = end_time - timedelta(days=30)
    else:
        return jsonify({"error": "Invalid time_range. Use 'daily', 'weekly', or 'monthly'."}), 400

    try:
        with pyodbc.connect(sql_server_connection_string) as conn:
            cursor = conn.cursor()
            if time_range in ['weekly', 'monthly']:
                query = """
                SELECT
                    CONVERT(DATETIME, CONVERT(VARCHAR, [timestamp], 120)) AS aggregated_time,
                    AVG(temperature) AS temperature,
                    AVG(humidity) AS humidity,
                    AVG(heat_index) AS heat_index,
                    AVG(dew_point) AS dew_point
                FROM SensorReadings
                WHERE sensor_name = ? AND [timestamp] BETWEEN ? AND ?
                GROUP BY CONVERT(DATETIME, CONVERT(VARCHAR, [timestamp], 120))
                ORDER BY aggregated_time ASC;
                """
            else:
                query = """
                SELECT
                    [timestamp],
                    temperature,
                    humidity,
                    heat_index,
                    dew_point
                FROM SensorReadings
                WHERE sensor_name = ? AND [timestamp] BETWEEN ? AND ?
                ORDER BY [timestamp] ASC;
                """
            params = (sensor_name, start_time, end_time)
            cursor.execute(query, params)
            columns = [column[0] for column in cursor.description]
            rows = [dict(zip(columns, row)) for row in cursor.fetchall()]

            if time_range != 'daily' and rows:
                for row in rows:
                    row['timestamp'] = row.pop('aggregated_time')

            return jsonify(rows)
    except pyodbc.Error as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to retrieve history"}), 500

# ------------------------
# Graceful Shutdown Handler
# ------------------------
def shutdown_signal_handler(sig, frame):
    global stop_polling
    print("Shutting down...")
    stop_polling = True
    sys.exit(0)

signal.signal(signal.SIGINT, shutdown_signal_handler)
signal.signal(signal.SIGTERM, shutdown_signal_handler)

# ------------------------
# Start Flask and Background Thread
# ------------------------
if __name__ == '__main__':
    threading.Thread(target=sensor_polling_job, daemon=True).start()
    app.run(host='0.0.0.0', port=5000)
