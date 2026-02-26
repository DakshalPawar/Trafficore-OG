package com.trafficore.service;

import com.trafficore.dto.AmbulanceDTO;
import com.trafficore.entity.Ambulance;
import com.trafficore.entity.Patient;
import com.trafficore.repository.AmbulanceRepository;
import com.trafficore.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AmbulanceService {

    private final AmbulanceRepository ambulanceRepository;
    private final PatientRepository patientRepository;
    private final Random random = new Random();

    private static final double MUMBAI_LAT = 19.0760;
    private static final double MUMBAI_LNG = 72.8777;

    public AmbulanceDTO createAmbulance(AmbulanceDTO ambulanceDTO) {
        Ambulance ambulance = Ambulance.builder()
                .ambulanceId(ambulanceDTO.getAmbulanceId())
                .driverName(ambulanceDTO.getDriverName())
                .phoneNumber(ambulanceDTO.getPhoneNumber())
                .currentLatitude(ambulanceDTO.getLatitude())
                .currentLongitude(ambulanceDTO.getLongitude())
                .status(Ambulance.AmbulanceStatus.AVAILABLE)
                .build();

        Ambulance saved = ambulanceRepository.save(ambulance);
        return convertToDTO(saved);
    }

    public AmbulanceDTO assignAmbulanceToPatient(Long ambulanceId, Long patientId) {
        Ambulance ambulance = ambulanceRepository.findById(ambulanceId)
                .orElseThrow(() -> new RuntimeException("Ambulance not found"));

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        ambulance.setAssignedPatient(patient);
        ambulance.setStatus(Ambulance.AmbulanceStatus.EN_ROUTE);
        ambulance.setDestinationLatitude(MUMBAI_LAT + (random.nextDouble() - 0.5) * 0.1);
        ambulance.setDestinationLongitude(MUMBAI_LNG + (random.nextDouble() - 0.5) * 0.1);
        ambulance.setEtaMinutes(10 + random.nextInt(15));

        Ambulance updated = ambulanceRepository.save(ambulance);
        return convertToDTO(updated);
    }

    public AmbulanceDTO updateGPSLocation(Long ambulanceId, Double latitude, Double longitude, Integer eta) {
        return ambulanceRepository.findById(ambulanceId)
                .map(ambulance -> {
                    ambulance.setCurrentLatitude(latitude);
                    ambulance.setCurrentLongitude(longitude);
                    if (eta != null) {
                        ambulance.setEtaMinutes(eta);
                    }
                    ambulance.setSpeedKmh(30.0 + random.nextDouble() * 40);
                    Ambulance updated = ambulanceRepository.save(ambulance);
                    return convertToDTO(updated);
                })
                .orElseThrow(() -> new RuntimeException("Ambulance not found"));
    }

    public AmbulanceDTO getAmbulanceById(Long ambulanceId) {
        return ambulanceRepository.findById(ambulanceId)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Ambulance not found"));
    }

    public List<AmbulanceDTO> getAmbulanceByAmbulanceId(String ambulanceId) {
        return ambulanceRepository.findByAmbulanceId(ambulanceId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AmbulanceDTO> getAvailableAmbulances() {
        return ambulanceRepository.findAvailableAmbulances()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AmbulanceDTO> getAllAmbulances() {
        return ambulanceRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public AmbulanceDTO getAmbulanceByPatient(Long patientId) {
        return ambulanceRepository.findByAssignedPatientId(patientId)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("No ambulance assigned to this patient"));
    }

    public void generateFakeAmbulanceData() {
        if (ambulanceRepository.count() > 0) {
            log.info("Fake ambulance data already exists, skipping generation");
            return;
        }

        String[] driverNames = {"Rajesh Kumar", "Suresh Singh", "Arun Patel", "Vikram Sharma", "Deepak Reddy"};
        String[] ambulanceIds = {"AMB-001", "AMB-002", "AMB-003", "AMB-004", "AMB-005"};

        for (int i = 0; i < 5; i++) {
            Ambulance ambulance = Ambulance.builder()
                    .ambulanceId(ambulanceIds[i])
                    .driverName(driverNames[i])
                    .phoneNumber("98" + String.format("%08d", 10000000 + random.nextInt(90000000)))
                    .currentLatitude(MUMBAI_LAT + (random.nextDouble() - 0.5) * 0.2)
                    .currentLongitude(MUMBAI_LNG + (random.nextDouble() - 0.5) * 0.2)
                    .status(Ambulance.AmbulanceStatus.AVAILABLE)
                    .speedKmh(0.0)
                    .build();

            ambulanceRepository.save(ambulance);
            log.info("Created fake ambulance: {}", ambulance.getAmbulanceId());
        }
    }

    private AmbulanceDTO convertToDTO(Ambulance ambulance) {
        return AmbulanceDTO.builder()
                .id(ambulance.getId())
                .ambulanceId(ambulance.getAmbulanceId())
                .driverName(ambulance.getDriverName())
                .phoneNumber(ambulance.getPhoneNumber())
                .latitude(ambulance.getCurrentLatitude())
                .longitude(ambulance.getCurrentLongitude())
                .destinationLatitude(ambulance.getDestinationLatitude())
                .destinationLongitude(ambulance.getDestinationLongitude())
                .eta(ambulance.getEtaMinutes())
                .status(ambulance.getStatus().toString())
                .speedKmh(ambulance.getSpeedKmh())
                .patientId(ambulance.getAssignedPatient() != null ? ambulance.getAssignedPatient().getId() : null)
                .createdAt(ambulance.getCreatedAt())
                .updatedAt(ambulance.getUpdatedAt())
                .build();
    }
}
