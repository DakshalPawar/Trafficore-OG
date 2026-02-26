package com.trafficore.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer age;

    @Column(name = "blood_type")
    private String bloodType;

    @Column(name = "medical_condition")
    private String medicalCondition;

    @Column(columnDefinition = "TEXT")
    private String accidentDetails;

    @Column(name = "heart_rate")
    private Integer heartRate;

    @Column(name = "blood_pressure")
    private String bloodPressure;

    @Column(name = "oxygen_level")
    private Double oxygenLevel;

    @Column(name = "body_temperature")
    private Double bodyTemperature;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
