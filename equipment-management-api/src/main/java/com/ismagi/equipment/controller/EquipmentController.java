package com.ismagi.equipment.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.ismagi.equipment.dto.equipment.EquipmentCreateRequest;
import com.ismagi.equipment.dto.equipment.EquipmentResponse;
import com.ismagi.equipment.dto.equipment.EquipmentUpdateRequest;
import com.ismagi.equipment.service.EquipmentService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import java.io.IOException;
import java.util.List;
import java.util.Set;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/equipments")
@SecurityRequirement(name = "bearerAuth")
public class EquipmentController {

    private final EquipmentService equipmentService;
    private final ObjectMapper objectMapper = JsonMapper.builder().findAndAddModules().build();
    private final Validator validator;

    public EquipmentController(EquipmentService equipmentService, Validator validator) {
        this.equipmentService = equipmentService;
        this.validator = validator;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public EquipmentResponse create(
            @RequestPart("request") byte[] request,
            @RequestParam(value = "photo", required = false) MultipartFile photo
    ) {
        EquipmentCreateRequest payload = parseAndValidate(request, EquipmentCreateRequest.class);
        return equipmentService.create(payload, photo);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<EquipmentResponse> getAll() {
        return equipmentService.getAll();
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public EquipmentResponse getById(@PathVariable Long id) {
        return equipmentService.getById(id);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasRole('ADMIN')")
    public EquipmentResponse update(
            @PathVariable Long id,
            @RequestPart("request") byte[] request,
            @RequestParam(value = "photo", required = false) MultipartFile photo
    ) {
        EquipmentUpdateRequest payload = parseAndValidate(request, EquipmentUpdateRequest.class);
        return equipmentService.update(id, payload, photo);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        equipmentService.delete(id);
    }

    private <T> T parseAndValidate(byte[] request, Class<T> targetType) {
        if (request == null || request.length == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "request part is required");
        }

        T payload;
        try {
            payload = objectMapper.readValue(request, targetType);
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid JSON in request part", ex);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid JSON in request part", ex);
        }

        Set<ConstraintViolation<T>> violations = validator.validate(payload);
        if (!violations.isEmpty()) {
            String errorMessage = violations.stream()
                    .map(v -> v.getPropertyPath() + " " + v.getMessage())
                    .sorted()
                    .reduce((a, b) -> a + "; " + b)
                    .orElse("Validation failed");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, errorMessage);
        }

        return payload;
    }
}
