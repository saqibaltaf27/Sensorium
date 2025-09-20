import time
import requests
import traceback
import pyodbc
from flask import Flask, jsonify
from flask_cors import CORS
from waitress import serve
import threading

app = Flask(__name__)
CORS(app)

# Sensor URLs
SENSOR_URLS = [
    "http://125.209.65.114:8091/status.json",
    "http://125.209.65.114:8090/status.json"
]

# SQL Server Connection String
sql_server_connection_string = (
    "DRIVER={SQL Server Native Client 11.0};"
    "SERVER=192.168.10.1;"
    "DATABASE=RoomAlert;"
    "UID=sa;"
    "PWD=AdmTsg@2020;"
)

def insert_data_to_sql(data):
    try:
        conn = pyodbc.connect(sql_server_connection_string)
        cursor = conn.cursor()

        general = data.get("general", {})
        if not general:
            print("⚠️ No 'general' data found, skipping...")
            return

        serial_number = general.get("serialNumber")

        # Insert into DeviceInfo if not exists
        cursor.execute("""
            IF NOT EXISTS (SELECT 1 FROM DeviceInfo WHERE serialNumber = ?)
            BEGIN
                INSERT INTO DeviceInfo
                (bid, deviceName, serialNumber, deviceType, firmwareVersion,
                 ipv4Address, macAddress, environment, temperatureScale,
                 httpPort, https, raaPushEnabled, raaPushInterval, uptime, deviceTimestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            END
        """, (
            serial_number,
            general.get("bid"),
            general.get("deviceName"),
            serial_number,
            general.get("deviceType"),
            general.get("firmwareVersion"),
            general.get("ipv4Address"),
            general.get("macAddress"),
            general.get("environment"),
            general.get("temperatureScale"),
            general.get("httpPort"),
            general.get("https"),
            general.get("raaPushEnabled"),
            general.get("raaPushInterval"),
            data.get("debug", {}).get("uptime"),
            general.get("deviceTimestamp")
        ))

        # Get deviceId
        cursor.execute("SELECT deviceId FROM DeviceInfo WHERE serialNumber = ?", (serial_number,))
        row = cursor.fetchone()
        if not row:
            raise Exception(f"Device with serialNumber {serial_number} not found after insert.")
        device_id = row[0]

        print(f"📡 Device '{general.get('deviceName')}' (ID: {device_id}) found/inserted.")

        # Digital Sensors
        for ds in data.get("digitalSensors", []):
            cursor.execute("""
                INSERT INTO DigitalSensors
                (deviceId, sensorId, label, temperature, temperatureHigh, temperatureLow,
                 humidity, humidityHigh, humidityLow, dewPoint, dewPointHigh, dewPointLow,
                 heatIndex, heatIndexHigh, heatIndexLow, alarmEnabled, alarmState, connected, type)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                device_id, ds.get("id"), ds.get("label"),
                ds.get("temperature"), ds.get("temperatureHigh"), ds.get("temperatureLow"),
                ds.get("humidity"), ds.get("humidityHigh"), ds.get("humidityLow"),
                ds.get("dewPoint"), ds.get("dewPointHigh"), ds.get("dewPointLow"),
                ds.get("heatIndex"), ds.get("heatIndexHigh"), ds.get("heatIndexLow"),
                ds.get("alarmEnabled"), ds.get("alarmState"), ds.get("connected"), ds.get("type")
            ))
            print(f"   ✅ DigitalSensor inserted: {ds.get('label')}")

        # Analog Sensors
        for an in data.get("analogSensors", []):
            cursor.execute("""
                INSERT INTO AnalogSensors (deviceId, sensorId, label, enabled, type)
                VALUES (?, ?, ?, ?, ?)
            """, (device_id, an.get("id"), an.get("label"), an.get("enabled"), an.get("type")))
            print(f"   ✅ AnalogSensor inserted: {an.get('label')}")

        # Switch Sensors
        for sw in data.get("switchSensors", []):
            cursor.execute("""
                INSERT INTO SwitchSensors (deviceId, sensorId, label, state, enabled, alarmState)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (device_id, sw.get("id"), sw.get("label"), sw.get("state"), sw.get("enabled"), sw.get("alarmState")))
            print(f"   ✅ SwitchSensor inserted: {sw.get('label')}")

        # Internal Relays
        for ir in data.get("internalRelays", []):
            cursor.execute("""
                INSERT INTO InternalRelays (deviceId, relayId, label, state)
                VALUES (?, ?, ?, ?)
            """, (device_id, ir.get("id"), ir.get("label"), ir.get("relay", {}).get("state")))
            print(f"   ✅ InternalRelay inserted: {ir.get('label')}")

        # External Relays
        for er in data.get("externalRelays", []):
            for relay in er.get("relays", []):
                cursor.execute("""
                    INSERT INTO ExternalRelays (deviceId, relayGroupId, label, relayId, state)
                    VALUES (?, ?, ?, ?, ?)
                """, (device_id, er.get("id"), er.get("label"), relay.get("id"), relay.get("state")))
                print(f"   ✅ ExternalRelay inserted: {er.get('label')} - Relay {relay.get('id')}")

        # Power Sensor
        ps = data.get("powerSensor", {})
        if ps:
            cursor.execute("""
                INSERT INTO PowerSensors (deviceId, label, connected, state, alarmEnabled, alarmState)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (device_id, ps.get("label"), ps.get("connected"), ps.get("state"),
                  ps.get("alarmEnabled"), ps.get("alarmState")))
            print(f"   ✅ PowerSensor inserted: {ps.get('label')}")

        # Debug Info
        debug = data.get("debug", {})
        if debug:
            cursor.execute("""
                INSERT INTO DebugInfo
                (deviceId, uptime, ethernetAutoNegotiate, resetButtonState, sensorPicActive,
                 sensorPicVersion, daylightSavingsEnabled, displayAmPm, displayMonthFirst, timezone)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                device_id, debug.get("uptime"),
                debug.get("ethernetConfiguration", {}).get("autoNegotiateEnabled"),
                debug.get("resetButtonState"),
                debug.get("sensorPicActive"),
                debug.get("sensorPicVersion"),
                debug.get("timeConfiguration", {}).get("daylightSavingsEnabled"),
                debug.get("timeConfiguration", {}).get("displayAmPm"),
                debug.get("timeConfiguration", {}).get("displayMonthFirst"),
                debug.get("timeConfiguration", {}).get("timezone")
            ))
            print("   ✅ DebugInfo inserted.")

        # Commit once at the end
        conn.commit()
        cursor.close()
        conn.close()

        print(f"🎉 Data inserted successfully for device '{general.get('deviceName')}' (Serial: {serial_number})\n")
        return {"success": True, "message": "Data inserted successfully", "deviceId": device_id}

    except Exception as e:
        print("❌ DB Error:", e)
        traceback.print_exc()
        return {"success": False, "message": str(e)}

def fetch_and_store():
    while True:
        for url in SENSOR_URLS:
            try:
                r = requests.get(url, timeout=10)
                r.raise_for_status()
                raw_json = r.json()

                # pick the section that belongs to this URL
                device_data = raw_json.get(url, raw_json)

                if not device_data.get("general"):
                    print(f"⚠️ No 'general' found in response from {url}")
                else:
                    insert_data_to_sql(device_data)

            except Exception as e:
                print(f"❌ Fetch error from {url}:", e)
        time.sleep(10)

@app.route("/api/sensors", methods=["GET"])
def get_sensors():
    results = {}
    for url in SENSOR_URLS:
        try:
            r = requests.get(url, timeout=30)
            r.raise_for_status()
            results[url] = r.json()
        except Exception as e:
            results[url] = {"error": str(e)}
    return jsonify(results)

if __name__ == "__main__":
    threading.Thread(target=fetch_and_store, daemon=True).start()
    serve(app, host="0.0.0.0", port=5000)
