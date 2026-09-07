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
public class AlertDTO {

    private Long id;
    private Long patientId;
    private String alertType;
    private String message;
    private String alertValue;
    private String severity;
    private Boolean isAcknowledged;
    private String acknowledgedBy;
    private LocalDateTime acknowledgedAt;
    private LocalDateTime createdAt;
}