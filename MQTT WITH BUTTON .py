#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// -------------------- WiFi & MQTT --------------------
const char* ssid = "ATHARVA_PRESENTATIONHALL";
const char* password = "0110AAA022";
const char* mqtt_server = "192.168.26.192";  // Pi's LAN IP

WiFiClient espClient;
PubSubClient client(espClient);

// -------------------- Pins --------------------
#define YELLOW_PIN 18  // updated

int RED[4]    = {4, 12, 19, 32};
int GREEN[4]  = {5, 13, 21, 23}; // updated green
int LEFT[4]   = {16, 14, 22, 26};
int RIGHT[4]  = {17, 15, 27, 33};

int currentSide = 0;  // Normal cycle

// Override variables
bool overrideMode = false;
String overridePath = "";
String overrideDirection = "";

// Timing
unsigned long lastChange = 0;
bool yellowOn = false;

// -------------------- MQTT Callback --------------------
void callback(char* topic, byte* payload, unsigned int length) {
  payload[length] = '\0';
  String msg = String((char*)payload);
  Serial.print("Received MQTT: ");
  Serial.println(msg);

  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, msg);
  if (!error) {
    if (doc.containsKey("reset") && doc["reset"] == true) {
      overrideMode = false;
      Serial.println("RESET received → returning to normal cycle");
    }
    if (doc.containsKey("path") && doc.containsKey("direction")) {
      overridePath = String((const char*)doc["path"]);
      overrideDirection = String((const char*)doc["direction"]);
      overrideMode = true;
      Serial.print("OVERRIDE → Path: ");
      Serial.print(overridePath);
      Serial.print(" Direction: ");
      Serial.println(overrideDirection);
    }
  }
}

// -------------------- MQTT Reconnect --------------------
void reconnect() {
  while (!client.connected()) {
    if (client.connect("ESP32Client")) {
      client.subscribe("trafficore/ambulance");
      Serial.println("MQTT Connected and Subscribed");
    } else {
      delay(2000);
      Serial.println("Trying MQTT Reconnect...");
    }
  }
}

// -------------------- Setup --------------------
void setup() {
  Serial.begin(115200);

  pinMode(YELLOW_PIN, OUTPUT);
  for (int i = 0; i < 4; i++) {
    pinMode(RED[i], OUTPUT);
    pinMode(GREEN[i], OUTPUT);
    pinMode(LEFT[i], OUTPUT);
    pinMode(RIGHT[i], OUTPUT);
  }

  setAllRed();

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");

  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  lastChange = millis();
}

// -------------------- Main Loop --------------------
void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  if (overrideMode) {
    overrideCycle();
  } else {
    normalCycle();
  }
}

// -------------------- Normal Cycle --------------------
void normalCycle() {
  static bool greenOn = false;
  unsigned long now = millis();

  if (!greenOn) {
    // Start yellow transition
    flashYellowNonBlocking(2000, 500); // 2 sec, normal speed
    greenOn = true;
    lastChange = now;
    setAllRed();
    digitalWrite(GREEN[currentSide], HIGH);
    digitalWrite(RED[currentSide], LOW);
    Serial.print("NORMAL → SIDE ");
    Serial.print(currentSide);
    Serial.println(" GREEN");
  }

  // Hold green for 3 sec
  if (now - lastChange >= 3000) {
    digitalWrite(GREEN[currentSide], LOW);
    greenOn = false;
    currentSide = (currentSide + 1) % 4;
    lastChange = now;
  }
}

// -------------------- Override Cycle --------------------
void overrideCycle() {
  static bool overrideYellowDone = false;
  int sideIndex = overridePath.charAt(0) - 'A';

  if (!overrideYellowDone) {
    flashYellowNonBlocking(2000, 200); // faster yellow before override
    overrideYellowDone = true;
  }

  setAllRed();

  digitalWrite(RED[sideIndex], LOW);
  digitalWrite(GREEN[sideIndex], HIGH);

  if (overrideDirection == "LEFT") digitalWrite(LEFT[sideIndex], HIGH);
  else if (overrideDirection == "RIGHT") digitalWrite(RIGHT[sideIndex], HIGH);
  else if (overrideDirection == "STRAIGHT") ; // Only green

  Serial.print("OVERRIDE ACTIVE → Path: ");
  Serial.print(overridePath);
  Serial.print(" Direction: ");
  Serial.println(overrideDirection);
}

// -------------------- Helper Functions --------------------
void setAllRed() {
  for (int i = 0; i < 4; i++) {
    digitalWrite(RED[i], HIGH);
    digitalWrite(GREEN[i], LOW);
    digitalWrite(LEFT[i], LOW);
    digitalWrite(RIGHT[i], LOW);
  }
}

// Non-blocking yellow blink
void flashYellowNonBlocking(int duration, int speed) {
  unsigned long start = millis();
  while (millis() - start < duration) {
    digitalWrite(YELLOW_PIN, HIGH);
    delay(speed);
    digitalWrite(YELLOW_PIN, LOW);
    delay(speed);
  }
}
