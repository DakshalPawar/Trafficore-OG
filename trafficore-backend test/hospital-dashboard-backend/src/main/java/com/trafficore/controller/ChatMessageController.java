
package com.trafficore.controller;

import com.trafficore.dto.ChatMessageDTO;
import com.trafficore.entity.ChatMessage;
import com.trafficore.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatMessageController {

    private final ChatMessageService chatMessageService;

    @PostMapping
    public ResponseEntity<ChatMessageDTO> sendMessage(
            @RequestParam Long patientId,
            @RequestParam String sender,
            @RequestParam String senderType,
            @RequestParam String message) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                chatMessageService.sendMessage(
                        patientId,
                        sender,
                        ChatMessage.SenderType.valueOf(senderType),
                        message
                )
        );
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<ChatMessageDTO>> getMessagesByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(chatMessageService.getMessagesByPatient(patientId));
    }

    @GetMapping("/patient/{patientId}/recent")
    public ResponseEntity<List<ChatMessageDTO>> getRecentMessages(@PathVariable Long patientId) {
        return ResponseEntity.ok(chatMessageService.getRecentMessagesByPatient(patientId));
    }

    @GetMapping("/patient/{patientId}/unread")
    public ResponseEntity<List<ChatMessageDTO>> getUnreadMessages(@PathVariable Long patientId) {
        return ResponseEntity.ok(chatMessageService.getUnreadMessagesByPatient(patientId));
    }

    @PutMapping("/{messageId}/read")
    public ResponseEntity<ChatMessageDTO> markAsRead(@PathVariable Long messageId) {
        return ResponseEntity.ok(chatMessageService.markAsRead(messageId));
    }
}