package com.ismagi.equipment.controller;

import com.ismagi.equipment.dto.intervention.InterventionAssignRequest;
import com.ismagi.equipment.dto.intervention.InterventionCommentCreateRequest;
import com.ismagi.equipment.dto.intervention.InterventionCreateRequest;
import com.ismagi.equipment.dto.intervention.InterventionResponse;
import com.ismagi.equipment.service.InterventionService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/interventions")
@SecurityRequirement(name = "bearerAuth")
public class InterventionController {

    private final InterventionService interventionService;

    public InterventionController(InterventionService interventionService) {
        this.interventionService = interventionService;
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<InterventionResponse> getAll() {
        return interventionService.getAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InterventionResponse create(@Valid @RequestBody InterventionCreateRequest request) {
        return interventionService.create(request);
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public InterventionResponse getById(@PathVariable Long id) {
        return interventionService.getById(id);
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_TECHNIQUE')")
    @ResponseStatus(HttpStatus.OK)
    public InterventionResponse assign(@PathVariable Long id, @Valid @RequestBody InterventionAssignRequest request) {
        return interventionService.assign(id, request);
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_TECHNIQUE', 'TECHNICIEN')")
    @ResponseStatus(HttpStatus.OK)
    public InterventionResponse addComment(
            @PathVariable Long id,
            @Valid @RequestBody InterventionCommentCreateRequest request
    ) {
        return interventionService.addComment(id, request);
    }
}