package com.trafficore.controller;

import com.trafficore.dto.AmbulanceDTO;
import com.trafficore.service.AmbulanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ambulances")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AmbulanceController {

    private final AmbulanceService ambulanceService;

    @PostMapping
    public ResponseEntity<AmbulanceDTO> createAmbulance(@RequestBody AmbulanceDTO ambulanceDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ambulanceService.createAmbulance(ambulanceDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AmbulanceDTO> getAmbulance(@PathVariable Long id) {
        return ResponseEntity.ok(ambulanceService.getAmbulanceById(id));
    }

    @GetMapping
    public ResponseEntity<List<AmbulanceDTO>> getAllAmbulances() {
        return ResponseEntity.ok(ambulanceService.getAllAmbulances());
    }

    @GetMapping("/available")
    public ResponseEntity<List<AmbulanceDTO>> getAvailableAmbulances() {
        return ResponseEntity.ok(ambulanceService.getAvailableAmbulances());
    }

    @PostMapping("/{ambulanceId}/assign/{patientId}")
    public ResponseEntity<AmbulanceDTO> assignAmbulanceToPatient(
            @PathVariable Long ambulanceId,
            @PathVariable Long patientId) {
        return ResponseEntity.ok(ambulanceService.assignAmbulanceToPatient(ambulanceId, patientId));
    }

    @PutMapping("/{id}/location")
    public ResponseEntity<AmbulanceDTO> updateLocation(
            @PathVariable Long id,
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(required = false) Integer eta) {
        return ResponseEntity.ok(ambulanceService.updateGPSLocation(id, latitude, longitude, eta));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<AmbulanceDTO> getAmbulanceByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ambulanceService.getAmbulanceByPatient(patientId));
    }

    @PostMapping("/generate-fake-data")
    public ResponseEntity<String> generateFakeData() {
        ambulanceService.generateFakeAmbulanceData();
        return ResponseEntity.ok("Fake ambulance data generated successfully");
    }
}