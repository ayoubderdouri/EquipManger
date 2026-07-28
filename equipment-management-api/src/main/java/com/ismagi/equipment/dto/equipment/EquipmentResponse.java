package com.ismagi.equipment.dto.equipment;

import com.ismagi.equipment.domain.EquipmentStatus;
import java.time.LocalDate;

public record EquipmentResponse(
        Long id,
        String name,
        String reference,
        String type,
        EquipmentStatus status,
        LocalDate acquisitionDate,
        String photoUrl,
        String technicalDescription,
        String serialNumber,
        Long locationId,
        String locationName
) {
}
