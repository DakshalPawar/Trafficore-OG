package com.trafficore.repository;

import com.trafficore.entity.Ambulance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AmbulanceRepository extends JpaRepository<Ambulance, Long> {

    Optional<Ambulance> findByAmbulanceId(String ambulanceId);

    List<Ambulance> findByStatus(Ambulance.AmbulanceStatus status);

    @Query("SELECT a FROM Ambulance a WHERE a.status = 'AVAILABLE'")
    List<Ambulance> findAvailableAmbulances();

    Optional<Ambulance> findByAssignedPatientId(Long patientId);

    List<Ambulance> findByDriverName(String driverName);
}
