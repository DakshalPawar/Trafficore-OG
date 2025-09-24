#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

const char* ssid = "ATHARVA_PRESENTATIONHALL";
const char* password = "0110AAA022";
const char* mqtt_server = "192.168.26.192";  // RPi's LAN IP
WiFiClient espClient;
PubSubClient client(espClient);

void callback(char* topic, byte* payload, unsigned int length) {
  payload[length] = '\0';  // null terminate
  String msg = String((char*)payload);

  Serial.print("Message arrived: ");
  Serial.println(msg);

  // Parse JSON
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, msg);

  if (!error) {
    String direction = doc["direction"];
    Serial.print("Direction: ");
    Serial.println(direction);

    // Add GPIO control logic here
    if (direction == "left") {
      Serial.println("🔴 Left signal GREEN");
    } else if (direction == "right") {
      Serial.println("🟢 Right signal GREEN");
    } else if (direction == "straight") {
      Serial.println("🟡 Straight signal GREEN");
    }
  }
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("ESP32Client")) {
      client.subscribe("trafficore/ambulance");
    } else {
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");

  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
}
