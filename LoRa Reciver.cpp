#include <SPI.h>
#include <LoRa.h>

// Pin configuration for SX1278 with ESP32
#define NSS   5
#define RST   14
#define DIO0  2

void setup() {
  Serial.begin(115200);
  while (!Serial);

  LoRa.setPins(NSS, RST, DIO0);

  if (!LoRa.begin(433E6)) {
    Serial.println("Starting LoRa failed!");
    while (1);
  }

  // Match receiver settings
  LoRa.setSpreadingFactor(7);
  LoRa.setSignalBandwidth(125E3);
  LoRa.setCodingRate4(5);
  LoRa.setTxPower(20);  // Max transmit power

  Serial.println("ESP32 LoRa Transmitter Ready");
}

void loop() {
  Serial.println("Sending packet from ESP32...");

  LoRa.beginPacket();
  LoRa.print("Hello from ESP32 LoRa Transmitter");
  LoRa.endPacket();

  delay(2000); // send every 2 sec
}
