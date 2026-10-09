package com.arepo.serveur.controller;

import com.arepo.serveur.config.SecurityConfig;
import com.arepo.serveur.exception.RestAccessDeniedHandler;
import com.arepo.serveur.exception.RestAuthenticationEntryPoint;
import com.arepo.serveur.model.Commune;
import com.arepo.serveur.model.PrefectureProvince;
import com.arepo.serveur.model.Region;
import com.arepo.serveur.repository.CommuneRepository;
import com.arepo.serveur.repository.PrefectureProvinceRepository;
import com.arepo.serveur.repository.RegionRepository;
import com.arepo.serveur.security.CustomUserDetailsService;
import com.arepo.serveur.security.JwtService;
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
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// TerritoireController has no service: it uses the 3 repositories directly, so we mock them.
@WebMvcTest(TerritoireController.class)
@Import({SecurityConfig.class, RestAuthenticationEntryPoint.class, RestAccessDeniedHandler.class})
class TerritoireControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RegionRepository regionRepository;

    @MockitoBean
    private PrefectureProvinceRepository prefectureRepository;

    @MockitoBean
    private CommuneRepository communeRepository;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private DaoAuthenticationProvider authenticationProvider;

    // ---- small builders ----

    private Region region(String nom) {
        Region region = new Region();
        region.setIdRegion(UUID.randomUUID());
        region.setNom(nom);
        return region;
    }

    private PrefectureProvince prefecture(String nom, Region region) {
        PrefectureProvince prefecture = new PrefectureProvince();
        prefecture.setIdPrefecture(UUID.randomUUID());
        prefecture.setNom(nom);
        prefecture.setRegion(region);
        region.getPrefectures().add(prefecture);
        return prefecture;
    }

    private Commune commune(String nom, PrefectureProvince prefecture) {
        Commune commune = new Commune();
        commune.setIdCommune(UUID.randomUUID());
        commune.setNom(nom);
        commune.setPrefecture(prefecture);
        prefecture.getCommunes().add(commune);
        return commune;
    }

    // ---- fake save() that gives an id, like the real database would ----

    private void saveRegionDonneUnId() {
        when(regionRepository.save(any(Region.class))).thenAnswer(inv -> {
            Region r = inv.getArgument(0);
            if (r.getIdRegion() == null) r.setIdRegion(UUID.randomUUID());
            return r;
        });
    }

    private void savePrefectureDonneUnId() {
        when(prefectureRepository.save(any(PrefectureProvince.class))).thenAnswer(inv -> {
            PrefectureProvince p = inv.getArgument(0);
            if (p.getIdPrefecture() == null) p.setIdPrefecture(UUID.randomUUID());
            return p;
        });
    }

    private void saveCommuneDonneUnId() {
        when(communeRepository.save(any(Commune.class))).thenAnswer(inv -> {
            Commune c = inv.getArgument(0);
            if (c.getIdCommune() == null) c.setIdCommune(UUID.randomUUID());
            return c;
        });
    }

    // =========================================================
    //  GET /api/territoire/hierarchie
    // =========================================================

    @Test
    @WithMockUser(authorities = "TERRITOIRE_VIEW")
    void hierarchie_construitLArbreRegionPrefectureCommune() throws Exception {
        Region oriental = region("Oriental");
        PrefectureProvince oujda = prefecture("Oujda-Angad", oriental);
        commune("Oujda", oujda);
        commune("Bni Drar", oujda);
        prefecture("Berkane", oriental);
        when(regionRepository.findAll()).thenReturn(List.of(oriental));

        mockMvc.perform(get("/api/territoire/hierarchie"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(oriental.getIdRegion().toString()))
                .andExpect(jsonPath("$[0].nom").value("Oriental"))
                .andExpect(jsonPath("$[0].enfants.length()").value(2))
                .andExpect(jsonPath("$[0].enfants[0].nom").value("Oujda-Angad"))
                .andExpect(jsonPath("$[0].enfants[0].enfants.length()").value(2))
                .andExpect(jsonPath("$[0].enfants[0].enfants[1].nom").value("Bni Drar"))
                // A commune is a leaf: empty children list
                .andExpect(jsonPath("$[0].enfants[0].enfants[0].enfants.length()").value(0))
                .andExpect(jsonPath("$[0].enfants[1].enfants.length()").value(0));
    }

    @Test
    @WithMockUser(authorities = "PROJET_VIEW")
    void hierarchie_sansPermissionTerritoire_retourne403() throws Exception {
        mockMvc.perform(get("/api/territoire/hierarchie"))
                .andExpect(status().isForbidden());
    }

    // =========================================================
    //  Region
    // =========================================================

    @Test
    @WithMockUser(authorities = "TERRITOIRE_MANAGE")
    void createRegion_nomLibre_sauvegardeEtRetourneLeNoeud() throws Exception {
        when(regionRepository.existsByNomIgnoreCase("Oriental")).thenReturn(false);
        saveRegionDonneUnId();

        mockMvc.perform(post("/api/territoire/regions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nom\": \"Oriental\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("Oriental"))
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.enfants.length()").value(0));

        verify(regionRepository).save(any(Region.class));
    }

    @Test
    @WithMockUser(authorities = "TERRITOIRE_MANAGE")
    void createRegion_nomDejaPris_retourne400EtNeSauvegardePas() throws Exception {
        when(regionRepository.existsByNomIgnoreCase("Oriental")).thenReturn(true);

        mockMvc.perform(post("/api/territoire/regions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nom\": \"Oriental\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Une région avec ce nom existe déjà."));

        verify(regionRepository, never()).save(any());
    }

    @Test
    @WithMockUser(authorities = "TERRITOIRE_VIEW")
    void createRegion_avecSeulementView_retourne403() throws Exception {
        mockMvc.perform(post("/api/territoire/regions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nom\": \"X\"}"))
                .andExpect(status().isForbidden());

        verify(regionRepository, never()).save(any());
    }

    @Test
    @WithMockUser(authorities = "TERRITOIRE_MANAGE")
    void updateRegion_renommeLaRegion() throws Exception {
        Region region = region("Ancien nom");
        when(regionRepository.findById(region.getIdRegion())).thenReturn(Optional.of(region));
        saveRegionDonneUnId();

        mockMvc.perform(put("/api/territoire/regions/{id}", region.getIdRegion())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nom\": \"Nouveau nom\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("Nouveau nom"));

        verify(regionRepository).save(region);
        assertThat(region.getNom()).isEqualTo("Nouveau nom");
    }

    @Test
    @WithMockUser(authorities = "TERRITOIRE_MANAGE")
    void updateRegion_inexistante_retourne404() throws Exception {
        UUID id = UUID.randomUUID();
        when(regionRepository.findById(id)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/territoire/regions/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nom\": \"X\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(authorities = "TERRITOIRE_MANAGE")
    void createCommune_prefectureInexistante_retourne404EtNeSauvegardePas() throws Exception {
        UUID prefectureId = UUID.randomUUID();
        when(prefectureRepository.findById(prefectureId)).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/territoire/prefectures/{prefectureId}/communes", prefectureId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nom\": \"Oujda\"}"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Préfecture/Province introuvable"));

        verify(communeRepository, never()).save(any());
    }

    @Test
    @WithMockUser(authorities = "TERRITOIRE_MANAGE")
    void deleteRegion_retourne204() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/territoire/regions/{id}", id))
                .andExpect(status().isNoContent());

        verify(regionRepository).deleteById(id);
    }

    // =========================================================
    //  PrefectureProvince
    // =========================================================

    @Test
    @WithMockUser(authorities = "TERRITOIRE_MANAGE")
    void createPrefecture_estLieeALaRegion() throws Exception {
        Region region = region("Oriental");
        when(regionRepository.findById(region.getIdRegion())).thenReturn(Optional.of(region));
        savePrefectureDonneUnId();

        mockMvc.perform(post("/api/territoire/regions/{regionId}/prefectures", region.getIdRegion())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nom\": \"Berkane\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("Berkane"));

        ArgumentCaptor<PrefectureProvince> captor = ArgumentCaptor.forClass(PrefectureProvince.class);
        verify(prefectureRepository).save(captor.capture());
        assertThat(captor.getValue().getRegion()).isSameAs(region);
    }

    @Test
    @WithMockUser(authorities = "TERRITOIRE_MANAGE")
    void updatePrefecture_renommeLaPrefecture() throws Exception {
        PrefectureProvince prefecture = prefecture("Ancien", region("Oriental"));
        when(prefectureRepository.findById(prefecture.getIdPrefecture())).thenReturn(Optional.of(prefecture));
        savePrefectureDonneUnId();

        mockMvc.perform(put("/api/territoire/prefectures/{id}", prefecture.getIdPrefecture())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nom\": \"Nador\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("Nador"));

        assertThat(prefecture.getNom()).isEqualTo("Nador");
    }

    @Test
    @WithMockUser(authorities = "TERRITOIRE_MANAGE")
    void deletePrefecture_retourne204() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/territoire/prefectures/{id}", id))
                .andExpect(status().isNoContent());

        verify(prefectureRepository).deleteById(id);
    }

    // =========================================================
    //  Commune
    // =========================================================

    @Test
    @WithMockUser(authorities = "TERRITOIRE_MANAGE")
    void createCommune_estLieeALaPrefecture() throws Exception {
        PrefectureProvince prefecture = prefecture("Oujda-Angad", region("Oriental"));
        when(prefectureRepository.findById(prefecture.getIdPrefecture())).thenReturn(Optional.of(prefecture));
        saveCommuneDonneUnId();

        mockMvc.perform(post("/api/territoire/prefectures/{prefectureId}/communes", prefecture.getIdPrefecture())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nom\": \"Oujda\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("Oujda"))
                .andExpect(jsonPath("$.enfants.length()").value(0));

        ArgumentCaptor<Commune> captor = ArgumentCaptor.forClass(Commune.class);
        verify(communeRepository).save(captor.capture());
        assertThat(captor.getValue().getPrefecture()).isSameAs(prefecture);
    }

    @Test
    @WithMockUser(authorities = "TERRITOIRE_MANAGE")
    void updateCommune_renommeLaCommune() throws Exception {
        Commune commune = commune("Ancien", prefecture("Oujda-Angad", region("Oriental")));
        when(communeRepository.findById(commune.getIdCommune())).thenReturn(Optional.of(commune));
        saveCommuneDonneUnId();

        mockMvc.perform(put("/api/territoire/communes/{id}", commune.getIdCommune())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nom\": \"Ahfir\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("Ahfir"));

        assertThat(commune.getNom()).isEqualTo("Ahfir");
    }

    @Test
    @WithMockUser(authorities = "TERRITOIRE_MANAGE")
    void deleteCommune_retourne204() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/territoire/communes/{id}", id))
                .andExpect(status().isNoContent());

        verify(communeRepository).deleteById(id);
    }

    @Test
    @WithMockUser(authorities = "TERRITOIRE_VIEW")
    void deleteCommune_avecSeulementView_retourne403() throws Exception {
        mockMvc.perform(delete("/api/territoire/communes/{id}", UUID.randomUUID()))
                .andExpect(status().isForbidden());

        verify(communeRepository, never()).deleteById(any());
    }
}
