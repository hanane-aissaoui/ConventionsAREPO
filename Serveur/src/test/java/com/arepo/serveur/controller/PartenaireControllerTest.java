package com.arepo.serveur.controller;

import com.arepo.serveur.config.SecurityConfig;
import com.arepo.serveur.dto.PartenaireDto;
import com.arepo.serveur.exception.ResourceNotFoundException;
import com.arepo.serveur.exception.RestAccessDeniedHandler;
import com.arepo.serveur.exception.RestAuthenticationEntryPoint;
import com.arepo.serveur.security.CustomUserDetailsService;
import com.arepo.serveur.security.JwtService;
import com.arepo.serveur.service.PartenaireService;
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

@WebMvcTest(PartenaireController.class)
@Import({SecurityConfig.class, RestAuthenticationEntryPoint.class, RestAccessDeniedHandler.class})
class PartenaireControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PartenaireService partenaireService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private DaoAuthenticationProvider authenticationProvider;

    private PartenaireDto partenaireDto(String nom) {
        PartenaireDto dto = new PartenaireDto();
        dto.setNom(nom);
        return dto;
    }

    // =========================================================
    //  GET
    // =========================================================

    @Test
    @WithMockUser(authorities = "PARTENAIRE_VIEW")
    void getAll_retourneLaListe() throws Exception {
        when(partenaireService.findAll()).thenReturn(List.of(partenaireDto("A"), partenaireDto("B")));

        mockMvc.perform(get("/api/partenaires"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].nom").value("A"));
    }

    @Test
    @WithMockUser(authorities = "PARTENAIRE_VIEW")
    void getById_retourne200EtLePartenaire() throws Exception {
        UUID id = UUID.randomUUID();
        when(partenaireService.findById(id)).thenReturn(partenaireDto("ONEE"));

        mockMvc.perform(get("/api/partenaires/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("ONEE"));
    }

    @Test
    @WithMockUser(authorities = "PARTENAIRE_VIEW")
    void getById_partenaireInexistant_retourne404() throws Exception {
        UUID id = UUID.randomUUID();
        when(partenaireService.findById(id)).thenThrow(new ResourceNotFoundException("Partenaire introuvable"));

        mockMvc.perform(get("/api/partenaires/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(authorities = "PROJET_VIEW")
    void getAll_sansPermissionPartenaire_retourne403() throws Exception {
        mockMvc.perform(get("/api/partenaires"))
                .andExpect(status().isForbidden());
    }

    // =========================================================
    //  POST
    // =========================================================

    @Test
    @WithMockUser(authorities = "PARTENAIRE_MANAGE")
    void create_retourne201EtConvertitLeJson() throws Exception {
        when(partenaireService.create(any(PartenaireDto.class))).thenReturn(partenaireDto("ONEE"));

        String json = """
                {
                  "nom": "ONEE",
                  "telephone": "0536000000",
                  "email": "contact@onee.ma"
                }
                """;

        mockMvc.perform(post("/api/partenaires")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nom").value("ONEE"));

        ArgumentCaptor<PartenaireDto> captor = ArgumentCaptor.forClass(PartenaireDto.class);
        verify(partenaireService).create(captor.capture());
        assertThat(captor.getValue().getTelephone()).isEqualTo("0536000000");
        assertThat(captor.getValue().getEmail()).isEqualTo("contact@onee.ma");
    }

    @Test
    @WithMockUser(authorities = "PARTENAIRE_VIEW")
    void create_avecSeulementView_retourne403() throws Exception {
        mockMvc.perform(post("/api/partenaires")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nom\": \"X\"}"))
                .andExpect(status().isForbidden());

        verify(partenaireService, never()).create(any());
    }

    // =========================================================
    //  PUT / DELETE
    // =========================================================

    @Test
    @WithMockUser(authorities = "PARTENAIRE_MANAGE")
    void update_retourne200() throws Exception {
        UUID id = UUID.randomUUID();
        when(partenaireService.update(eq(id), any(PartenaireDto.class))).thenReturn(partenaireDto("Modifie"));

        mockMvc.perform(put("/api/partenaires/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nom\": \"Modifie\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("Modifie"));
    }

    @Test
    @WithMockUser(authorities = "PARTENAIRE_MANAGE")
    void delete_retourne204() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/partenaires/{id}", id))
                .andExpect(status().isNoContent());

        verify(partenaireService).delete(id);
    }
}
