#include <WiFi.h>
#include <PubSubClient.h>

// ----- WiFi -----
const char* ssid = "ATHARVA_PRESENTATIONHALL";
const char* password = "0110AAA022";

// ----- MQTT Broker -----
const char* mqtt_server = "192.168.26.100"; // Replace with your RPi IP running Mosquitto

WiFiClient espClient;
PubSubClient client(espClient);

// ----- Callback for received messages -----
void callback(char* topic, byte* payload, unsigned int length) {
  String msg;
  for (int i = 0; i < length; i++) {
    msg += (char)payload[i];
  }
  Serial.print("📩 Message received on topic [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(msg);

  // Example: toggle GPIO if message == "Ambulance"
  if (msg == "Ambulance") {
    digitalWrite(2, HIGH);  // built-in LED on ESP32
    delay(1000);
    digitalWrite(2, LOW);
  }
}

// ----- Reconnect to MQTT -----
void reconnect() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    if (client.connect("ESP32Client")) {
      Serial.println("connected");
      client.subscribe("trafficore/ambulance"); // topic to listen to
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 2s");
      delay(2000);
    }
  }
}

void setup() {
  pinMode(2, OUTPUT);
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");

  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
}
