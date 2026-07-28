package com.ismagi.equipment.repository;

import com.ismagi.equipment.domain.Intervention;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterventionRepository extends JpaRepository<Intervention, Long> {
    List<Intervention> findAllByOrderByCreatedAtDesc();

    List<Intervention> findAllByCreatedByIdOrderByCreatedAtDesc(Long createdById);

    List<Intervention> findAllByAssignedToIdOrderByCreatedAtDesc(Long assignedToId);
}