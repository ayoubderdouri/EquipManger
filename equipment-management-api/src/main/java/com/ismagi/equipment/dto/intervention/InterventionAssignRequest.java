package com.ismagi.equipment.dto.intervention;

import jakarta.validation.constraints.NotNull;

public record InterventionAssignRequest(
        @NotNull Long assignedToUserId
) {
}