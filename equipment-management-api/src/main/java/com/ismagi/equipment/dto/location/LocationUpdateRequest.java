package com.ismagi.equipment.dto.location;

import com.ismagi.equipment.domain.LocationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LocationUpdateRequest(
        @NotBlank @Size(min = 2, max = 120) String name,
        @NotNull LocationType type,
        @NotBlank @Size(max = 255) String localization,
        @Size(max = 1000) String description
) {
}
