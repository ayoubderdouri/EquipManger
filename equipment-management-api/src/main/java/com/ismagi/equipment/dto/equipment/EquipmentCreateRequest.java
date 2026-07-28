package com.ismagi.equipment.dto.equipment;

import com.ismagi.equipment.domain.EquipmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record EquipmentCreateRequest(
        @NotBlank @Size(min = 2, max = 150) String name,
        @NotBlank @Size(min = 2, max = 80) String reference,
        @NotBlank @Size(min = 2, max = 80) String type,
        @NotNull EquipmentStatus status,
        @NotNull @PastOrPresent LocalDate acquisitionDate,
        @Size(max = 1500) String technicalDescription,
        @Size(max = 120) String serialNumber,
        @NotNull Long locationId
) {
}
