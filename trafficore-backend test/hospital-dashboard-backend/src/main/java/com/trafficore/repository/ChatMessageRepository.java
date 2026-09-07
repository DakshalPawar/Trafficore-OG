package com.trafficore.repository;

import com.trafficore.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    @Query("SELECT c FROM ChatMessage c WHERE c.patient.id = :patientId AND c.isRead = false")
    List<ChatMessage> findUnreadMessagesByPatient(Long patientId);

    @Query("SELECT c FROM ChatMessage c WHERE c.patient.id = :patientId ORDER BY c.createdAt DESC LIMIT 50")
    List<ChatMessage> findRecentMessagesByPatient(Long patientId);
}