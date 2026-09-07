package com.trafficore.repository;

import com.trafficore.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByName(String name);

    List<Patient> findByIsActiveTrue();

    @Query("SELECT p FROM Patient p WHERE p.oxygenLevel < 90 AND p.isActive = true")
    List<Patient> findPatientsWithLowOxygen();

    @Query("SELECT p FROM Patient p WHERE p.heartRate > 120 OR p.heartRate < 60 AND p.isActive = true")
    List<Patient> findPatientsWithAbnormalHeartRate();

    @Query("SELECT p FROM Patient p WHERE p.bodyTemperature > 38 OR p.bodyTemperature < 36 AND p.isActive = true")
    List<Patient> findPatientsWithAbnormalTemperature();

    List<Patient> findByMedicalCondition(String condition);
}

