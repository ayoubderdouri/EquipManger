package com.ismagi.equipment.service;

import com.ismagi.equipment.domain.Location;
import com.ismagi.equipment.domain.LocationType;
import com.ismagi.equipment.dto.location.LocationCreateRequest;
import com.ismagi.equipment.dto.location.LocationResponse;
import com.ismagi.equipment.dto.location.LocationUpdateRequest;
import com.ismagi.equipment.repository.LocationRepository;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class LocationService {

    private final LocationRepository locationRepository;

    public LocationService(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    @Transactional
    public LocationResponse create(LocationCreateRequest request) {
        if (locationRepository.existsByName(request.name())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Location name already exists");
        }

        Location location = Location.builder()
                .name(request.name())
                .type(request.type())
                .localization(request.localization())
                .description(request.description())
                .build();

        return toResponse(locationRepository.save(location));
    }

    @Transactional(readOnly = true)
    public List<LocationResponse> getAll(LocationType type) {
        List<Location> locations = type == null
                ? locationRepository.findAll()
                : locationRepository.findAllByType(type);
        return locations.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public LocationResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public LocationResponse update(Long id, LocationUpdateRequest request) {
        Location location = findOrThrow(id);

        locationRepository.findByName(request.name())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Location name already exists");
                });

        location.setName(request.name());
        location.setType(request.type());
        location.setLocalization(request.localization());
        location.setDescription(request.description());

        return toResponse(locationRepository.save(location));
    }

    @Transactional
    public void delete(Long id) {
        Location location = findOrThrow(id);
        try {
            locationRepository.delete(location);
            locationRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Location cannot be deleted because it is linked to existing equipments",
                    ex
            );
        }
    }

    private Location findOrThrow(Long id) {
        return locationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found"));
    }

    public LocationResponse toResponse(Location location) {
        return new LocationResponse(
                location.getId(),
                location.getName(),
                location.getType(),
                location.getLocalization(),
                location.getDescription()
        );
    }
}
