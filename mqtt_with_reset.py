# A Raspberry Pi-based MQTT control system that sends structured ambulance priority commands (path + direction + reset) using physical buttons.
# Select which road (A/B/C/D)
# Select which direction (LEFT/RIGHT/STRAIGHT)
# Send it to ESP32 via MQTT

import RPi.GPIO as GPIO
import time
import json
import paho.mqtt.client as mqtt

# MQTT setup
broker = "localhost"  # Pi runs Mosquitto
topic = "trafficore/ambulance"

client = mqtt.Client()
client.connect(broker, 1883, 60)

# GPIO setup
GPIO.setmode(GPIO.BCM)

direction_buttons = {
    17: "LEFT",
    27: "STRAIGHT",
    22: "RIGHT"
}

path_buttons = {
    5: "A",
    6: "B",
    13: "C",
    19: "D"
}

reset_button = 26

for pin in direction_buttons.keys():
    GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)
for pin in path_buttons.keys():
    GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)
GPIO.setup(reset_button, GPIO.IN, pull_up_down=GPIO.PUD_UP)

selected_path = None
selected_direction = None

def send_command(path=None, direction=None, reset=False):
    msg = {}
    if reset:
        msg["reset"] = True
    else:
        msg["path"] = path
        msg["direction"] = direction
    client.publish(topic, json.dumps(msg))
    print(f"Published: {msg}")

try:
    print("System Ready. Waiting for button press...")
    while True:
        # Reset button
        if GPIO.input(reset_button) == GPIO.LOW:
            selected_path = None
            selected_direction = None
            send_command(reset=True)
            time.sleep(0.5)

        # Path selection
        for pin, path in path_buttons.items():
            if GPIO.input(pin) == GPIO.LOW:
                selected_path = path
                print(f"Selected Path: {path}")
                time.sleep(0.3)

        # Direction selection
        for pin, direction in direction_buttons.items():
            if GPIO.input(pin) == GPIO.LOW:
                selected_direction = direction
                print(f"Selected Direction: {direction}")
                time.sleep(0.3)

        # Send if both selected
        if selected_path and selected_direction:
            send_command(selected_path, selected_direction)
            selected_path = None
            selected_direction = None
            time.sleep(0.5)

        time.sleep(0.1)

except KeyboardInterrupt:
    GPIO.cleanup()
    client.disconnect()
