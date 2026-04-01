# This code was for live data transmissions through websocts but due to crtain reson the the code wasnt working but we have to find its alteernative 
# Basic work flow -- User Input → Raspberry Pi → MQTT → Backend / Dashboard

import paho.mqtt.client as mqtt
import json

# MQTT broker info
BROKER = "localhost"  # Pi is running the broker
PORT = 1883
TOPIC = "hospital/patient"

# Create MQTT client
client = mqtt.Client()
client.connect(BROKER, PORT, 60)

def publish_patient():
    print("\n--- Enter Patient Details ---")
    patient = {
        "name": input("Name: "),
        "age": input("Age: "),
        "blood_type": input("Blood Type: "),
        "condition": input("Condition: "),
        "accident_details": input("Accident Details: "),
        "heart_rate": input("Heart Rate (bpm): "),
        "blood_pressure": input("Blood Pressure (mmHg): "),
        "oxygen": input("Oxygen Level (%): "),
        "temperature": input("Temperature (°C): ")
    }

    # Convert to JSON and publish
    client.publish(TOPIC, json.dumps(patient))
    print("✅ Patient data sent!\n")

if __name__ == "__main__":
    while True:
        publish_patient()
        cont = input("Publish another patient? (y/n): ").lower()
        if cont != 'y':
            break
    client.disconnect()
