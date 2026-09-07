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
public class ChatMessageDTO {

    private Long id;
    private Long patientId;
    private String sender;
    private String senderType;
    private String message;
    private LocalDateTime timestamp;
    private Boolean isRead;
}
