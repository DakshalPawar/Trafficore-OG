package com.trafficore.config;

import com.trafficore.entity.Alert;
import com.trafficore.service.AmbulanceService;
import com.trafficore.service.AlertService;
import com.trafficore.service.PatientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final PatientService patientService;
    private final AmbulanceService ambulanceService;
    private final AlertService alertService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.info("==========================================");
        log.info("Starting Data Initialization for Testing");
        log.info("==========================================");

        try {
            // Generate fake patient data
            patientService.generateFakePatientData();
            log.info("✅ Fake patient data generated");

            // Generate fake ambulance data
            ambulanceService.generateFakeAmbulanceData();
            log.info("✅ Fake ambulance data generated");

            // Create some sample alerts
            alertService.createAlert(
                    1L,
                    Alert.AlertType.LOW_OXYGEN,
                    "Oxygen level dropped below 90%",
                    Alert.AlertSeverity.CRITICAL
            );

            alertService.createAlert(
                    2L,
                    Alert.AlertType.HIGH_HEART_RATE,
                    "Heart rate exceeded 120 bpm",
                    Alert.AlertSeverity.WARNING
            );

            log.info("✅ Sample alerts created");

            log.info("==========================================");
            log.info("✅ Data Initialization Completed!");
            log.info("==========================================");
            log.info("");
            log.info("🔍 API ENDPOINTS:");
            log.info("   GET  http://localhost:8080/api/patients");
            log.info("   GET  http://localhost:8080/api/ambulances");
            log.info("   GET  http://localhost:8080/api/alerts");
            log.info("   GET  http://localhost:8080/api/messages");
            log.info("");
            log.info("📊 DATABASE CONSOLE:");
            log.info("   http://localhost:8080/h2-console");
            log.info("==========================================");

        } catch (Exception e) {
            log.error("Error during data initialization", e);
        }
    }
}
