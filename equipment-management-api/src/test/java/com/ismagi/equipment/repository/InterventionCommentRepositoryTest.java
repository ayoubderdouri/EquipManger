package com.ismagi.equipment.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.ismagi.equipment.domain.InterventionComment;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import jakarta.persistence.EntityManager;

@DataJpaTest
class InterventionCommentRepositoryTest {

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private InterventionCommentRepository interventionCommentRepository;

    @Test
    void shouldReturnCommentsOrderedAndCountByIntervention() {
        entityManager.createNativeQuery("SET REFERENTIAL_INTEGRITY FALSE").executeUpdate();

        LocalDateTime createdAt = LocalDateTime.now().minusDays(1);

        entityManager.createNativeQuery("""
                insert into interventions
                (description, urgency_level, status, created_at, updated_at, created_by_id)
                values (?1, ?2, ?3, ?4, ?5, ?6)
                """)
                .setParameter(1, "Panne reseau")
                .setParameter(2, "HIGH")
                .setParameter(3, "IN_PROGRESS")
                .setParameter(4, createdAt)
                .setParameter(5, createdAt)
                .setParameter(6, 300L)
                .executeUpdate();

        Number interventionId = (Number) entityManager
                .createNativeQuery("select id from interventions where description = ?1")
                .setParameter(1, "Panne reseau")
                .getSingleResult();

        entityManager.createNativeQuery("""
                insert into intervention_comments
                (intervention_id, user_id, comment, created_at)
                values (?1, ?2, ?3, ?4)
                """)
                .setParameter(1, interventionId.longValue())
                .setParameter(2, 400L)
                .setParameter(3, "Diagnostic initial")
                .setParameter(4, LocalDateTime.now().minusHours(3))
                .executeUpdate();

        entityManager.createNativeQuery("""
                insert into intervention_comments
                (intervention_id, user_id, comment, created_at)
                values (?1, ?2, ?3, ?4)
                """)
                .setParameter(1, interventionId.longValue())
                .setParameter(2, 400L)
                .setParameter(3, "Remplacement effectue")
                .setParameter(4, LocalDateTime.now().minusHours(1))
                .executeUpdate();

        List<InterventionComment> comments = interventionCommentRepository
                .findAllByInterventionIdOrderByCreatedAtAsc(interventionId.longValue());
        long count = interventionCommentRepository.countByInterventionId(interventionId.longValue());

        assertEquals(2, comments.size());
        assertEquals("Diagnostic initial", comments.get(0).getComment());
        assertEquals("Remplacement effectue", comments.get(1).getComment());
        assertEquals(2, count);
    }
}
