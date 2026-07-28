package com.ismagi.equipment.service;

import com.ismagi.equipment.domain.Role;
import com.ismagi.equipment.domain.User;
import com.ismagi.equipment.dto.auth.RegisterRequest;
import com.ismagi.equipment.dto.user.UserCreateRequest;
import com.ismagi.equipment.dto.user.UserPasswordUpdateRequest;
import com.ismagi.equipment.dto.user.UserRoleUpdateRequest;
import com.ismagi.equipment.dto.user.UserResponse;
import com.ismagi.equipment.dto.user.UserUpdateRequest;
import com.ismagi.equipment.repository.UserRepository;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User createUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
            .role(Role.USER)
                .build();

        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers(String email, String username, Role role) {
        String emailFilter = normalizeFilter(email);
        String usernameFilter = normalizeFilter(username);

        return userRepository.findAll().stream()
                .filter(user -> role == null || user.getRole() == role)
                .filter(user -> emailFilter == null
                        || user.getEmail().toLowerCase(Locale.ROOT).contains(emailFilter))
                .filter(user -> usernameFilter == null
                        || user.getUsername().toLowerCase(Locale.ROOT).contains(usernameFilter))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        return toResponse(findByIdOrThrow(id));
    }

    @Transactional
    public UserResponse createUserByAdmin(UserCreateRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(request.role())
                .build();

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = findByIdOrThrow(id);

        userRepository.findByUsername(request.username())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
                });

        userRepository.findByEmail(request.email())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
                });

        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setRole(request.role());

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateRole(Long id, UserRoleUpdateRequest request) {
        User user = findByIdOrThrow(id);
        user.setRole(request.role());
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void updatePassword(Long id, UserPasswordUpdateRequest request) {
        User user = findByIdOrThrow(id);
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = findByIdOrThrow(id);
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (user.getUsername().equals(currentUsername)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete currently authenticated user");
        }
        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public List<Role> getRoles() {
        return Arrays.stream(Role.values()).toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = getByUsername(username);
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public User getByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }

    private User findByIdOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private String normalizeFilter(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
            .roles(user.getRole().name())
                .build();
    }
}
