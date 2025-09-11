#include <SPI.h>
#include <LoRa.h>

// Pin configuration for SX1278 with Arduino UNO
#define NSS   10
#define RST   9
#define DIO0  2

String message = "";

void setup() {
  Serial.begin(9600);
  while (!Serial); // wait for Serial Monitor

  LoRa.setPins(NSS, RST, DIO0);

  if (!LoRa.begin(433E6)) {   // 433 MHz
    Serial.println("Starting LoRa failed!");
    while (1);
  }

  // Explicit settings (must match receiver)
  LoRa.setSpreadingFactor(7);     // 6–12
  LoRa.setSignalBandwidth(125E3); // 125 kHz
  LoRa.setCodingRate4(5);         // 4/5
  LoRa.setTxPower(20);            // Max 20 dBm

  Serial.println("LoRa Transmitter Ready");
  Serial.println("Type a message in Serial Monitor and press ENTER to send...");
}

void loop() {
  // Check if user typed something
  if (Serial.available()) {
    message = Serial.readStringUntil('\n');  // read input until Enter
    message.trim(); // clean spaces/newlines

    if (message.length() > 0) {
      Serial.println("Sending: " + message);

      LoRa.beginPacket();
      LoRa.print(message);
      LoRa.endPacket();

      Serial.println("Message sent!");
    }
  }
}
