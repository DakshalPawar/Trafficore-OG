package com.trafficore.controller;

import com.trafficore.dto.PatientDTO;
import com.trafficore.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    public ResponseEntity<PatientDTO> createPatient(@RequestBody PatientDTO patientDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(patientService.createPatient(patientDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDTO> getPatient(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    @GetMapping
    public ResponseEntity<List<PatientDTO>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllActivePatients());
    }

    @GetMapping("/critical")
    public ResponseEntity<List<PatientDTO>> getCriticalPatients() {
        return ResponseEntity.ok(patientService.getCriticalPatients());
    }

    @PutMapping("/{id}/vitals")
    public ResponseEntity<PatientDTO> updatePatientVitals(
            @PathVariable Long id,
            @RequestBody PatientDTO patientDTO) {
        return ResponseEntity.ok(patientService.updatePatientVitals(id, patientDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/generate-fake-data")
    public ResponseEntity<String> generateFakeData() {
        patientService.generateFakePatientData();
        return ResponseEntity.ok("Fake patient data generated successfully");
    }
}
