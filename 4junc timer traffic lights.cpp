//This code is simulating a 4-way traffic signal controller using an ESP32/Arduino.
// This program:
// Controls a 4-sided traffic junction
//  Cycles signals one side at a time
// Uses:
//  Red
//  Green
//  Yellow (shared)

// -------------------- Pin Setup --------------------
#define YELLOW_PIN 2  // Common Yellow for all 4 sides

// Each side has: Red, Green, Left, Right
int RED[4]    = {4, 12, 19, 32};
int GREEN[4]  = {5, 13, 21, 25};
int LEFT[4]   = {16, 14, 22, 26};
int RIGHT[4]  = {17, 15, 27, 33};

int currentSide = 0; // Start with Side 0

// -------------------- Setup --------------------
void setup() {
  Serial.begin(115200);

  // Setup pins
  pinMode(YELLOW_PIN, OUTPUT);
  for (int i = 0; i < 4; i++) {
    pinMode(RED[i], OUTPUT);
    pinMode(GREEN[i], OUTPUT);
    pinMode(LEFT[i], OUTPUT);
    pinMode(RIGHT[i], OUTPUT);
  }

  setAllRed();  // Initialize all to RED
}

// -------------------- Main Loop --------------------
void loop() {
  // Step 1: All red first
  setAllRed();

  // Step 2: Turn current side GREEN
  digitalWrite(GREEN[currentSide], HIGH);
  digitalWrite(RED[currentSide], LOW);

  Serial.print("SIDE ");
  Serial.print(currentSide);
  Serial.println(" GREEN");

  delay(5000); // 5 sec green

  // Step 3: Turn green off, flash yellow
  digitalWrite(GREEN[currentSide], LOW);
  flashYellow(3000); // 3 sec yellow

  // Step 4: Move to next side
  currentSide = (currentSide + 1) % 4;
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

void flashYellow(int duration) {
  unsigned long start = millis();
  while (millis() - start < duration) {
    digitalWrite(YELLOW_PIN, HIGH);
    delay(500);
    digitalWrite(YELLOW_PIN, LOW);
    delay(500);
  }
}
