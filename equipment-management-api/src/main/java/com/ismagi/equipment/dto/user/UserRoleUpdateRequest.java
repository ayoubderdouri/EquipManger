package com.ismagi.equipment.dto.user;

import com.ismagi.equipment.domain.Role;
import jakarta.validation.constraints.NotNull;

public record UserRoleUpdateRequest(
        @NotNull Role role
) {
}
