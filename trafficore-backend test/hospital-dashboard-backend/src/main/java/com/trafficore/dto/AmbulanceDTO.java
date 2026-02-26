package com.trafficore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AmbulanceDTO {

    private Long id;
    private String ambulanceId;
    private String driverName;
    private String phoneNumber;
    private Double latitude;
    private Double longitude;
    private Double destinationLatitude;
    private Double destinationLongitude;
    private Integer eta;
    private String status;
    private Double speedKmh;
    private Long patientId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
