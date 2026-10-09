package com.arepo.serveur.controller;

import com.arepo.serveur.config.SecurityConfig;
import com.arepo.serveur.dto.PageResponse;
import com.arepo.serveur.dto.ProjetDto;
import com.arepo.serveur.exception.RestAccessDeniedHandler;
import com.arepo.serveur.exception.RestAuthenticationEntryPoint;
import com.arepo.serveur.security.CustomUserDetailsService;
import com.arepo.serveur.security.JwtService;
import com.arepo.serveur.service.ProjetService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Loads ONLY the web layer for ProjetController (no database, no other controllers)
@WebMvcTest(ProjetController.class)
// Loads YOUR real security rules, so @PreAuthorize works like in production
@Import({SecurityConfig.class, RestAuthenticationEntryPoint.class, RestAccessDeniedHandler.class})
class ProjetControllerTest {

    // Fake HTTP client: sends requests to the controller without starting a server
    @Autowired
    private MockMvc mockMvc;

    // The controller needs the service -> we give it a fake one
    @MockitoBean
    private ProjetService projetService;

    // Your security setup needs these beans to start -> fakes are enough
    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private DaoAuthenticationProvider authenticationProvider;

    private ProjetDto projetDto(String nom) {
        ProjetDto dto = new ProjetDto();
        dto.setNom(nom);
        return dto;
    }

    // =========================================================
    //  GET /api/projets  (list with pagination + search)
    // =========================================================

    @Test
    @WithMockUser(authorities = "PROJET_VIEW")
    void getPage_sansRecherche_retourne200() throws Exception {
        when(projetService.findPage(any(), any(Pageable.class)))
                .thenReturn(PageResponse.from(new PageImpl<>(List.of(projetDto("Projet A")))));

        mockMvc.perform(get("/api/projets"))
                .andExpect(status().isOk());

        // No ?search= in the URL -> the controller must pass "" (the defaultValue)
        verify(projetService).findPage(eq(""), any(Pageable.class));
    }

    @Test
    @WithMockUser(authorities = "PROJET_VIEW")
    void getPage_avecRecherche_transmetLeTexteAuService() throws Exception {
        when(projetService.findPage(any(), any(Pageable.class)))
                .thenReturn(PageResponse.from(new PageImpl<>(List.of(projetDto("Projet A")))));

        mockMvc.perform(get("/api/projets").param("search", "Oujda"))
                .andExpect(status().isOk());

        verify(projetService).findPage(eq("Oujda"), any(Pageable.class));
    }

    // =========================================================
    //  GET /api/projets/{id}
    // =========================================================

    @Test
    @WithMockUser(authorities = "PROJET_VIEW")
    void getById_retourne200EtLeProjetEnJson() throws Exception {
        UUID id = UUID.randomUUID();
        when(projetService.findById(id)).thenReturn(projetDto("Projet A"));

        mockMvc.perform(get("/api/projets/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("Projet A"));
    }

    // =========================================================
    //  GET /api/projets/programme/{idProgramme}
    // =========================================================

    @Test
    @WithMockUser(authorities = "PROJET_VIEW")
    void getByProgramme_retourneLaListe() throws Exception {
        UUID idProgramme = UUID.randomUUID();
        when(projetService.findByProgramme(idProgramme))
                .thenReturn(List.of(projetDto("Projet A"), projetDto("Projet B")));

        mockMvc.perform(get("/api/projets/programme/{id}", idProgramme))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].nom").value("Projet A"))
                .andExpect(jsonPath("$[1].nom").value("Projet B"));
    }

    // =========================================================
    //  POST /api/projets
    // =========================================================

    @Test
    @WithMockUser(authorities = "PROJET_CREATE")
    void create_retourne201EtLeProjetCree() throws Exception {
        UUID idProgramme = UUID.randomUUID();
        UUID idCommune = UUID.randomUUID();
        when(projetService.create(any(ProjetDto.class))).thenReturn(projetDto("Nouveau projet"));

        // The JSON body, exactly like the frontend would send it
        String json = """
                {
                  "nom": "Nouveau projet",
                  "idProgramme": "%s",
                  "idCommune": "%s"
                }
                """.formatted(idProgramme, idCommune);

        mockMvc.perform(post("/api/projets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nom").value("Nouveau projet"));

        // Check that the JSON was correctly converted into a ProjetDto
        ArgumentCaptor<ProjetDto> captor = ArgumentCaptor.forClass(ProjetDto.class);
        verify(projetService).create(captor.capture());
        assertThat(captor.getValue().getNom()).isEqualTo("Nouveau projet");
        assertThat(captor.getValue().getIdProgramme()).isEqualTo(idProgramme);
        assertThat(captor.getValue().getIdCommune()).isEqualTo(idCommune);
    }

    // =========================================================
    //  PUT /api/projets/{id}
    // =========================================================

    @Test
    @WithMockUser(authorities = "PROJET_EDIT")
    void update_retourne200EtAppelleLeServiceAvecLeBonId() throws Exception {
        UUID id = UUID.randomUUID();
        when(projetService.update(eq(id), any(ProjetDto.class))).thenReturn(projetDto("Nom modifie"));

        mockMvc.perform(put("/api/projets/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nom\": \"Nom modifie\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("Nom modifie"));

        verify(projetService).update(eq(id), any(ProjetDto.class));
    }

    // =========================================================
    //  DELETE /api/projets/{id}
    // =========================================================

    @Test
    @WithMockUser(authorities = "PROJET_DELETE")
    void delete_retourne204() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/projets/{id}", id))
                .andExpect(status().isNoContent());

        verify(projetService).delete(id);
    }
}