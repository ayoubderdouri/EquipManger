package com.ismagi.equipment.dto.intervention;

import java.time.LocalDateTime;

public record InterventionCommentResponse(
        Long id,
        Long userId,
        String username,
        String comment,
        LocalDateTime createdAt
) {
}