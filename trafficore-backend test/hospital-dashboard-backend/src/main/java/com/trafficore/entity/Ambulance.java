package com.trafficore.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "ambulances")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ambulance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String ambulanceId;

    @Column(nullable = false)
    private String driverName;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(name = "current_latitude")
    private Double currentLatitude;

    @Column(name = "current_longitude")
    private Double currentLongitude;

    @Column(name = "destination_latitude")
    private Double destinationLatitude;

    @Column(name = "destination_longitude")
    private Double destinationLongitude;

    @Column(name = "eta_minutes")
    private Integer etaMinutes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private AmbulanceStatus status = AmbulanceStatus.AVAILABLE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient assignedPatient;

    @Column(name = "speed_kmh")
    private Double speedKmh;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum AmbulanceStatus {
        AVAILABLE, ASSIGNED, EN_ROUTE, ON_SCENE, RETURNING, UNAVAILABLE
    }
}