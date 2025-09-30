import RPi.GPIO as GPIO
import serial
import time

# Serial connection to ESP32 (adjust port if needed)
ser = serial.Serial('/dev/ttyUSB0', 115200, timeout=1)

# Define button pins
direction_buttons = {
    "LEFT": 17,
    "STRAIGHT": 27,
    "RIGHT": 22
}

path_buttons = {
    "A": 5,
    "B": 6,
    "C": 13,
    "D": 19
}

reset_button = 26  # dedicated reset/cancel button

GPIO.setmode(GPIO.BCM)

# Setup buttons
for pin in direction_buttons.values():
    GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)

for pin in path_buttons.values():
    GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)

GPIO.setup(reset_button, GPIO.IN, pull_up_down=GPIO.PUD_UP)

selected_path = None
selected_direction = None

def send_command(path, direction):
    command = f"{path}_{direction}"
    ser.write((command + "\n").encode('utf-8'))
    print(f"Sent: {command}")

try:
    print("System Ready. Waiting for button press...")
    while True:
        # Reset button check
        if GPIO.input(reset_button) == GPIO.LOW:
            selected_path = None
            selected_direction = None
            send_command("RESET", "ALL")   # <---- send reset to ESP
            print("Selection reset by operator")
            time.sleep(0.5)

        # Path selection
        for path, pin in path_buttons.items():
            if GPIO.input(pin) == GPIO.LOW:
                selected_path = path
                print(f"Selected Path: {path}")
                time.sleep(0.3)

        # Direction selection
        for direction, pin in direction_buttons.items():
            if GPIO.input(pin) == GPIO.LOW:
                selected_direction = direction
                print(f"Selected Direction: {direction}")
                time.sleep(0.3)

        # If both are selected, send to ESP32
        if selected_path and selected_direction:
            send_command(selected_path, selected_direction)
            selected_path = None
            selected_direction = None
            time.sleep(0.5)

except KeyboardInterrupt:
    GPIO.cleanup()
    ser.close()
