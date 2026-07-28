package com.ismagi.equipment.dto.intervention;

import com.ismagi.equipment.domain.InterventionStatus;
import com.ismagi.equipment.domain.UrgencyLevel;
import java.time.LocalDateTime;
import java.util.List;

public record InterventionResponse(
        Long id,
        Long equipmentId,
        String equipmentName,
        Long locationId,
        String locationName,
        String description,
        UrgencyLevel urgencyLevel,
        InterventionStatus status,
        String imageUrl,
        Long createdById,
        String createdByUsername,
        Long assignedToId,
        String assignedToUsername,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime resolvedAt,
        List<InterventionCommentResponse> comments
) {
}