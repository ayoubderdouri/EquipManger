package com.ismagi.equipment.dto.location;

import com.ismagi.equipment.domain.LocationType;

public record LocationResponse(
        Long id,
        String name,
        LocationType type,
        String localization,
        String description
) {
}
