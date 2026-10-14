package com.arepo.serveur.controller;

import com.arepo.serveur.config.SecurityConfig;
import com.arepo.serveur.dto.ConventionCadreDto;
import com.arepo.serveur.exception.ResourceNotFoundException;
import com.arepo.serveur.exception.RestAccessDeniedHandler;
import com.arepo.serveur.exception.RestAuthenticationEntryPoint;
import com.arepo.serveur.security.CustomUserDetailsService;
import com.arepo.serveur.security.JwtService;
import com.arepo.serveur.service.ConventionCadreService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ConventionCadreController.class)
@Import({SecurityConfig.class, RestAuthenticationEntryPoint.class, RestAccessDeniedHandler.class})
class ConventionCadreControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ConventionCadreService conventionCadreService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private DaoAuthenticationProvider authenticationProvider;

    private ConventionCadreDto conventionDto(String etat) {
        ConventionCadreDto dto = new ConventionCadreDto();
        dto.setEtatConvention(etat);
        return dto;
    }

    // =========================================================
    //  GET
    // =========================================================

    @Test
    @WithMockUser(authorities = "CONVENTION_VIEW")
    void getAll_retourneLaListe() throws Exception {
        when(conventionCadreService.findAll()).thenReturn(List.of(conventionDto("SIGNEE")));

        mockMvc.perform(get("/api/conventions-cadre"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].etatConvention").value("SIGNEE"));
    }

    @Test
    @WithMockUser(authorities = "CONVENTION_VIEW")
    void getByProgramme_transmetLIdDuProgramme() throws Exception {
        UUID idProgramme = UUID.randomUUID();
        when(conventionCadreService.findByProgrammeId(idProgramme))
                .thenReturn(List.of(conventionDto("A"), conventionDto("B")));

        mockMvc.perform(get("/api/conventions-cadre/programme/{id}", idProgramme))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        verify(conventionCadreService).findByProgrammeId(idProgramme);
    }

    @Test
    @WithMockUser(authorities = "PROGRAMME_VIEW")
    void getAll_sansPermissionConvention_retourne403() throws Exception {
        mockMvc.perform(get("/api/conventions-cadre"))
                .andExpect(status().isForbidden());
    }

    // =========================================================
    //  POST
    // =========================================================

    @Test
    @WithMockUser(authorities = "CONVENTION_CREATE")
    void create_retourne201EtConvertitLeJson() throws Exception {
        UUID idPartenaire = UUID.randomUUID();
        UUID idProgramme = UUID.randomUUID();
        when(conventionCadreService.create(any(ConventionCadreDto.class))).thenReturn(conventionDto("SIGNEE"));

        String json = """
                {
                  "montantContribution": 1000000,
                  "etatConvention": "SIGNEE",
                  "dateParticipation": "2026-05-10",
                  "idPartenaire": "%s",
                  "idProgramme": "%s"
                }
                """.formatted(idPartenaire, idProgramme);

        mockMvc.perform(post("/api/conventions-cadre")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.etatConvention").value("SIGNEE"));

        ArgumentCaptor<ConventionCadreDto> captor = ArgumentCaptor.forClass(ConventionCadreDto.class);
        verify(conventionCadreService).create(captor.capture());
        assertThat(captor.getValue().getIdPartenaire()).isEqualTo(idPartenaire);
        assertThat(captor.getValue().getIdProgramme()).isEqualTo(idProgramme);
        assertThat(captor.getValue().getMontantContribution()).isEqualTo(1_000_000.0);
    }

    @Test
    @WithMockUser(authorities = "CONVENTION_CREATE")
    void create_partenaireInexistant_retourne404() throws Exception {
        when(conventionCadreService.create(any(ConventionCadreDto.class)))
                .thenThrow(new ResourceNotFoundException("Partenaire introuvable"));

        mockMvc.perform(post("/api/conventions-cadre")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"etatConvention\": \"SIGNEE\"}"))
                .andExpect(status().isNotFound());
    }

    // =========================================================
    //  PUT / DELETE
    // =========================================================

    @Test
    @WithMockUser(authorities = "CONVENTION_EDIT")
    void update_retourne200AvecLeBonId() throws Exception {
        UUID id = UUID.randomUUID();
        when(conventionCadreService.update(eq(id), any(ConventionCadreDto.class))).thenReturn(conventionDto("CLOTUREE"));

        mockMvc.perform(put("/api/conventions-cadre/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"etatConvention\": \"CLOTUREE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.etatConvention").value("CLOTUREE"));
    }

    @Test
    @WithMockUser(authorities = "CONVENTION_DELETE")
    void delete_retourne204() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/conventions-cadre/{id}", id))
                .andExpect(status().isNoContent());

        verify(conventionCadreService).delete(id);
    }

    @Test
    @WithMockUser(authorities = "CONVENTION_DELETE")
    void delete_contrainteEnBase_retourne409() throws Exception {
        UUID id = UUID.randomUUID();
        doThrow(new DataIntegrityViolationException("FK violation"))
                .when(conventionCadreService).delete(id);

        // GlobalExceptionHandler turns a database constraint error into 409 Conflict
        mockMvc.perform(delete("/api/conventions-cadre/{id}", id))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(authorities = "CONVENTION_VIEW")
    void delete_avecSeulementView_retourne403() throws Exception {
        mockMvc.perform(delete("/api/conventions-cadre/{id}", UUID.randomUUID()))
                .andExpect(status().isForbidden());

        verify(conventionCadreService, never()).delete(any());
    }
}
