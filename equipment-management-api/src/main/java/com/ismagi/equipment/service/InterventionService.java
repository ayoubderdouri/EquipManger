package com.ismagi.equipment.service;

import com.ismagi.equipment.domain.Equipment;
import com.ismagi.equipment.domain.Intervention;
import com.ismagi.equipment.domain.InterventionComment;
import com.ismagi.equipment.domain.InterventionStatus;
import com.ismagi.equipment.domain.Location;
import com.ismagi.equipment.domain.Role;
import com.ismagi.equipment.domain.User;
import com.ismagi.equipment.dto.intervention.InterventionAssignRequest;
import com.ismagi.equipment.dto.intervention.InterventionCommentCreateRequest;
import com.ismagi.equipment.dto.intervention.InterventionCommentResponse;
import com.ismagi.equipment.dto.intervention.InterventionCreateRequest;
import com.ismagi.equipment.dto.intervention.InterventionResponse;
import com.ismagi.equipment.repository.EquipmentRepository;
import com.ismagi.equipment.repository.InterventionCommentRepository;
import com.ismagi.equipment.repository.InterventionRepository;
import com.ismagi.equipment.repository.LocationRepository;
import com.ismagi.equipment.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class InterventionService {

    private final InterventionRepository interventionRepository;
    private final InterventionCommentRepository interventionCommentRepository;
    private final EquipmentRepository equipmentRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;

    public InterventionService(
            InterventionRepository interventionRepository,
            InterventionCommentRepository interventionCommentRepository,
            EquipmentRepository equipmentRepository,
            LocationRepository locationRepository,
            UserRepository userRepository
    ) {
        this.interventionRepository = interventionRepository;
        this.interventionCommentRepository = interventionCommentRepository;
        this.equipmentRepository = equipmentRepository;
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public InterventionResponse create(InterventionCreateRequest request) {
        if (request.equipmentId() == null && request.locationId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "At least one of equipmentId or locationId is required"
            );
        }

        Equipment equipment = null;
        if (request.equipmentId() != null) {
            equipment = equipmentRepository.findById(request.equipmentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipment not found"));
        }

        Location location = null;
        if (request.locationId() != null) {
            location = locationRepository.findById(request.locationId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found"));
        }

        User currentUser = getCurrentUser();
        LocalDateTime now = LocalDateTime.now();

        Intervention intervention = Intervention.builder()
                .equipment(equipment)
                .location(location)
                .description(request.description())
                .urgencyLevel(request.urgencyLevel())
                .status(InterventionStatus.OPEN)
                .imageUrl(request.imageUrl())
                .createdBy(currentUser)
                .createdAt(now)
                .updatedAt(now)
                .build();

        return toResponse(interventionRepository.save(intervention));
    }

    @Transactional(readOnly = true)
    public List<InterventionResponse> getAll() {
        User currentUser = getCurrentUser();

        List<Intervention> interventions = switch (currentUser.getRole()) {
            case ADMIN, RESPONSABLE_TECHNIQUE -> interventionRepository.findAllByOrderByCreatedAtDesc();
            case TECHNICIEN -> interventionRepository.findAllByAssignedToIdOrderByCreatedAtDesc(currentUser.getId());
            case USER -> interventionRepository.findAllByCreatedByIdOrderByCreatedAtDesc(currentUser.getId());
        };

        return interventions.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public InterventionResponse getById(Long id) {
        User currentUser = getCurrentUser();
        Intervention intervention = findInterventionOrThrow(id);
        assertCanViewIntervention(intervention, currentUser);
        return toResponse(intervention);
    }

    @Transactional
    public InterventionResponse assign(Long interventionId, InterventionAssignRequest request) {
        Intervention intervention = findInterventionOrThrow(interventionId);
        User assignedUser = userRepository.findById(request.assignedToUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assigned user not found"));

        if (assignedUser.getRole() != Role.TECHNICIEN && assignedUser.getRole() != Role.RESPONSABLE_TECHNIQUE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Intervention can only be assigned to TECHNICIEN or RESPONSABLE_TECHNIQUE"
            );
        }

        if (intervention.getStatus() == InterventionStatus.RESOLVED
                || intervention.getStatus() == InterventionStatus.CANCELLED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Resolved or cancelled intervention cannot be reassigned"
            );
        }

        intervention.setAssignedTo(assignedUser);
        if (intervention.getStatus() == InterventionStatus.OPEN) {
            intervention.setStatus(InterventionStatus.IN_PROGRESS);
        }
        intervention.setUpdatedAt(LocalDateTime.now());

        return toResponse(interventionRepository.save(intervention));
    }

    @Transactional
    public InterventionResponse addComment(Long interventionId, InterventionCommentCreateRequest request) {
        User currentUser = getCurrentUser();
        Intervention intervention = findInterventionOrThrow(interventionId);
        assertCanCommentOnIntervention(intervention, currentUser);

        if (intervention.getStatus() == InterventionStatus.RESOLVED
                || intervention.getStatus() == InterventionStatus.CANCELLED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot add comment to resolved or cancelled intervention"
            );
        }

        InterventionComment comment = InterventionComment.builder()
                .intervention(intervention)
                .user(currentUser)
                .comment(request.comment())
                .createdAt(LocalDateTime.now())
                .build();
        interventionCommentRepository.save(comment);

        if (request.targetStatus() != null) {
            applyStatusTransition(intervention, request.targetStatus());
        } else {
            intervention.setUpdatedAt(LocalDateTime.now());
        }

        return toResponse(interventionRepository.save(intervention));
    }

    private void applyStatusTransition(Intervention intervention, InterventionStatus targetStatus) {
        InterventionStatus currentStatus = intervention.getStatus();
        if (currentStatus == targetStatus) {
            return;
        }

        boolean isValidTransition = switch (currentStatus) {
            case OPEN -> targetStatus == InterventionStatus.IN_PROGRESS;
            case IN_PROGRESS -> targetStatus == InterventionStatus.RESOLVED || targetStatus == InterventionStatus.CANCELLED;
            case RESOLVED, CANCELLED -> false;
        };

        if (!isValidTransition) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid status transition: " + currentStatus + " -> " + targetStatus
            );
        }

        if (targetStatus == InterventionStatus.RESOLVED
                && interventionCommentRepository.countByInterventionId(intervention.getId()) < 1) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Intervention cannot be resolved without at least one comment"
            );
        }

        intervention.setStatus(targetStatus);
        intervention.setUpdatedAt(LocalDateTime.now());
        if (targetStatus == InterventionStatus.RESOLVED) {
            intervention.setResolvedAt(LocalDateTime.now());
        }
    }

    private Intervention findInterventionOrThrow(Long id) {
        return interventionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Intervention not found"));
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private void assertCanViewIntervention(Intervention intervention, User currentUser) {
        if (currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.RESPONSABLE_TECHNIQUE) {
            return;
        }

        if (currentUser.getRole() == Role.TECHNICIEN) {
            if (intervention.getAssignedTo() == null || !intervention.getAssignedTo().getId().equals(currentUser.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this intervention");
            }
            return;
        }

        if (!intervention.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this intervention");
        }
    }

    private void assertCanCommentOnIntervention(Intervention intervention, User currentUser) {
        if (currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.RESPONSABLE_TECHNIQUE) {
            return;
        }

        if (currentUser.getRole() == Role.TECHNICIEN
                && intervention.getAssignedTo() != null
                && intervention.getAssignedTo().getId().equals(currentUser.getId())) {
            return;
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot comment on this intervention");
    }

    private InterventionResponse toResponse(Intervention intervention) {
        List<InterventionCommentResponse> comments = interventionCommentRepository
                .findAllByInterventionIdOrderByCreatedAtAsc(intervention.getId())
                .stream()
                .map(this::toCommentResponse)
                .toList();

        return new InterventionResponse(
                intervention.getId(),
                intervention.getEquipment() != null ? intervention.getEquipment().getId() : null,
                intervention.getEquipment() != null ? intervention.getEquipment().getName() : null,
                intervention.getLocation() != null ? intervention.getLocation().getId() : null,
                intervention.getLocation() != null ? intervention.getLocation().getName() : null,
                intervention.getDescription(),
                intervention.getUrgencyLevel(),
                intervention.getStatus(),
                intervention.getImageUrl(),
                intervention.getCreatedBy().getId(),
                intervention.getCreatedBy().getUsername(),
                intervention.getAssignedTo() != null ? intervention.getAssignedTo().getId() : null,
                intervention.getAssignedTo() != null ? intervention.getAssignedTo().getUsername() : null,
                intervention.getCreatedAt(),
                intervention.getUpdatedAt(),
                intervention.getResolvedAt(),
                comments
        );
    }

    private InterventionCommentResponse toCommentResponse(InterventionComment comment) {
        return new InterventionCommentResponse(
                comment.getId(),
                comment.getUser().getId(),
                comment.getUser().getUsername(),
                comment.getComment(),
                comment.getCreatedAt()
        );
    }
}