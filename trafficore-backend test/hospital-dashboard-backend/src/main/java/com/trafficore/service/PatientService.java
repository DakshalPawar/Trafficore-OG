package com.trafficore.service;

import com.trafficore.dto.PatientDTO;
import com.trafficore.entity.Patient;
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
public class PatientService {

    private final PatientRepository patientRepository;
    private final Random random = new Random();

    public PatientDTO createPatient(PatientDTO patientDTO) {
        Patient patient = Patient.builder()
                .name(patientDTO.getName())
                .age(patientDTO.getAge())
                .bloodType(patientDTO.getBlood_type())
                .medicalCondition(patientDTO.getCondition())
                .accidentDetails(patientDTO.getAccident_details())
                .heartRate(patientDTO.getHeart_rate())
                .bloodPressure(patientDTO.getBlood_pressure())
                .oxygenLevel(patientDTO.getOxygen())
                .bodyTemperature(patientDTO.getTemperature())
                .isActive(true)
                .build();

        Patient savedPatient = patientRepository.save(patient);
        return convertToDTO(savedPatient);
    }

    public PatientDTO updatePatientVitals(Long patientId, PatientDTO patientDTO) {
        return patientRepository.findById(patientId)
                .map(patient -> {
                    patient.setHeartRate(patientDTO.getHeart_rate());
                    patient.setBloodPressure(patientDTO.getBlood_pressure());
                    patient.setOxygenLevel(patientDTO.getOxygen());
                    patient.setBodyTemperature(patientDTO.getTemperature());
                    Patient updated = patientRepository.save(patient);
                    return convertToDTO(updated);
                })
                .orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    public PatientDTO getPatientById(Long patientId) {
        return patientRepository.findById(patientId)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    public List<PatientDTO> getAllActivePatients() {
        return patientRepository.findByIsActiveTrue()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PatientDTO> getCriticalPatients() {
        List<Patient> criticalOxygen = patientRepository.findPatientsWithLowOxygen();
        List<Patient> criticalHeartRate = patientRepository.findPatientsWithAbnormalHeartRate();
        List<Patient> criticalTemp = patientRepository.findPatientsWithAbnormalTemperature();

        return criticalOxygen.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void deletePatient(Long patientId) {
        patientRepository.findById(patientId)
                .ifPresent(patient -> {
                    patient.setIsActive(false);
                    patientRepository.save(patient);
                });
    }

    public void generateFakePatientData() {
        if (patientRepository.count() > 0) {
            log.info("Fake data already exists, skipping generation");
            return;
        }

        String[] names = {"Raj Kumar", "Priya Singh", "Amit Sharma", "Neha Patel", "Vikram Reddy"};
        String[] bloodTypes = {"O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"};
        String[] conditions = {"Motor Accident", "Heart Attack", "Stroke", "Severe Burns", "Fracture"};

        for (int i = 0; i < 5; i++) {
            Patient patient = Patient.builder()
                    .name(names[i % names.length])
                    .age(25 + (i * 10))
                    .bloodType(bloodTypes[i % bloodTypes.length])
                    .medicalCondition(conditions[i % conditions.length])
                    .accidentDetails("Accident on " + (i + 1) + " date")
                    .heartRate(60 + random.nextInt(60))
                    .bloodPressure((110 + random.nextInt(30)) + "/" + (70 + random.nextInt(30)))
                    .oxygenLevel(92.0 + random.nextDouble() * 8)
                    .bodyTemperature(36.5 + random.nextDouble() * 2)
                    .isActive(true)
                    .build();

            patientRepository.save(patient);
            log.info("Created fake patient: {}", patient.getName());
        }
    }

    private PatientDTO convertToDTO(Patient patient) {
        return PatientDTO.builder()
                .id(patient.getId())
                .name(patient.getName())
                .age(patient.getAge())
                .blood_type(patient.getBloodType())
                .condition(patient.getMedicalCondition())
                .accident_details(patient.getAccidentDetails())
                .heart_rate(patient.getHeartRate())
                .blood_pressure(patient.getBloodPressure())
                .oxygen(patient.getOxygenLevel())
                .temperature(patient.getBodyTemperature())
                .createdAt(patient.getCreatedAt())
                .updatedAt(patient.getUpdatedAt())
                .isActive(patient.getIsActive())
                .build();
    }
}