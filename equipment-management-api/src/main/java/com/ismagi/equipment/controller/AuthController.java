package com.ismagi.equipment.controller;

import com.ismagi.equipment.domain.User;
import com.ismagi.equipment.dto.auth.AuthResponse;
import com.ismagi.equipment.dto.auth.LoginRequest;
import com.ismagi.equipment.dto.auth.RegisterRequest;
import com.ismagi.equipment.service.JwtService;
import com.ismagi.equipment.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
        String token = jwtService.generateToken(userDetails);
        return new AuthResponse(token, userService.toResponse(createdUser));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(userDetails);
        User user = userService.getByUsername(userDetails.getUsername());

        return new AuthResponse(token, userService.toResponse(user));
    }
}
