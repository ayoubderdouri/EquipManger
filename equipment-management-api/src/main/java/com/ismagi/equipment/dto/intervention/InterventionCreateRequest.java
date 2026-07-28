package com.ismagi.equipment.dto.intervention;

import com.ismagi.equipment.domain.UrgencyLevel;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record InterventionCreateRequest(
        Long equipmentId,
        Long locationId,
        @NotBlank @Size(max = 1000) String description,
        @NotNull UrgencyLevel urgencyLevel,
        @Size(max = 1000) String imageUrl
) {
    @AssertTrue(message = "At least one of equipmentId or locationId is required")
    public boolean isEquipmentOrLocationProvided() {
        return equipmentId != null || locationId != null;
    }
}