package com.ismagi.equipment.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryCreateRequest(
        @NotBlank @Size(min = 2, max = 150) String name,
        @Size(max = 1000) String description
) {
}