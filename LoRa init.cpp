
#include <SPI.h>
#include <LoRa.h>

#define NSS 10
#define RST 9
#define DIO0 2

void setup() {
  Serial.begin(9600);
  LoRa.setPins(NSS, RST, DIO0);

  if (!LoRa.begin(433E6)) {
    Serial.println("LoRa init failed. Check wiring/power.");
    while (1);
  }
  Serial.println("LoRa init successful.");
}

void loop() {}
