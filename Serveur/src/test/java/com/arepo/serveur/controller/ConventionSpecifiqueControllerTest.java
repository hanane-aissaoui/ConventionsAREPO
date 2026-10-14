package com.arepo.serveur.controller;

import com.arepo.serveur.config.SecurityConfig;
import com.arepo.serveur.dto.ConventionSpecifiqueDto;
import com.arepo.serveur.exception.ResourceNotFoundException;
import com.arepo.serveur.exception.RestAccessDeniedHandler;
import com.arepo.serveur.exception.RestAuthenticationEntryPoint;
import com.arepo.serveur.security.CustomUserDetailsService;
import com.arepo.serveur.security.JwtService;
import com.arepo.serveur.service.ConventionSpecifiqueService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
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

@WebMvcTest(ConventionSpecifiqueController.class)
@Import({SecurityConfig.class, RestAuthenticationEntryPoint.class, RestAccessDeniedHandler.class})
class ConventionSpecifiqueControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ConventionSpecifiqueService conventionSpecifiqueService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private DaoAuthenticationProvider authenticationProvider;

    private ConventionSpecifiqueDto conventionDto(String etat) {
        ConventionSpecifiqueDto dto = new ConventionSpecifiqueDto();
        dto.setEtatConvention(etat);
        return dto;
    }

    // =========================================================
    //  GET
    // =========================================================

    @Test
    @WithMockUser(authorities = "CONVENTION_VIEW")
    void getAll_retourneLaListe() throws Exception {
        when(conventionSpecifiqueService.findAll()).thenReturn(List.of(conventionDto("SIGNEE")));

        mockMvc.perform(get("/api/conventions-specifiques"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].etatConvention").value("SIGNEE"));
    }

    @Test
    @WithMockUser(authorities = "CONVENTION_VIEW")
    void getByProjet_transmetLIdDuProjet() throws Exception {
        UUID idProjet = UUID.randomUUID();
        when(conventionSpecifiqueService.findByProjetId(idProjet)).thenReturn(List.of(conventionDto("A")));

        mockMvc.perform(get("/api/conventions-specifiques/projet/{id}", idProjet))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        verify(conventionSpecifiqueService).findByProjetId(idProjet);
    }

    // =========================================================
    //  POST
    // =========================================================

    @Test
    @WithMockUser(authorities = "CONVENTION_CREATE")
    void create_retourne201EtConvertitLeJson() throws Exception {
        UUID idPartenaire = UUID.randomUUID();
        UUID idProjet = UUID.randomUUID();
        when(conventionSpecifiqueService.create(any(ConventionSpecifiqueDto.class))).thenReturn(conventionDto("SIGNEE"));

        String json = """
                {
                  "montantContribution": 300000,
                  "etatConvention": "SIGNEE",
                  "idPartenaire": "%s",
                  "idProjet": "%s"
                }
                """.formatted(idPartenaire, idProjet);

        mockMvc.perform(post("/api/conventions-specifiques")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated());

        ArgumentCaptor<ConventionSpecifiqueDto> captor = ArgumentCaptor.forClass(ConventionSpecifiqueDto.class);
        verify(conventionSpecifiqueService).create(captor.capture());
        assertThat(captor.getValue().getIdPartenaire()).isEqualTo(idPartenaire);
        assertThat(captor.getValue().getIdProjet()).isEqualTo(idProjet);
    }

    @Test
    @WithMockUser(authorities = "CONVENTION_CREATE")
    void create_projetInexistant_retourne404() throws Exception {
        when(conventionSpecifiqueService.create(any(ConventionSpecifiqueDto.class)))
                .thenThrow(new ResourceNotFoundException("Projet introuvable"));

        mockMvc.perform(post("/api/conventions-specifiques")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"etatConvention\": \"SIGNEE\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(authorities = "CONVENTION_VIEW")
    void create_avecSeulementView_retourne403() throws Exception {
        mockMvc.perform(post("/api/conventions-specifiques")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"etatConvention\": \"SIGNEE\"}"))
                .andExpect(status().isForbidden());

        verify(conventionSpecifiqueService, never()).create(any());
    }

    // =========================================================
    //  PUT / DELETE
    // =========================================================

    @Test
    @WithMockUser(authorities = "CONVENTION_EDIT")
    void update_retourne200AvecLeBonId() throws Exception {
        UUID id = UUID.randomUUID();
        when(conventionSpecifiqueService.update(eq(id), any(ConventionSpecifiqueDto.class)))
                .thenReturn(conventionDto("CLOTUREE"));

        mockMvc.perform(put("/api/conventions-specifiques/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"etatConvention\": \"CLOTUREE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.etatConvention").value("CLOTUREE"));
    }

    @Test
    @WithMockUser(authorities = "CONVENTION_DELETE")
    void delete_retourne204() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/conventions-specifiques/{id}", id))
                .andExpect(status().isNoContent());

        verify(conventionSpecifiqueService).delete(id);
    }
}
