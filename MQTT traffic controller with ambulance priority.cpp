//This is an ESP32-based smart traffic light system. THe following things this code do:-
// Runs normal traffic signals 
// Listens to MQTT messages 
// Overrides signals when ambulance is detected
//======================================================================

// =======LOGIC=========
// What it does:
// Connects ESP32 to WiFi
// Connects to MQTT broker (your Raspberry Pi)
// When an ambulance request is received, the system dynamically overrides the normal traffic cycle and prioritizes the required route using real-time communication



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
#define YELLOW_PIN 18  // common yellow

int RED[4]    = {4, 12, 19, 32};
int GREEN[4]  = {5, 13, 21, 23};
int LEFT[4]   = {16, 14, 22, 26};
int RIGHT[4]  = {17, 15, 27, 33};

// -------------------- Variables --------------------
int currentSide = 0;
bool overrideMode = false;
String overridePath = "";
String overrideDirection = "";

unsigned long lastChange = 0;
unsigned long lastMQTTReconnect = 0;
unsigned long overrideStart = 0;

bool greenOn = false;
bool yellowState = false;
unsigned long lastYellowToggle = 0;

// -------------------- Function Declarations --------------------
void setAllRed();
void normalCycle();
void overrideCycle();
void flashYellowNonBlocking(unsigned long interval);
void reconnect();
void callback(char* topic, byte* payload, unsigned int length);

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
  Serial.print("Connecting Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ Wi-Fi connected");

  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  lastChange = millis();
}

// -------------------- Main Loop --------------------
void loop() {
  // Handle MQTT connection
  if (!client.connected()) reconnect();
  client.loop();

  // Run override or normal mode
  if (overrideMode) {
    overrideCycle();
  } else {
    normalCycle();
  }

  // Blinking yellow in between transitions
  flashYellowNonBlocking(500);
}

// -------------------- MQTT Callback --------------------
void callback(char* topic, byte* payload, unsigned int length) {
  payload[length] = '\0';
  String msg = String((char*)payload);
  Serial.print("📩 MQTT Received: ");
  Serial.println(msg);

  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, msg);
  if (error) return;

  if (doc.containsKey("reset") && doc["reset"] == true) {
    overrideMode = false;
    overridePath = "";
    overrideDirection = "";
    setAllRed();
    Serial.println("🔁 RESET received → returning to normal cycle");
  }

  if (doc.containsKey("path") && doc.containsKey("direction")) {
    overridePath = String((const char*)doc["path"]);
    overrideDirection = String((const char*)doc["direction"]);
    overrideMode = true;
    overrideStart = millis();

    Serial.print("🚨 OVERRIDE → Path: ");
    Serial.print(overridePath);
    Serial.print(" | Direction: ");
    Serial.println(overrideDirection);
  }
}

// -------------------- MQTT Reconnect --------------------
void reconnect() {
  unsigned long now = millis();
  if (now - lastMQTTReconnect < 5000) return;  // try every 5 sec
  lastMQTTReconnect = now;

  if (!client.connected()) {
    Serial.print("🔄 Reconnecting MQTT...");
    if (client.connect("ESP32Client")) {
      Serial.println("✅ connected!");
      client.subscribe("trafficore/ambulance");
    } else {
      Serial.println("❌ failed, will retry...");
    }
  }
}

// -------------------- Normal Traffic Cycle --------------------
void normalCycle() {
  unsigned long now = millis();

  if (now - lastChange >= 5000) { // 5 sec per side
    setAllRed();
    digitalWrite(GREEN[currentSide], HIGH);
    digitalWrite(RED[currentSide], LOW);

    Serial.print("🟢 NORMAL → SIDE ");
    Serial.print(currentSide);
    Serial.println(" GREEN");

    currentSide = (currentSide + 1) % 4;
    lastChange = now;
  }
}

// -------------------- Override Mode --------------------
void overrideCycle() {
  unsigned long now = millis();
  int sideIndex = overridePath.charAt(0) - 'A';

  // Auto reset after 10 seconds
  if (now - overrideStart > 10000) {
    overrideMode = false;
    setAllRed();
    Serial.println("⏱️ OVERRIDE timeout → Back to normal");
    return;
  }

  setAllRed();
  digitalWrite(RED[sideIndex], LOW);
  digitalWrite(GREEN[sideIndex], HIGH);

  if (overrideDirection == "LEFT")
    digitalWrite(LEFT[sideIndex], HIGH);
  else if (overrideDirection == "RIGHT")
    digitalWrite(RIGHT[sideIndex], HIGH);
  else if (overrideDirection == "STRAIGHT")
    ; // just green

  Serial.print("🚑 OVERRIDE ACTIVE → Path: ");
  Serial.print(overridePath);
  Serial.print(" | Direction: ");
  Serial.println(overrideDirection);
}

// -------------------- Yellow Blinking (Non-blocking) --------------------
void flashYellowNonBlocking(unsigned long interval) {
  unsigned long now = millis();
  if (now - lastYellowToggle >= interval) {
    yellowState = !yellowState;
    digitalWrite(YELLOW_PIN, yellowState);
    lastYellowToggle = now;
  }
}

// -------------------- Helper --------------------
void setAllRed() {
  for (int i = 0; i < 4; i++) {
    digitalWrite(RED[i], HIGH);
    digitalWrite(GREEN[i], LOW);
    digitalWrite(LEFT[i], LOW);
    digitalWrite(RIGHT[i], LOW);
  }
  digitalWrite(YELLOW_PIN, LOW);
}
