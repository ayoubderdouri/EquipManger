package com.ismagi.equipment.dto.user;

import com.ismagi.equipment.domain.Role;

public record UserResponse(
        Long id,
        String username,
        String email,
        Role role
) {
}
