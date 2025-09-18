from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import threading
import requests
import time
import pyodbc

app = Flask(__name__)
CORS(app)

# SQL Server connection string
sql_server_connection_string = (
    "DRIVER={SQL Server Native Client 11.0};"
    "SERVER=192.168.10.1;"
    "DATABASE=RoomAlert;"
    "UID=sa;"
    "PWD=AdmTsg@2020;"
)

# Room Alert device settings
DEVICE_IP = "125.209.65.114"
DEVICE_PORT = "8090"

# ---------------------------------------
# Background Sensor Polling and Insertion
# ---------------------------------------
def fetch_sensor_data(ip_address, port):
    """Fetches sensor data from the Room Alert device."""
    url = f"http://{ip_address}:{port}/status.json"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to the sensor at {url}: {e}")
        return None

def insert_data_to_sql_server(data):
    """Connects to SQL Server and inserts sensor data."""
    try:
        conn = pyodbc.connect(sql_server_connection_string)
        cursor = conn.cursor()

        digital_sensors = data.get('digitalSensors', [])
        for sensor in digital_sensors:
            if sensor.get('connected'):
                label = sensor.get('label', 'N/A')
                temperature = sensor.get('temperature', None)
                humidity = sensor.get('humidity', None)
                heat_index = sensor.get('heatIndex', None)
                dew_point = sensor.get('dewPoint', None)

                insert_query = """
                INSERT INTO SensorReadings (
                    timestamp,
                    sensor_name,
                    temperature,
                    humidity,
                    heat_index,
                    dew_point
                ) VALUES (?, ?, ?, ?, ?, ?)
                """

                timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
                cursor.execute(
                    insert_query,
                    (timestamp, label.strip(), temperature, humidity, heat_index, dew_point)
                )

        conn.commit()
        print("Data successfully inserted into SQL Server.")
    except pyodbc.Error as e:
        print(f"SQL Server Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

def sensor_polling_job():
    """Continuously poll Room Alert device and insert data every 5s."""
    while True:
        data = fetch_sensor_data(DEVICE_IP, DEVICE_PORT)
        if data:
            insert_data_to_sql_server(data)
        time.sleep(5)

# ------------------------
# Flask API Endpoints
# ------------------------
@app.route('/api/sensor-data', methods=['GET'])
def get_sensor_data():
    conn = None
    try:
        conn = pyodbc.connect(sql_server_connection_string)
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
    finally:
        if conn:
            conn.close()

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

    conn = None
    try:
        conn = pyodbc.connect(sql_server_connection_string)
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
            params = (sensor_name, start_time, end_time)
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
    finally:
        if conn:
            conn.close()

# ------------------------
# Start Background Thread & Flask App
# ------------------------
if __name__ == '__main__':
    # Start the sensor polling in a separate background thread
    threading.Thread(target=sensor_polling_job, daemon=True).start()

    # Start the Flask API server
    app.run(port=5000, host='0.0.0.0')
