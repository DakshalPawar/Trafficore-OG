#include <SPI.h>
#include <LoRa.h>

// Pin configuration for SX1278 with Arduino
#define NSS   10
#define RST   9
#define DIO0  2

void setup() {
  Serial.begin(9600);
  while (!Serial);

  LoRa.setPins(NSS, RST, DIO0);

  if (!LoRa.begin(433E6)) {   // Set frequency to 433 MHz
    Serial.println("Starting LoRa failed!");
    while (1);
  }

  // Explicit settings (must match receiver)
  LoRa.setSpreadingFactor(7);     // Range: 6-12
  LoRa.setSignalBandwidth(125E3); // 125 kHz
  LoRa.setCodingRate4(5);         // 4/5
  LoRa.setTxPower(20);            // Max TX power (2-20)

  Serial.println("LoRa Transmitter Ready");
}

void loop() {
  Serial.println("Sending packet...");

  LoRa.beginPacket();
  LoRa.print("Hello from LoRa Transmitter");
  LoRa.endPacket();

  delay(2000); // send a message every 2 seconds
}
