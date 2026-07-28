package com.ismagi.equipment.controller;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ismagi.equipment.domain.InterventionStatus;
import com.ismagi.equipment.domain.UrgencyLevel;
import com.ismagi.equipment.dto.intervention.InterventionResponse;
import com.ismagi.equipment.service.InterventionService;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class InterventionControllerMockMvcTest {

    @Autowired
    private MockMvc mockMvc;

        @MockitoBean
    private InterventionService interventionService;

    @Test
    @WithMockUser(username = "simple-user", roles = "USER")
    void createShouldReturn201ForAuthenticatedUser() throws Exception {
        InterventionResponse response = new InterventionResponse(
                101L,
                10L,
                "Laptop A",
                null,
                null,
                "Ecran noir",
                UrgencyLevel.HIGH,
                InterventionStatus.OPEN,
                null,
                3L,
                "simple-user",
                null,
                null,
                LocalDateTime.now(),
                LocalDateTime.now(),
                null,
                List.of()
        );

        when(interventionService.create(any())).thenReturn(response);

        String payload = """
                {
                  "equipmentId": 10,
                  "description": "Ecran noir",
                  "urgencyLevel": "HIGH"
                }
                """;

        mockMvc.perform(post("/api/interventions")
                        .with(csrf())
                        .contentType("application/json")
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(101)))
                .andExpect(jsonPath("$.status", is("OPEN")));
    }

    @Test
    @WithMockUser(username = "simple-user", roles = "USER")
    void assignShouldReturn403ForNonAuthorizedRole() throws Exception {
        String payload = """
                {
                  "assignedToUserId": 8
                }
                """;

        mockMvc.perform(post("/api/interventions/1/assign")
                        .with(csrf())
                        .contentType("application/json")
                        .content(payload))
                .andExpect(status().isForbidden());

        verifyNoInteractions(interventionService);
    }
}
