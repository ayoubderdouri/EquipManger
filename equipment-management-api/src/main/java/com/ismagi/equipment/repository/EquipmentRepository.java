package com.ismagi.equipment.repository;

import com.ismagi.equipment.domain.Equipment;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    Optional<Equipment> findByReference(String reference);

    boolean existsByReference(String reference);
}
