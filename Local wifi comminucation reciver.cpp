#include <WiFi.h>
#include <WebServer.h>

// ----- WiFi Credentials -----
const char* ssid     = "YOUR_WIFI_NAME";      // Replace with your WiFi SSID
const char* password = "YOUR_WIFI_PASSWORD";  // Replace with your WiFi password

WebServer server(80);  // HTTP server on port 80

// ----- Handle /message endpoint -----
void handleMessage() {
  if (server.hasArg("text")) {
    String msg = server.arg("text");
    Serial.println("✅ Received message: " + msg);
    server.send(200, "text/plain", "Message received: " + msg);
  } else {
    server.send(400, "text/plain", "Missing ?text parameter");
  }
}

// ----- Default route -----
void handleRoot() {
  server.send(200, "text/plain", "ESP32 Web Server Running!");
}

// ----- Setup -----
void setup() {
  Serial.begin(115200);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
  Serial.print("ESP32 IP address: ");
  Serial.println(WiFi.localIP());

  // Define routes
  server.on("/", handleRoot);
  server.on("/message", handleMessage);

  server.begin();
  Serial.println("HTTP server started");
}

// ----- Loop -----
void loop() {
  server.handleClient(); // Listen for incoming HTTP requests
}
