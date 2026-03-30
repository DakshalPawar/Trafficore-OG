# 🚦 ESP32 Traffic Controller Module

## 📌 Overview

This module contains the ESP32-based implementation of the Trafficore system, responsible for controlling traffic signals and handling real-time communication using MQTT.

It demonstrates the evolution from a basic traffic signal controller to a smart IoT-enabled system with emergency vehicle prioritization.

---

## ⚙️ What This Module Covers

* Basic 4-way traffic signal control logic
* MQTT-based communication with backend systems
* JSON-based message handling for structured control
* Emergency vehicle override mechanism

---

## 📂 File Breakdown

### 🔹 4-way traffic signal controller using ESP32

Implements a basic traffic light system that cycles through all directions using timed delays.

---

### 🔹 MQTT client

Basic MQTT subscriber that listens for messages and triggers actions based on simple commands.

---

### 🔹 Local ESP testing

ESP32 web server used for testing communication via HTTP requests.

---

### 🔹 Final MQTT traffic controller with ambulance priority

Main implementation of the system:

* Subscribes to MQTT messages
* Parses JSON data (path & direction)
* Overrides normal traffic cycle
* Prioritizes emergency vehicles in real time

---


## 🔄 System Flow

ESP32 subscribes to MQTT topic → Receives message → Parses data → Controls traffic signals

---

## 🛠 Technologies Used

* ESP32 (Arduino IDE)
* MQTT Protocol (PubSubClient)
* ArduinoJson
* WiFi Communication

---

## 🎯 Purpose

This module acts as the hardware-level controller in the Trafficore system, enabling real-time traffic signal management and emergency prioritization.

---
