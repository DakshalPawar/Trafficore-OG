#include <SPI.h>
#include <LoRa.h>

// Pin configuration for SX1278 with Arduino Uno
#define NSS   10
#define RST   9
#define DIO0  2

void setup() {
  Serial.begin(9600);
  while (!Serial);

  Serial.println("LoRa Receiver Starting...");

  LoRa.setPins(NSS, RST, DIO0);

  if (!LoRa.begin(433E6)) {
    Serial.println("Starting LoRa failed!");
    while (1);
  }

  // Optional: set parameters explicitly
  LoRa.setSpreadingFactor(7);
  LoRa.setSignalBandwidth(125E3);
  LoRa.setCodingRate4(5);

  Serial.println("LoRa Receiver Ready");
}

void loop() {
  int packetSize = LoRa.parsePacket();

  if (packetSize) {
    Serial.print("Received packet: ");

    while (LoRa.available()) {
      Serial.print((char)LoRa.read());
    }

    Serial.print(" | RSSI: ");
    Serial.println(LoRa.packetRssi());
  }

  delay(10); // small delay
}
