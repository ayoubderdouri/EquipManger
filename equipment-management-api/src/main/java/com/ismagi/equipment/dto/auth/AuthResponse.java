package com.ismagi.equipment.dto.auth;

import com.ismagi.equipment.dto.user.UserResponse;

public record AuthResponse(
        String token,
        UserResponse user
) {
}
