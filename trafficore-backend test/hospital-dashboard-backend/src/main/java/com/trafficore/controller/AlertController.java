package com.trafficore.controller;

import com.trafficore.dto.AlertDTO;
import com.trafficore.entity.Alert;
import com.trafficore.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AlertController {

    private final AlertService alertService;

    @PostMapping
    public ResponseEntity<AlertDTO> createAlert(
            @RequestParam Long patientId,
            @RequestParam String alertType,
            @RequestParam String message,
            @RequestParam String severity) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                alertService.createAlert(
                        patientId,
                        Alert.AlertType.valueOf(alertType),
                        message,
                        Alert.AlertSeverity.valueOf(severity)
                )
        );
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AlertDTO>> getPatientAlerts(@PathVariable Long patientId) {
        return ResponseEntity.ok(alertService.getAlertsByPatient(patientId));
    }

    @GetMapping("/unacknowledged")
    public ResponseEntity<List<AlertDTO>> getUnacknowledgedAlerts() {
        return ResponseEntity.ok(alertService.getUnacknowledgedAlerts());
    }

    @GetMapping("/unacknowledged/{patientId}")
    public ResponseEntity<List<AlertDTO>> getUnacknowledgedAlertsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(alertService.getUnacknowledgedAlertsByPatient(patientId));
    }

    @GetMapping("/critical")
    public ResponseEntity<List<AlertDTO>> getCriticalAlerts() {
        return ResponseEntity.ok(alertService.getCriticalAlerts());
    }

    @GetMapping("/emergency")
    public ResponseEntity<List<AlertDTO>> getEmergencyAlerts() {
        return ResponseEntity.ok(alertService.getEmergencyAlerts());
    }

    @PutMapping("/{alertId}/acknowledge")
    public ResponseEntity<AlertDTO> acknowledgeAlert(
            @PathVariable Long alertId,
            @RequestParam String acknowledgedBy) {
        return ResponseEntity.ok(alertService.acknowledgeAlert(alertId, acknowledgedBy));
    }
}