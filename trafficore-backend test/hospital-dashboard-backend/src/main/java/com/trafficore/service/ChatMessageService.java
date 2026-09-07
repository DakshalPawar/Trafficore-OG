package com.trafficore.service;

import com.trafficore.dto.ChatMessageDTO;
import com.trafficore.entity.ChatMessage;
import com.trafficore.entity.Patient;
import com.trafficore.repository.ChatMessageRepository;
import com.trafficore.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final PatientRepository patientRepository;

    public ChatMessageDTO sendMessage(Long patientId, String sender, ChatMessage.SenderType senderType, String messageContent) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        ChatMessage message = ChatMessage.builder()
                .patient(patient)
                .sender(sender)
                .senderType(senderType)
                .messageContent(messageContent)
                .isRead(false)
                .build();

        ChatMessage saved = chatMessageRepository.save(message);
        log.info("Message sent from {} to patient {}: {}", sender, patientId, messageContent);
        return convertToDTO(saved);
    }

    public ChatMessageDTO markAsRead(Long messageId) {
        return chatMessageRepository.findById(messageId)
                .map(message -> {
                    message.setIsRead(true);
                    ChatMessage updated = chatMessageRepository.save(message);
                    return convertToDTO(updated);
                })
                .orElseThrow(() -> new RuntimeException("Message not found"));
    }

    public List<ChatMessageDTO> getMessagesByPatient(Long patientId) {
        return chatMessageRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ChatMessageDTO> getUnreadMessagesByPatient(Long patientId) {
        return chatMessageRepository.findUnreadMessagesByPatient(patientId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ChatMessageDTO> getRecentMessagesByPatient(Long patientId) {
        return chatMessageRepository.findRecentMessagesByPatient(patientId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ChatMessageDTO convertToDTO(ChatMessage message) {
        return ChatMessageDTO.builder()
                .id(message.getId())
                .patientId(message.getPatient().getId())
                .sender(message.getSender())
                .senderType(message.getSenderType().toString())
                .message(message.getMessageContent())
                .timestamp(message.getCreatedAt())
                .isRead(message.getIsRead())
                .build();
    }
}
