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
public class PatientDTO {

    private Long id;
    private String name;
    private Integer age;
    private String blood_type;
    private String condition;
    private String accident_details;
    private Integer heart_rate;
    private String blood_pressure;
    private Double oxygen;
    private Double temperature;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isActive;
}