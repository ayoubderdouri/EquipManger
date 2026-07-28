package com.ismagi.equipment.controller;

import com.ismagi.equipment.domain.LocationType;
import com.ismagi.equipment.dto.location.LocationCreateRequest;
import com.ismagi.equipment.dto.location.LocationResponse;
import com.ismagi.equipment.dto.location.LocationUpdateRequest;
import com.ismagi.equipment.service.LocationService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/locations")
@SecurityRequirement(name = "bearerAuth")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public LocationResponse create(@Valid @RequestBody LocationCreateRequest request) {
        return locationService.create(request);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<LocationResponse> getAll(@RequestParam(required = false) LocationType type) {
        return locationService.getAll(type);
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public LocationResponse getById(@PathVariable Long id) {
        return locationService.getById(id);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasRole('ADMIN')")
    public LocationResponse update(@PathVariable Long id, @Valid @RequestBody LocationUpdateRequest request) {
        return locationService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        locationService.delete(id);
    }
}
