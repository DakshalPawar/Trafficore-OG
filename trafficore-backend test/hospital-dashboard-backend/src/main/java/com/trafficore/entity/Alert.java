package com.trafficore.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false)
    private AlertType alertType;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "alert_value")
    private String alertValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private AlertSeverity severity;

    @Column(name = "is_acknowledged")
    private Boolean isAcknowledged = false;

    @Column(name = "acknowledged_by")
    private String acknowledgedBy;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum AlertType {
        LOW_OXYGEN, HIGH_HEART_RATE, LOW_HEART_RATE,
        HIGH_TEMPERATURE, LOW_TEMPERATURE, CRITICAL_BP,
        ETA_UPDATE, AMBULANCE_DELAYED, PATIENT_UNSTABLE
    }

    public enum AlertSeverity {
        INFO, WARNING, CRITICAL, EMERGENCY
    }
}
