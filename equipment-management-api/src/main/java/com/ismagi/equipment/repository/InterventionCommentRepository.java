package com.ismagi.equipment.repository;

import com.ismagi.equipment.domain.InterventionComment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterventionCommentRepository extends JpaRepository<InterventionComment, Long> {
    List<InterventionComment> findAllByInterventionIdOrderByCreatedAtAsc(Long interventionId);

    long countByInterventionId(Long interventionId);
}