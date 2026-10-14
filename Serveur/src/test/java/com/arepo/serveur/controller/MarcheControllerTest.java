package com.arepo.serveur.controller;

import com.arepo.serveur.config.SecurityConfig;
import com.arepo.serveur.dto.MarcheDto;
import com.arepo.serveur.exception.RestAccessDeniedHandler;
import com.arepo.serveur.exception.RestAuthenticationEntryPoint;
import com.arepo.serveur.security.CustomUserDetailsService;
import com.arepo.serveur.security.JwtService;
import com.arepo.serveur.service.MarcheService;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MarcheController.class)
@Import({SecurityConfig.class, RestAuthenticationEntryPoint.class, RestAccessDeniedHandler.class})
class MarcheControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MarcheService marcheService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private DaoAuthenticationProvider authenticationProvider;

    private MarcheDto marcheDto(String typeAction) {
        MarcheDto dto = new MarcheDto();
        dto.setTypeAction(typeAction);
        return dto;
    }

    // =========================================================
    //  GET (Marche uses the PROJET_* permissions)
    // =========================================================

    @Test
    @WithMockUser(authorities = "PROJET_VIEW")
    void getAll_retourneLaListe() throws Exception {
        when(marcheService.findAll()).thenReturn(List.of(marcheDto("TRAVAUX"), marcheDto("ETUDES")));

        mockMvc.perform(get("/api/marches"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[1].typeAction").value("ETUDES"));
    }

    @Test
    @WithMockUser(authorities = "PROJET_VIEW")
    void getByProjet_transmetLIdDuProjet() throws Exception {
        UUID idProjet = UUID.randomUUID();
        when(marcheService.findByProjetId(idProjet)).thenReturn(List.of(marcheDto("TRAVAUX")));

        mockMvc.perform(get("/api/marches/projet/{idProjet}", idProjet))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].typeAction").value("TRAVAUX"));

        verify(marcheService).findByProjetId(idProjet);
    }

    // =========================================================
    //  POST
    // =========================================================

    @Test
    @WithMockUser(authorities = "PROJET_CREATE")
    void create_retourne201EtConvertitLeJson() throws Exception {
        UUID idProjet = UUID.randomUUID();
        when(marcheService.create(any(MarcheDto.class))).thenReturn(marcheDto("TRAVAUX"));

        String json = """
                {
                  "typeAction": "TRAVAUX",
                  "attributaireRealisateur": "Entreprise BTP",
                  "montantEngage": 500000,
                  "avancementPhysique": 40,
                  "idProjet": "%s"
                }
                """.formatted(idProjet);

        mockMvc.perform(post("/api/marches")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.typeAction").value("TRAVAUX"));

        ArgumentCaptor<MarcheDto> captor = ArgumentCaptor.forClass(MarcheDto.class);
        verify(marcheService).create(captor.capture());
        assertThat(captor.getValue().getAttributaireRealisateur()).isEqualTo("Entreprise BTP");
        assertThat(captor.getValue().getAvancementPhysique()).isEqualTo(40);
        assertThat(captor.getValue().getIdProjet()).isEqualTo(idProjet);
    }

    @Test
    @WithMockUser(authorities = "PROJET_CREATE")
    void create_typeActionInvalide_retourne400AvecLeMessage() throws Exception {
        when(marcheService.create(any(MarcheDto.class)))
                .thenThrow(new IllegalArgumentException("Type d'action invalide : PEINTURE"));

        // GlobalExceptionHandler turns IllegalArgumentException into 400 + message
        mockMvc.perform(post("/api/marches")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"typeAction\": \"PEINTURE\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Type d'action invalide : PEINTURE"));
    }

    @Test
    @WithMockUser(authorities = "PROJET_VIEW")
    void create_avecSeulementView_retourne403() throws Exception {
        mockMvc.perform(post("/api/marches")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"typeAction\": \"TRAVAUX\"}"))
                .andExpect(status().isForbidden());

        verify(marcheService, never()).create(any());
    }

    // =========================================================
    //  PUT / DELETE
    // =========================================================

    @Test
    @WithMockUser(authorities = "PROJET_EDIT")
    void update_retourne200AvecLeBonId() throws Exception {
        UUID id = UUID.randomUUID();
        when(marcheService.update(eq(id), any(MarcheDto.class))).thenReturn(marcheDto("ETUDES"));

        mockMvc.perform(put("/api/marches/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"typeAction\": \"ETUDES\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.typeAction").value("ETUDES"));

        verify(marcheService).update(eq(id), any(MarcheDto.class));
    }

    @Test
    @WithMockUser(authorities = "PROJET_DELETE")
    void delete_retourne204() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/marches/{id}", id))
                .andExpect(status().isNoContent());

        verify(marcheService).delete(id);
    }

    @Test
    @WithMockUser(authorities = "PROJET_EDIT")
    void delete_avecSeulementEdit_retourne403() throws Exception {
        mockMvc.perform(delete("/api/marches/{id}", UUID.randomUUID()))
                .andExpect(status().isForbidden());

        verify(marcheService, never()).delete(any());
    }
}
