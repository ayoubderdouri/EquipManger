package com.ismagi.equipment.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.ismagi.equipment.domain.Intervention;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import jakarta.persistence.EntityManager;

@DataJpaTest
class InterventionRepositoryTest {

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private InterventionRepository interventionRepository;

    @Test
    void findByCreatedByAndAssignedToShouldReturnOrderedResults() {
        entityManager.createNativeQuery("SET REFERENTIAL_INTEGRITY FALSE").executeUpdate();

        LocalDateTime olderDate = LocalDateTime.now().minusDays(2);
        LocalDateTime newerDate = LocalDateTime.now().minusHours(1);

        entityManager.createNativeQuery("""
                insert into interventions
                (description, urgency_level, status, created_at, updated_at, created_by_id, assigned_to_id)
                values (?1, ?2, ?3, ?4, ?5, ?6, ?7)
                """)
                .setParameter(1, "Intervention ancienne")
                .setParameter(2, "LOW")
                .setParameter(3, "OPEN")
                .setParameter(4, olderDate)
                .setParameter(5, olderDate)
                .setParameter(6, 100L)
                .setParameter(7, 200L)
                .executeUpdate();

        entityManager.createNativeQuery("""
                insert into interventions
                (description, urgency_level, status, created_at, updated_at, created_by_id, assigned_to_id)
                values (?1, ?2, ?3, ?4, ?5, ?6, ?7)
                """)
                .setParameter(1, "Intervention recente")
                .setParameter(2, "HIGH")
                .setParameter(3, "IN_PROGRESS")
                .setParameter(4, newerDate)
                .setParameter(5, newerDate)
                .setParameter(6, 100L)
                .setParameter(7, 200L)
                .executeUpdate();

        List<Intervention> byCreator = interventionRepository.findAllByCreatedByIdOrderByCreatedAtDesc(100L);
        List<Intervention> byAssignee = interventionRepository.findAllByAssignedToIdOrderByCreatedAtDesc(200L);

        assertEquals(2, byCreator.size());
        assertEquals("Intervention recente", byCreator.get(0).getDescription());
        assertEquals("Intervention ancienne", byCreator.get(1).getDescription());

        assertEquals(2, byAssignee.size());
        assertEquals("Intervention recente", byAssignee.get(0).getDescription());
        assertEquals("Intervention ancienne", byAssignee.get(1).getDescription());
    }
}
