from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import threading
import requests
import time
import pyodbc

app = FastAPI()

# ----------------------------
# CORS
# ----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# SQL Server Connection
# ----------------------------
sql_server_connection_string = (
    "DRIVER={SQL Server Native Client 11.0};"
    "SERVER=192.168.10.1;"
    "DATABASE=RoomAlert;"
    "UID=sa;"
    "PWD=AdmTsg@2020;"
)

# ----------------------------
# Room Alert Device Settings
# ----------------------------
DEVICE_IP = "125.209.65.114"
DEVICE_PORT = "8090"

# ----------------------------
# Background Sensor Polling
# ----------------------------
def fetch_sensor_data(ip_address, port):
    url = f"http://{ip_address}:{port}/status.json"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to sensor at {url}: {e}")
        return None

def insert_data_to_sql_server(data):
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
        print("Data inserted into SQL Server")
    except pyodbc.Error as e:
        print(f"SQL Server Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

def sensor_polling_job():
    while True:
        data = fetch_sensor_data(DEVICE_IP, DEVICE_PORT)
        if data:
            insert_data_to_sql_server(data)
        time.sleep(5)

# ----------------------------
# API Endpoints
# ----------------------------
@app.get("/api/sensor-data")
def get_sensor_data():
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
        return rows
    except pyodbc.Error as e:
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve sensor data")
    finally:
        if 'conn' in locals():
            conn.close()

@app.get("/api/sensor-history")
def get_sensor_history(
    sensor_name: str = Query(..., description="Sensor name"),
    time_range: str = Query("daily", description="daily, weekly, monthly")
):
    end_time = datetime.now()
    if time_range == 'daily':
        start_time = end_time - timedelta(hours=24)
    elif time_range == 'weekly':
        start_time = end_time - timedelta(days=7)
    elif time_range == 'monthly':
        start_time = end_time - timedelta(days=30)
    else:
        raise HTTPException(status_code=400, detail="Invalid time_range")

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

        return rows
    except pyodbc.Error as e:
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve history")
    finally:
        if 'conn' in locals():
            conn.close()

# ----------------------------
# Start Background Thread
# ----------------------------
threading.Thread(target=sensor_polling_job, daemon=True).start()
