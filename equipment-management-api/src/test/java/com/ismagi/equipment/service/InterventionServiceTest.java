package com.ismagi.equipment.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ismagi.equipment.domain.Intervention;
import com.ismagi.equipment.domain.InterventionStatus;
import com.ismagi.equipment.domain.Role;
import com.ismagi.equipment.domain.UrgencyLevel;
import com.ismagi.equipment.domain.User;
import com.ismagi.equipment.dto.intervention.InterventionAssignRequest;
import com.ismagi.equipment.dto.intervention.InterventionCommentCreateRequest;
import com.ismagi.equipment.dto.intervention.InterventionCreateRequest;
import com.ismagi.equipment.repository.EquipmentRepository;
import com.ismagi.equipment.repository.InterventionCommentRepository;
import com.ismagi.equipment.repository.InterventionRepository;
import com.ismagi.equipment.repository.LocationRepository;
import com.ismagi.equipment.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class InterventionServiceTest {

    @Mock
    private InterventionRepository interventionRepository;

    @Mock
    private InterventionCommentRepository interventionCommentRepository;

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private LocationRepository locationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private InterventionService interventionService;

    @BeforeEach
    void setUpSecurityContext() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("current-user", "n/a")
        );
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createShouldRejectWhenNeitherEquipmentNorLocationIsProvided() {
        InterventionCreateRequest request = new InterventionCreateRequest(
                null,
                null,
                "Panne generale",
                UrgencyLevel.HIGH,
                null
        );

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> interventionService.create(request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(interventionRepository, never()).save(any());
    }

    @Test
    void addCommentShouldRejectResolvedTransitionWhenNoCommentHistoryExists() {
        User admin = User.builder().id(10L).username("admin").role(Role.ADMIN).build();
        Intervention intervention = Intervention.builder()
                .id(100L)
                .description("Panne ecran")
                .urgencyLevel(UrgencyLevel.MEDIUM)
                .status(InterventionStatus.IN_PROGRESS)
                .createdBy(admin)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(userRepository.findByUsername("current-user")).thenReturn(Optional.of(admin));
        when(interventionRepository.findById(100L)).thenReturn(Optional.of(intervention));
        when(interventionCommentRepository.countByInterventionId(100L)).thenReturn(0L);

        InterventionCommentCreateRequest request = new InterventionCommentCreateRequest(
                "Diagnostic termine",
                InterventionStatus.RESOLVED
        );

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> interventionService.addComment(100L, request)
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    void assignShouldRejectWhenAssignedUserIsNotTechnicianNorResponsible() {
        User creator = User.builder().id(1L).username("creator").role(Role.USER).build();
        Intervention intervention = Intervention.builder()
                .id(77L)
                .description("Panne imprimante")
                .urgencyLevel(UrgencyLevel.LOW)
                .status(InterventionStatus.OPEN)
                .createdBy(creator)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        User invalidAssignee = User.builder().id(2L).username("basic-user").role(Role.USER).build();

        when(interventionRepository.findById(77L)).thenReturn(Optional.of(intervention));
        when(userRepository.findById(2L)).thenReturn(Optional.of(invalidAssignee));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> interventionService.assign(77L, new InterventionAssignRequest(2L))
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(interventionRepository, never()).save(any());
    }
}
