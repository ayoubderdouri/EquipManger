package com.ismagi.equipment.dto.intervention;

import com.ismagi.equipment.domain.InterventionStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record InterventionCommentCreateRequest(
        @NotBlank @Size(max = 2000) String comment,
        InterventionStatus targetStatus
) {
}