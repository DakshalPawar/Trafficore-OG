# 🚦 Trafficore – Intelligent Emergency Traffic Control System

## 📌 Overview

Trafficore is an intelligent traffic management system designed to prioritize emergency vehicles (such as ambulances) in heavy traffic conditions.

The system enables ambulances to dynamically control traffic signals along their route, ensuring faster response times while also allowing hospitals and administrators to monitor the situation in real time.

---

## 🚑 Core Idea

In critical situations, delays caused by traffic can cost lives.

Trafficore solves this by:

* Giving emergency vehicles the ability to turn traffic signals green along their route
* Enabling hospitals to monitor patients in real time during transit
* Allowing doctors to guide patient helpers remotely in emergencies

---

## 🧠 System Workflow

### 1. 🚦 Smart Traffic Control

* Emergency vehicles use IoT devices (ESP32/Raspberry Pi)
* Signals are controlled using MQTT protocol
* Traffic lights turn green dynamically based on ambulance route

---

### 2. 🏥 Hospital Dashboard

Used by doctors and hospital staff.

Features:

* 📹 Live patient video streaming (HLS protocol)
* 📊 Real-time patient details
* 💬 Two-way communication (WebSockets chat)
* 📍 Live GPS tracking of ambulance
* ⏱️ Estimated arrival time for preparation

---

### 3. 🛠️ Admin Dashboard

Used for system monitoring and control.

Features:

* 🚑 Ambulance registration & tracking (with unique IDs)
* 🏥 Hospital database management
* 🗺️ Live map showing ambulance movement
* 👨‍✈️ Driver and vehicle details
* 🚦 Signal usage tracking
* 🔐 Video-based authentication to prevent misuse

---

### 4. 🚐 Ambulance Dashboard

Used by drivers and patient helpers.

Features:

* Patient data entry
* Communication with hospital
* Route tracking support

---

## 🏗️ Tech Stack

### 👨‍💻 Frontend

* HTML, CSS, JavaScript

### ⚙️ Backend

* Java Spring Boot

### 🗄️ Database

* MySQL

### 🔌 IoT & Communication

* ESP32 & Raspberry Pi
* MQTT Protocol (Mosquitto)

### 📡 Real-Time Technologies

* HLS (Live video streaming)
* WebSockets (2-way communication)

---

## 🚀 Key Features

* Emergency vehicle prioritization 🚑
* Real-time traffic signal control 🚦
* Live patient monitoring 📹
* Doctor-to-ambulance communication 💬
* GPS-based tracking 📍
* Secure system with authentication 🔐

---

## 📌 Project Status

🚧 Currently under development and being actively improved.

---

## 🔮 Future Scope

* AI-based traffic prediction
* Automatic route optimization
* Integration with smart city infrastructure
* Cloud deployment (AWS)

---

## 🤝 Contributors

* Kanak Salvi
* Dakshal Pawar
* Siddhant Prajapati
* Harsh Pattebahadur


