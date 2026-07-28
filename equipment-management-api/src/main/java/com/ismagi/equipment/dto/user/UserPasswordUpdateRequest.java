package com.ismagi.equipment.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserPasswordUpdateRequest(
        @NotBlank @Size(min = 6, max = 100) String newPassword
) {
}
