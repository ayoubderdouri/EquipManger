package com.ismagi.equipment.service;

import com.ismagi.equipment.domain.Category;
import com.ismagi.equipment.domain.Equipment;
import com.ismagi.equipment.domain.Location;
import com.ismagi.equipment.dto.equipment.EquipmentCreateRequest;
import com.ismagi.equipment.dto.equipment.EquipmentResponse;
import com.ismagi.equipment.dto.equipment.EquipmentUpdateRequest;
import com.ismagi.equipment.repository.CategoryRepository;
import com.ismagi.equipment.repository.EquipmentRepository;
import com.ismagi.equipment.repository.LocationRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final LocationRepository locationRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    public EquipmentService(
            EquipmentRepository equipmentRepository,
            LocationRepository locationRepository,
            CategoryRepository categoryRepository,
            FileStorageService fileStorageService
    ) {
        this.equipmentRepository = equipmentRepository;
        this.locationRepository = locationRepository;
        this.categoryRepository = categoryRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public EquipmentResponse create(EquipmentCreateRequest request, MultipartFile photo) {
        if (equipmentRepository.existsByReference(request.reference())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Equipment reference already exists");
        }

        Location location = findLocationOrThrow(request.locationId());
    Category category = findCategoryOrThrow(request.categoryId());
        String photoPath = fileStorageService.storeEquipmentImage(photo);

        Equipment equipment = Equipment.builder()
                .name(request.name())
                .reference(request.reference())
                .type(request.type())
                .status(request.status())
                .acquisitionDate(request.acquisitionDate())
                .photoUrl(photoPath)
                .technicalDescription(request.technicalDescription())
                .serialNumber(request.serialNumber())
                .location(location)
                .category(category)
                .build();

        return toResponse(equipmentRepository.save(equipment));
    }

    @Transactional(readOnly = true)
    public List<EquipmentResponse> getAll() {
        return equipmentRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public EquipmentResponse getById(Long id) {
        return toResponse(findEquipmentOrThrow(id));
    }

    @Transactional
    public EquipmentResponse update(Long id, EquipmentUpdateRequest request, MultipartFile photo) {
        Equipment equipment = findEquipmentOrThrow(id);
        String previousPhotoPath = equipment.getPhotoUrl();

        equipmentRepository.findByReference(request.reference())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Equipment reference already exists");
                });

        Location location = findLocationOrThrow(request.locationId());
        Category category = findCategoryOrThrow(request.categoryId());
        if (photo != null && !photo.isEmpty()) {
            equipment.setPhotoUrl(fileStorageService.storeEquipmentImage(photo));
        }

        equipment.setName(request.name());
        equipment.setReference(request.reference());
        equipment.setType(request.type());
        equipment.setStatus(request.status());
        equipment.setAcquisitionDate(request.acquisitionDate());
        equipment.setTechnicalDescription(request.technicalDescription());
        equipment.setSerialNumber(request.serialNumber());
        equipment.setLocation(location);
        equipment.setCategory(category);

        Equipment savedEquipment = equipmentRepository.save(equipment);
        if (photo != null && !photo.isEmpty() && StringUtils.hasText(previousPhotoPath)) {
            fileStorageService.deleteEquipmentImage(previousPhotoPath);
        }

        return toResponse(savedEquipment);
    }

    @Transactional
    public void delete(Long id) {
        Equipment equipment = findEquipmentOrThrow(id);
        String photoPath = equipment.getPhotoUrl();
        equipmentRepository.delete(equipment);
        if (StringUtils.hasText(photoPath)) {
            fileStorageService.deleteEquipmentImage(photoPath);
        }
    }

    private Equipment findEquipmentOrThrow(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipment not found"));
    }

    private Location findLocationOrThrow(Long locationId) {
        return locationRepository.findById(locationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found"));
    }

    private Category findCategoryOrThrow(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
    }

    public EquipmentResponse toResponse(Equipment equipment) {
        return new EquipmentResponse(
                equipment.getId(),
                equipment.getName(),
                equipment.getReference(),
                equipment.getType(),
                equipment.getStatus(),
                equipment.getAcquisitionDate(),
                equipment.getPhotoUrl(),
                equipment.getTechnicalDescription(),
                equipment.getSerialNumber(),
                equipment.getLocation().getId(),
                equipment.getLocation().getName()
        );
    }
}
