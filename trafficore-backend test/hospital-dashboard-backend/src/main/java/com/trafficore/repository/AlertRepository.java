package com.trafficore.repository;

import com.trafficore.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByPatientId(Long patientId);

    List<Alert> findBySeverity(Alert.AlertSeverity severity);

    @Query("SELECT a FROM Alert a WHERE a.isAcknowledged = false ORDER BY a.severity DESC, a.createdAt DESC")
    List<Alert> findUnacknowledgedAlerts();

    @Query("SELECT a FROM Alert a WHERE a.patient.id = :patientId AND a.isAcknowledged = false")
    List<Alert> findUnacknowledgedAlertsByPatient(Long patientId);
}