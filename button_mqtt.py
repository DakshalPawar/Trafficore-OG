# A Raspberry Pi script that uses physical buttons to send MQTT messages for ambulance signal priority.
# Button Press → Raspberry Pi → MQTT → ESP32 → Traffic Signal

import RPi.GPIO as GPIO
import time
import json
import paho.mqtt.client as mqtt

# MQTT setup
broker = "localhost"  # since Mosquitto runs on the Pi itself
topic = "trafficore/ambulance"

client = mqtt.Client()
client.connect(broker, 1883, 60)

# GPIO setup
GPIO.setmode(GPIO.BCM)
buttons = {
    17: "left",
    27: "right",
    22: "straight"
}

for pin in buttons.keys():
    GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)

print("Press a button to send MQTT message...")

try:
    while True:
        for pin, direction in buttons.items():
            if GPIO.input(pin) == GPIO.LOW:  # button pressed
                msg = {
                    "id": "VU3-6-DP",   # your ambulance ID
                    "direction": direction,
                    "priority": "high"
                }
                client.publish(topic, json.dumps(msg))
                print(f"Published: {msg}")
                time.sleep(0.5)  # debounce delay
        time.sleep(0.1)

except KeyboardInterrupt:
    print("Exiting...")
    GPIO.cleanup()
    client.disconnect()
