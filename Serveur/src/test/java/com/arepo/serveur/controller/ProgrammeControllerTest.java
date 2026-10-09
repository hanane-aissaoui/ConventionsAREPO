package com.arepo.serveur.controller;

import com.arepo.serveur.config.SecurityConfig;
import com.arepo.serveur.dto.ProgrammeDto;
import com.arepo.serveur.exception.ResourceNotFoundException;
import com.arepo.serveur.exception.RestAccessDeniedHandler;
import com.arepo.serveur.exception.RestAuthenticationEntryPoint;
import com.arepo.serveur.security.CustomUserDetailsService;
import com.arepo.serveur.security.JwtService;
import com.arepo.serveur.service.ProgrammeService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProgrammeController.class)
@Import({SecurityConfig.class, RestAuthenticationEntryPoint.class, RestAccessDeniedHandler.class})
class ProgrammeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProgrammeService programmeService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private DaoAuthenticationProvider authenticationProvider;

    private ProgrammeDto programmeDto(String objet) {
        ProgrammeDto dto = new ProgrammeDto();
        dto.setObjet(objet);
        return dto;
    }

    // =========================================================
    //  GET /api/programmes  (pagination + search)
    // =========================================================

    @Test
    @WithMockUser(authorities = "PROGRAMME_VIEW")
    void getAll_sansParametres_utiliseLesValeursParDefaut() throws Exception {
        when(programmeService.findAll(any(Pageable.class), any()))
                .thenReturn(new PageImpl<>(List.of(programmeDto("Programme A"))));

        mockMvc.perform(get("/api/programmes"))
                .andExpect(status().isOk());

        // We catch the Pageable built by the controller and check it
        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(programmeService).findAll(captor.capture(), isNull());
        Pageable pageable = captor.getValue();
        assertThat(pageable.getPageNumber()).isZero();
        assertThat(pageable.getPageSize()).isEqualTo(10);
        assertThat(pageable.getSort()).isEqualTo(Sort.by("dateUpdate").descending());
    }

    @Test
    @WithMockUser(authorities = "PROGRAMME_VIEW")
    void getAll_avecParametres_transmetPageTailleEtRecherche() throws Exception {
        when(programmeService.findAll(any(Pageable.class), any()))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/api/programmes")
                        .param("page", "2")
                        .param("size", "5")
                        .param("objet", "eau"))
                .andExpect(status().isOk());

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(programmeService).findAll(captor.capture(), eq("eau"));
        assertThat(captor.getValue().getPageNumber()).isEqualTo(2);
        assertThat(captor.getValue().getPageSize()).isEqualTo(5);
    }

    // =========================================================
    //  GET /api/programmes/all
    // =========================================================

    @Test
    @WithMockUser(authorities = "PROGRAMME_VIEW")
    void getAllUnpaged_retourneLaListeComplete() throws Exception {
        when(programmeService.findAllList())
                .thenReturn(List.of(programmeDto("A"), programmeDto("B")));

        mockMvc.perform(get("/api/programmes/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[1].objet").value("B"));
    }

    // =========================================================
    //  GET /api/programmes/{id}
    // =========================================================

    @Test
    @WithMockUser(authorities = "PROGRAMME_VIEW")
    void getById_retourne200EtLeProgramme() throws Exception {
        UUID id = UUID.randomUUID();
        when(programmeService.findById(id)).thenReturn(programmeDto("Programme A"));

        mockMvc.perform(get("/api/programmes/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.objet").value("Programme A"));
    }

    @Test
    @WithMockUser(authorities = "PROGRAMME_VIEW")
    void getById_programmeInexistant_retourne404() throws Exception {
        UUID id = UUID.randomUUID();
        when(programmeService.findById(id))
                .thenThrow(new ResourceNotFoundException("Programme introuvable : " + id));

        // GlobalExceptionHandler must turn the exception into a clean 404
        mockMvc.perform(get("/api/programmes/{id}", id))
                .andExpect(status().isNotFound());
    }

    // =========================================================
    //  POST /api/programmes
    // =========================================================

    @Test
    @WithMockUser(authorities = "PROGRAMME_CREATE")
    void create_retourne201EtConvertitLeJson() throws Exception {
        when(programmeService.create(any(ProgrammeDto.class))).thenReturn(programmeDto("Nouveau"));

        String json = """
                {
                  "objet": "Nouveau",
                  "dateDebut": "2026-01-01",
                  "dateFin": "2027-12-31",
                  "budgetEstime": 250000
                }
                """;

        mockMvc.perform(post("/api/programmes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.objet").value("Nouveau"));

        ArgumentCaptor<ProgrammeDto> captor = ArgumentCaptor.forClass(ProgrammeDto.class);
        verify(programmeService).create(captor.capture());
        assertThat(captor.getValue().getObjet()).isEqualTo("Nouveau");
        assertThat(captor.getValue().getDateDebut()).hasToString("2026-01-01");
        assertThat(captor.getValue().getBudgetEstime()).isEqualTo(250000.0);
    }

    @Test
    @WithMockUser(authorities = "PROGRAMME_VIEW")
    void create_sansPermissionCreate_retourne403() throws Exception {
        mockMvc.perform(post("/api/programmes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"objet\": \"X\"}"))
                .andExpect(status().isForbidden());

        verify(programmeService, never()).create(any());
    }

    // =========================================================
    //  PUT /api/programmes/{id}
    // =========================================================

    @Test
    @WithMockUser(authorities = "PROGRAMME_EDIT")
    void update_retourne200EtAppelleLeServiceAvecLeBonId() throws Exception {
        UUID id = UUID.randomUUID();
        when(programmeService.update(eq(id), any(ProgrammeDto.class))).thenReturn(programmeDto("Modifie"));

        mockMvc.perform(put("/api/programmes/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"objet\": \"Modifie\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.objet").value("Modifie"));

        verify(programmeService).update(eq(id), any(ProgrammeDto.class));
    }

    // =========================================================
    //  DELETE /api/programmes/{id}
    // =========================================================

    @Test
    @WithMockUser(authorities = "PROGRAMME_DELETE")
    void delete_retourne204() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/programmes/{id}", id))
                .andExpect(status().isNoContent());

        verify(programmeService).delete(id);
    }

    @Test
    @WithMockUser(authorities = "PROGRAMME_VIEW")
    void delete_sansPermissionDelete_retourne403EtNeSupprimeRien() throws Exception {
        mockMvc.perform(delete("/api/programmes/{id}", UUID.randomUUID()))
                .andExpect(status().isForbidden());

        verify(programmeService, never()).delete(any());
    }
}
