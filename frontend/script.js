// ================= Configuration =================
const API_BASE_URL = "http://localhost:8080/api"; // Backend API URL
const MQTT_BROKER = "tcp://192.168.0.232:1883"; // Optional - keep for real-time
const PI_IP = "192.168.0.232"; // Raspberry Pi IP for camera stream (if needed)
const MQTT_PORT = 8001;
const TOPICS = {
  PATIENT: "hospital/patient",
  GPS: "hospital/gps",
  CHAT_DOCTOR: "hospital/chat/doctor",
  CHAT_AMBULANCE: "hospital/chat/ambulance"
};

// ================= Sidebar =================
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("closed");
}

// ================= MQTT Connection =================
const client = mqtt.connect(`ws://${PI_IP}:${MQTT_PORT}`);

// ================= Load Initial Data from Backend =================
async function loadInitialData() {
  try {
    // Get patient data
    const patientResponse = await fetch(`${API_BASE_URL}/patients`);
    const patients = await patientResponse.json();

    if (patients && patients.length > 0) {
      const patient = patients[0]; // Get first patient
      console.log("📋 Patient loaded from backend:", patient);

      // Update dashboard with patient data
      updateElement("name", patient.name);
      updateElement("age", patient.age);
      updateElement("blood_type", patient.blood_type);
      updateElement("condition", patient.condition);
      updateElement("accident", patient.accident_details);

      // Update vitals
      updateElement("heart-rate", patient.heart_rate + " bpm");
      updateElement("blood-pressure", patient.blood_pressure + " mmHg");
      updateElement("oxygen-level", patient.oxygen + "%");
      updateElement("temperature", patient.temperature + "°C");
    }

    // Get ambulances
    const ambulanceResponse = await fetch(`${API_BASE_URL}/ambulances`);
    const ambulances = ambulanceResponse.json();
    console.log("🚑 Ambulances loaded:", ambulances);

    // Get alerts
    const alertResponse = await fetch(`${API_BASE_URL}/alerts/unacknowledged`);
    const alerts = alertResponse.json();
    console.log("⚠️ Alerts loaded:", alerts);

  } catch (error) {
    console.error("❌ Error loading initial data:", error);
  }
}

// Call on page load
window.addEventListener('load', loadInitialData);

client.on('connect', () => {
  console.log("✅ Connected to MQTT broker over WebSocket");

  // Subscribe to all topics
  client.subscribe(TOPICS.PATIENT, (err) => {
    if (err) console.error("Patient subscription error:", err);
    else console.log("📋 Subscribed to patient data");
  });

  client.subscribe(TOPICS.GPS, (err) => {
    if (err) console.error("GPS subscription error:", err);
    else console.log("📍 Subscribed to GPS data");
  });

  client.subscribe(TOPICS.CHAT_AMBULANCE, (err) => {
    if (err) console.error("Chat subscription error:", err);
    else console.log("💬 Subscribed to ambulance chat");
  });
});

client.on('error', (err) => {
  console.error("❌ MQTT Connection Error:", err);
});

// ================= Map (GPS) =================
let map, ambulanceMarker;
const mapElement = document.getElementById("map");

if (mapElement) {
  setTimeout(() => {
    document.getElementById("gps-spinner").classList.add("hidden");
    mapElement.classList.remove("hidden");

    // Initialize map
    map = L.map('map').setView([19.0760, 72.8777], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // Ambulance icon
    const ambulanceIcon = L.icon({
      iconUrl: "assets/ambulance.png",
      iconSize: [40, 40]
    });

    // Initial marker
    ambulanceMarker = L.marker([19.0760, 72.8777], { icon: ambulanceIcon })
        .addTo(map)
        .bindPopup("🚑 Ambulance Location")
        .openPopup();
  }, 2000);
}

// Handle GPS updates from MQTT
// client.on('message', (topic, message) => {
//   const data = JSON.parse(message.toString());
//
//   // ================= GPS Updates =================
//   if (topic === TOPICS.GPS) {
//     if (ambulanceMarker && map) {
//       const { latitude, longitude, eta } = data;
//       ambulanceMarker.setLatLng([latitude, longitude]);
//       map.panTo([latitude, longitude]);
//
//       // Update ETA in alerts
//       updateAlerts(eta);
//     }
//   }

// ================= Handle MQTT Messages (Real-time Updates) =================
client.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    // ================= GPS Updates =================
    if (topic === TOPICS.GPS) {
      console.log("📍 GPS Update from MQTT:", data);
      if (ambulanceMarker && map) {
        const { latitude, longitude, eta } = data;
        ambulanceMarker.setLatLng([latitude, longitude]);
        map.panTo([latitude, longitude]);
        updateAlerts(eta);
      }
    }

    // ================= Patient Data Updates =================
    if (topic === TOPICS.PATIENT) {
      console.log("📊 Patient Data from MQTT:", data);
      updateElement("name", data.name);
      updateElement("age", data.age);
      updateElement("blood_type", data.blood_type);
      updateElement("condition", data.condition);
      updateElement("accident", data.accident_details);

      // Update vitals
      const statsTable = document.querySelector("#stats tbody");
      if (statsTable) {
        statsTable.innerHTML = `
          <tr><td>Heart Rate</td><td>${data.heart_rate || '--'} bpm</td></tr>
          <tr><td>Blood Pressure</td><td>${data.blood_pressure || '--'} mmHg</td></tr>
          <tr><td>Oxygen Level</td><td>${data.oxygen || '--'}%</td></tr>
          <tr><td>Temperature</td><td>${data.temperature || '--'}°C</td></tr>
        `;
      }

      checkCriticalValues(data);
    }

    // ================= Chat Messages =================
    if (topic === TOPICS.CHAT_AMBULANCE) {
      console.log("💬 Chat from MQTT:", data);
      displayChatMessage(data.message, 'ambulance', data.timestamp);
    }
  } catch (error) {
    console.error("Error processing MQTT message:", error);
  }
});

  // ================= Patient Data Updates =================
  if (topic === TOPICS.PATIENT) {
    // Update patient info
    updateElement("name", data.name);
    updateElement("age", data.age);
    updateElement("blood_type", data.blood_type);
    updateElement("condition", data.condition);
    updateElement("accident", data.accident_details);

    // Update patient stats table
    const statsTable = document.querySelector("#stats tbody");
    if (statsTable) {
      statsTable.innerHTML = `
        <tr><td>Heart Rate</td><td>${data.heart_rate || '--'} bpm</td></tr>
        <tr><td>Blood Pressure</td><td>${data.blood_pressure || '--'} mmHg</td></tr>
        <tr><td>Oxygen Level</td><td>${data.oxygen || '--'}%</td></tr>
        <tr><td>Temperature</td><td>${data.temperature || '--'}°C</td></tr>
      `;
    }

    // Check for critical values and update alerts
    checkCriticalValues(data);
  }

  // ================= Chat Messages =================
  if (topic === TOPICS.CHAT_AMBULANCE) {
    displayChatMessage(data.message, 'ambulance', data.timestamp);
  };

// ================= Helper Functions =================
function updateElement(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.innerText = value || '--';
  }
}

function updateAlerts(eta) {
  const alertList = document.getElementById("alert-list");
  if (alertList) {
    const alerts = alertList.querySelectorAll('li');
    alerts.forEach(alert => {
      if (alert.textContent.includes('ETA')) {
        alert.innerHTML = `🚑 Ambulance ETA: ${eta} minutes`;
      }
    });
  }
}

function checkCriticalValues(data) {
  const alertList = document.getElementById("alert-list");
  if (!alertList) return;

  const alerts = [];

  // Check oxygen level
  if (data.oxygen && parseFloat(data.oxygen) < 90) {
    alerts.push("⚠️ Oxygen level dropped below 90%!");
  }

  // Check heart rate
  if (data.heart_rate) {
    const hr = parseInt(data.heart_rate);
    if (hr > 120 || hr < 60) {
      alerts.push("⚠️ Abnormal heart rate detected!");
    }
  }

  // Check temperature
  if (data.temperature) {
    const temp = parseFloat(data.temperature);
    if (temp > 38 || temp < 36) {
      alerts.push("⚠️ Abnormal body temperature!");
    }
  }

  // Update alert badge
  const badge = document.getElementById("alert-badge");
  if (badge) {
    badge.textContent = alerts.length;
  }

  // Add ETA if available
  alerts.push("🚑 Ambulance en route...");

  alertList.innerHTML = alerts.map(alert => `<li>${alert}</li>`).join('');
}

// ================= Chat System =================
function displayChatMessage(message, sender, timestamp) {
  const chatBox = document.getElementById("chat-box");
  if (!chatBox) return;

  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${sender}`;

  const time = timestamp ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();

  messageDiv.innerHTML = `
    <div class="message-header">
      <strong>${sender === 'ambulance' ? '🚑 Ambulance' : '🏥 Doctor'}</strong>
      <span class="timestamp">${time}</span>
    </div>
    <div class="message-body">${message}</div>
  `;

  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Send chat message
// function sendChatMessage() {
//   const input = document.getElementById("chat-input");
//   if (!input || !input.value.trim()) return;
//
//   const message = {
//     message: input.value.trim(),
//     timestamp: new Date().toISOString()
//   };
//
//   // Publish to MQTT
//   client.publish(TOPICS.CHAT_DOCTOR, JSON.stringify(message));
//
//   // Display in chat box
//   displayChatMessage(message.message, 'doctor', message.timestamp);
//
//   input.value = '';
// }

function sendChatMessage() {
  const input = document.getElementById("chat-input");
  if (!input || !input.value.trim()) return;

  const message = input.value.trim();
  const patientId = 1; // Use actual patient ID from dashboard

  // Send to backend
  sendMessageToBackend(patientId, "Dr. Sharma", "DOCTOR", message);

  // Also publish to MQTT for real-time
  client.publish(TOPICS.CHAT_DOCTOR, JSON.stringify({
    message: message,
    timestamp: new Date().toISOString()
  }));

  // Display in chat box
  displayChatMessage(message, 'doctor', new Date().toISOString());
  input.value = '';
}
// ```
//
// ---
//
// ## ✅ STEP 6: Test Integration (5 min)
//
// ### **Test 1: Open Dashboard**
//
// 1. **Keep backend running** in IntelliJ
// 2. **Open your HTML file** in browser
// 3. **Open DevTools** (F12 → Console)
// 4. You should see:
// ${}```
// ✅ Patient loaded from backend: {name: "Raj Kumar", age: 25, ...}
// 🚑 Ambulances loaded: [{id: 1, ...}, ...]
// ⚠️ Alerts loaded: [{id: 1, ...}, ...]

// Allow Enter key to send message
const chatInput = document.getElementById("chat-input");
if (chatInput) {
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  });
}

// ================= Camera Stream =================
const video = document.getElementById('cam');
const streamURL = "http://192.168.0.232:8000/stream.m3u8"; // Update with your Pi camera stream

if (video) {
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(streamURL);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(err => console.error("Autoplay failed:", err));
    });
    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error("HLS Error:", data);
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = streamURL;
    video.addEventListener("loadedmetadata", () => {
      video.play().catch(err => console.error("Play failed:", err));
    });
  } else {
    console.error("❌ Browser does not support HLS streaming.");
  }
}

// ================= Camera Page Spinner =================
const cameraFeed = document.getElementById("camera-feed");
if (cameraFeed) {
  setTimeout(() => {
    const spinner = document.getElementById("camera-spinner");
    if (spinner) spinner.classList.add("hidden");
    cameraFeed.classList.remove("hidden");
  }, 2000);
}

// Make sendChatMessage available globally
window.sendChatMessage = sendChatMessage;

// ================= Backend API Functions =================

// Get all patients from backend
async function getPatients() {
  try {
    const response = await fetch(`${API_BASE_URL}/patients`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching patients:", error);
    return [];
  }
}

// Get ambulances from backend
async function getAmbulances() {
  try {
    const response = await fetch(`${API_BASE_URL}/ambulances`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching ambulances:", error);
    return [];
  }
}

// Get alerts from backend
async function getAlerts(patientId = null) {
  try {
    const url = patientId
        ? `${API_BASE_URL}/alerts/patient/${patientId}`
        : `${API_BASE_URL}/alerts/unacknowledged`;
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return [];
  }
}

// Get messages from backend
async function getMessages(patientId) {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/patient/${patientId}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

// Create new patient
async function createPatient(patientData) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData)
    });
    return await response.json();
  } catch (error) {
    console.error("Error creating patient:", error);
  }
}

// Update patient vitals
async function updatePatientVitals(patientId, vitals) {
  try {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/vitals`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vitals)
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating vitals:", error);
  }
}

// Assign ambulance to patient
async function assignAmbulance(ambulanceId, patientId) {
  try {
    const response = await fetch(
        `${API_BASE_URL}/ambulances/${ambulanceId}/assign/${patientId}`,
        { method: 'POST' }
    );
    return await response.json();
  } catch (error) {
    console.error("Error assigning ambulance:", error);
  }
}

// Update ambulance location (GPS)
async function updateAmbulanceLocation(ambulanceId, latitude, longitude, eta) {
  try {
    const response = await fetch(
        `${API_BASE_URL}/ambulances/${ambulanceId}/location?latitude=${latitude}&longitude=${longitude}&eta=${eta}`,
        { method: 'PUT' }
    );
    return await response.json();
  } catch (error) {
    console.error("Error updating location:", error);
  }
}

// Send message via backend
async function sendMessageToBackend(patientId, sender, senderType, message) {
  try {
    const response = await fetch(
        `${API_BASE_URL}/messages?patientId=${patientId}&sender=${sender}&senderType=${senderType}&message=${encodeURIComponent(message)}`,
        { method: 'POST' }
    );
    return await response.json();
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

// Create alert
async function createAlert(patientId, alertType, message, severity) {
  try {
    const response = await fetch(
        `${API_BASE_URL}/alerts?patientId=${patientId}&alertType=${alertType}&message=${encodeURIComponent(message)}&severity=${severity}`,
        { method: 'POST' }
    );
    return await response.json();
  } catch (error) {
    console.error("Error creating alert:", error);
  }
}

// Acknowledge alert
async function acknowledgeAlert(alertId, acknowledgedBy) {
  try {
    const response = await fetch(
        `${API_BASE_URL}/alerts/${alertId}/acknowledge?acknowledgedBy=${acknowledgedBy}`,
        { method: 'PUT' }
    );
    return await response.json();
  } catch (error) {
    console.error("Error acknowledging alert:", error);
  }
}




