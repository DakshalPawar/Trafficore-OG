// ================= Sidebar =================
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("closed");
}

// ================= Map (GPS) =================
const mapElement = document.getElementById("map");
if (mapElement) {
  setTimeout(() => {
    document.getElementById("gps-spinner").classList.add("hidden");
    mapElement.classList.remove("hidden");

    const map = L.map('map').setView([19.0760, 72.8777], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    const ambulanceIcon = L.icon({
      iconUrl: "assets/ambulance.png",
      iconSize: [40, 40]
    });

    const ambulanceMarker = L.marker([19.0760, 72.8777], { icon: ambulanceIcon }).addTo(map)
        .bindPopup("🚑 Ambulance Location")
        .openPopup();

    let lat = 19.0760, lng = 72.8777;
    setInterval(() => {
      lat += (Math.random() - 0.5) * 0.001;
      lng += (Math.random() - 0.5) * 0.001;
      ambulanceMarker.setLatLng([lat, lng]);
      map.panTo([lat, lng]);

      const eta = Math.floor(Math.random() * 20) + 5;
      document.getElementById("alert-list").innerHTML = `
        <li>Oxygen level dropped below 90%!</li>
        <li>Ambulance ETA: ${eta} minutes</li>
      `;
      document.getElementById("alert-badge").textContent = 2;
    }, 5000);
  }, 2000);
}

// ================= Camera Spinner =================
const cameraFeed = document.getElementById("camera-feed");
if (cameraFeed) {
  setTimeout(() => {
    document.getElementById("camera-spinner").classList.add("hidden");
    cameraFeed.classList.remove("hidden");
  }, 2000);
}

// ================= WebSocket: Patient Info & Stats =================
const chatBox = document.getElementById("chat-box"); // chat/messages area

// Add missing IDs for patient stats in HTML
const statsIds = ["heart_rate", "blood_pressure", "oxygen", "temperature"];
statsIds.forEach(id => {
  if (!document.getElementById(id)) {
    const td = document.querySelector(`#stats tbody tr:nth-child(${statsIds.indexOf(id)+1}) td:nth-child(2)`);
    td.id = id;
  }
});

// MQTT over WebSockets
const PI_IP = "192.168.0.232"; // Replace with your Pi IP
const MQTT_PORT = 8001; // WebSocket port from your mosquitto config
const TOPIC = "hospital/patient";

// Connect to MQTT broker over WebSocket
const client = mqtt.connect(`ws://${PI_IP}:${MQTT_PORT}`);

client.on('connect', () => {
  console.log("✅ Connected to MQTT broker over WebSocket");
  client.subscribe(TOPIC, (err) => {
    if (err) console.error("Subscription error:", err);
  });
});

client.on('message', (topic, message) => {
  const data = JSON.parse(message.toString());

  // Update patient info card
  document.getElementById("name").innerText = data.name;
  document.getElementById("age").innerText = data.age;
  document.getElementById("blood_type").innerText = data.blood_type;
  document.getElementById("condition").innerText = data.condition;
  document.getElementById("accident").innerText = data.accident_details;

  // Update patient stats table
  document.getElementById("heart_rate").innerText = data.heart_rate;
  document.getElementById("blood_pressure").innerText = data.blood_pressure;
  document.getElementById("oxygen").innerText = data.oxygen;
  document.getElementById("temperature").innerText = data.temperature;

  // Optional: update alert or chat area
  const chatBox = document.getElementById("chat-box");
  if (chatBox) {
    chatBox.innerHTML = `<p>🚑 Patient Info Updated: ${data.name}, Condition: ${data.condition}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

// ================= Camera Stream =================
const video = document.getElementById('cam');
const streamURL = "http://192.168.0.232:8000/stream.m3u8"
//http://192.168.0.192:8080/player.html"( teplace when needed); // Pi HLS stream (replace IP if needed)

if (video) {
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(streamURL);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(err => console.error("Autoplay failed:", err));
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    // Safari/iOS native HLS
    video.src = streamURL;
    video.addEventListener("loadedmetadata", () => {
      video.play().catch(err => console.error("Play failed:", err));
    });
  } else {
    console.error("❌ Browser does not support HLS streaming.");
    alert("Your browser does not support HLS streaming. Try Chrome/Edge/Firefox with hls.js.");
  }
}



