package com.ismagi.equipment.controller;

import com.ismagi.equipment.domain.User;
import com.ismagi.equipment.dto.auth.AuthResponse;
import com.ismagi.equipment.dto.auth.LoginRequest;
import com.ismagi.equipment.dto.auth.RefreshTokenRequest;
import com.ismagi.equipment.dto.auth.RegisterRequest;
import io.jsonwebtoken.JwtException;
import com.ismagi.equipment.service.JwtService;
import com.ismagi.equipment.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserService userService, JwtService jwtService, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        User createdUser = userService.createUser(request);
        UserDetails userDetails = userService.loadUserByUsername(createdUser.getUsername());
        String token = jwtService.generateToken(userDetails, createdUser.getRole().name());
        return new AuthResponse(token, userService.toResponse(createdUser));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userService.getByUsername(userDetails.getUsername());
        String token = jwtService.generateToken(userDetails, user.getRole().name());

        return new AuthResponse(token, userService.toResponse(user));
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        String token = normalizeToken(request.token());

        String username;
        try {
            username = jwtService.extractUsernameAllowExpired(token);
        } catch (JwtException | IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token", ex);
        }

        User user;
        UserDetails userDetails;
        try {
            user = userService.getByUsername(username);
            userDetails = userService.loadUserByUsername(username);
        } catch (ResponseStatusException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token", ex);
        }

        String refreshedToken = jwtService.generateToken(userDetails, user.getRole().name());
        return new AuthResponse(refreshedToken, userService.toResponse(user));
    }

    private String normalizeToken(String token) {
        if (token == null) {
            return null;
        }
        if (token.startsWith("Bearer ")) {
            return token.substring(7);
        }
        return token;
    }
}
