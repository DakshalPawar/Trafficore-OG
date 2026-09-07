package com.trafficore.service;

import com.trafficore.dto.AlertDTO;
import com.trafficore.entity.Alert;
import com.trafficore.entity.Patient;
import com.trafficore.repository.AlertRepository;
import com.trafficore.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AlertService {

    private final AlertRepository alertRepository;
    private final PatientRepository patientRepository;

    public AlertDTO createAlert(Long patientId, Alert.AlertType alertType, String message, Alert.AlertSeverity severity) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Alert alert = Alert.builder()
                .patient(patient)
                .alertType(alertType)
                .message(message)
                .severity(severity)
                .isAcknowledged(false)
                .build();

        Alert saved = alertRepository.save(alert);
        log.info("Alert created for patient {}: {}", patientId, alertType);
        return convertToDTO(saved);
    }

    public AlertDTO acknowledgeAlert(Long alertId, String acknowledgedBy) {
        return alertRepository.findById(alertId)
                .map(alert -> {
                    alert.setIsAcknowledged(true);
                    alert.setAcknowledgedBy(acknowledgedBy);
                    alert.setAcknowledgedAt(LocalDateTime.now());
                    Alert updated = alertRepository.save(alert);
                    log.info("Alert {} acknowledged by {}", alertId, acknowledgedBy);
                    return convertToDTO(updated);
                })
                .orElseThrow(() -> new RuntimeException("Alert not found"));
    }

    public List<AlertDTO> getAlertsByPatient(Long patientId) {
        return alertRepository.findByPatientId(patientId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AlertDTO> getUnacknowledgedAlerts() {
        return alertRepository.findUnacknowledgedAlerts()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AlertDTO> getUnacknowledgedAlertsByPatient(Long patientId) {
        return alertRepository.findUnacknowledgedAlertsByPatient(patientId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AlertDTO> getCriticalAlerts() {
        return alertRepository.findBySeverity(Alert.AlertSeverity.CRITICAL)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AlertDTO> getEmergencyAlerts() {
        return alertRepository.findBySeverity(Alert.AlertSeverity.EMERGENCY)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private AlertDTO convertToDTO(Alert alert) {
        return AlertDTO.builder()
                .id(alert.getId())
                .patientId(alert.getPatient().getId())
                .alertType(alert.getAlertType().toString())
                .message(alert.getMessage())
                .alertValue(alert.getAlertValue())
                .severity(alert.getSeverity().toString())
                .isAcknowledged(alert.getIsAcknowledged())
                .acknowledgedBy(alert.getAcknowledgedBy())
                .acknowledgedAt(alert.getAcknowledgedAt())
                .createdAt(alert.getCreatedAt())
                .build();
    }
}