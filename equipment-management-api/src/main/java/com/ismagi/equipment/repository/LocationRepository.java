package com.ismagi.equipment.repository;

import com.ismagi.equipment.domain.Location;
import com.ismagi.equipment.domain.LocationType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationRepository extends JpaRepository<Location, Long> {
    Optional<Location> findByName(String name);

    List<Location> findAllByType(LocationType type);

    boolean existsByName(String name);
}
