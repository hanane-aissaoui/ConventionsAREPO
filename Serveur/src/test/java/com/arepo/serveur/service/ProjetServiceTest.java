package com.arepo.serveur.service;

import com.arepo.serveur.dto.PageResponse;
import com.arepo.serveur.dto.ProjetDto;
import com.arepo.serveur.model.Commune;
import com.arepo.serveur.model.PrefectureProvince;
import com.arepo.serveur.model.Programme;
import com.arepo.serveur.model.Projet;
import com.arepo.serveur.repository.CommuneRepository;
import com.arepo.serveur.repository.ProgrammeRepository;
import com.arepo.serveur.repository.ProjetRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// Turns on Mockito for this class (no Spring, no database: very fast)
@ExtendWith(MockitoExtension.class)
class ProjetServiceTest {

    // ---- The FAKE dependencies (mocks) ----
    @Mock
    private ProjetRepository projetRepository;

    @Mock
    private ProgrammeRepository programmeRepository;

    @Mock
    private CommuneRepository communeRepository;

    // ---- The REAL class we test. Mockito puts the 3 mocks inside it ----
    @InjectMocks
    private ProjetService projetService;

    // Small helper: builds a Projet with its programme and commune,
    // so ProjetDto.fromEntity(...) has everything it needs.
    private Projet projetExemple() {
        Projet projet = new Projet();
        projet.setNom("Projet Test");
        projet.setProgramme(new Programme());
        projet.setCommune(communeExemple());
        return projet;
    }

    // ProjetDto.fromEntity reads commune.getPrefecture(),
    // so our test commune needs a prefecture too.
    private Commune communeExemple() {
        Commune commune = new Commune();
        commune.setPrefecture(new PrefectureProvince());
        return commune;
    }

    // =========================================================
    //  findById
    // =========================================================

    @Test
    void findById_projetExiste_retourneLeProjet() {
        // Arrange
        UUID id = UUID.randomUUID();
        when(projetRepository.findById(id)).thenReturn(Optional.of(projetExemple()));

        // Act
        ProjetDto result = projetService.findById(id);

        // Assert
        assertThat(result.getNom()).isEqualTo("Projet Test");
    }

    @Test
    void findById_projetInexistant_lanceException() {
        // Arrange: the fake repository finds nothing
        UUID id = UUID.randomUUID();
        when(projetRepository.findById(id)).thenReturn(Optional.empty());

        // Act + Assert: we expect an exception with the right message
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> projetService.findById(id));
        assertThat(ex.getMessage()).contains("Projet introuvable");
    }

    // =========================================================
    //  create
    // =========================================================

    @Test
    void create_sauvegardeLeProjetAvecProgrammeEtCommune() {
        // Arrange
        UUID idProgramme = UUID.randomUUID();
        UUID idCommune = UUID.randomUUID();

        ProjetDto request = new ProjetDto();
        request.setNom("Nouveau projet");
        request.setIdProgramme(idProgramme);
        request.setIdCommune(idCommune);

        Programme programme = new Programme();
        Commune commune = communeExemple();
        when(programmeRepository.findById(idProgramme)).thenReturn(Optional.of(programme));
        when(communeRepository.findById(idCommune)).thenReturn(Optional.of(commune));
        // "save" returns exactly the object it receives, like a real database would
        when(projetRepository.save(any(Projet.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        ProjetDto result = projetService.create(request);

        // Assert: we "catch" the Projet that was given to save(...) and inspect it
        ArgumentCaptor<Projet> captor = ArgumentCaptor.forClass(Projet.class);
        verify(projetRepository).save(captor.capture());
        Projet saved = captor.getValue();

        assertThat(saved.getNom()).isEqualTo("Nouveau projet");
        assertThat(saved.getProgramme()).isSameAs(programme);
        assertThat(saved.getCommune()).isSameAs(commune);
        assertThat(result.getNom()).isEqualTo("Nouveau projet");
    }

    @Test
    void create_programmeInexistant_lanceExceptionEtNeSauvegardePas() {
        // Arrange
        UUID idProgramme = UUID.randomUUID();
        ProjetDto request = new ProjetDto();
        request.setNom("Projet sans programme");
        request.setIdProgramme(idProgramme);

        when(programmeRepository.findById(idProgramme)).thenReturn(Optional.empty());

        // Act + Assert
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> projetService.create(request));
        assertThat(ex.getMessage()).contains("Programme introuvable");

        // Very important: nothing must be saved in the database
        verify(projetRepository, never()).save(any());
    }

    @Test
    void create_communeInexistante_lanceExceptionEtNeSauvegardePas() {
        // Arrange
        UUID idProgramme = UUID.randomUUID();
        UUID idCommune = UUID.randomUUID();
        ProjetDto request = new ProjetDto();
        request.setIdProgramme(idProgramme);
        request.setIdCommune(idCommune);

        when(programmeRepository.findById(idProgramme)).thenReturn(Optional.of(new Programme()));
        when(communeRepository.findById(idCommune)).thenReturn(Optional.empty());

        // Act + Assert
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> projetService.create(request));
        assertThat(ex.getMessage()).contains("Commune introuvable");
        verify(projetRepository, never()).save(any());
    }

    // =========================================================
    //  update
    // =========================================================

    @Test
    void update_projetExiste_modifieLeNom() {
        // Arrange: an existing projet called "Ancien nom"
        UUID id = UUID.randomUUID();
        UUID idProgramme = UUID.randomUUID();
        UUID idCommune = UUID.randomUUID();

        Projet existant = projetExemple();
        existant.setNom("Ancien nom");

        ProjetDto request = new ProjetDto();
        request.setNom("Nouveau nom");
        request.setIdProgramme(idProgramme);
        request.setIdCommune(idCommune);

        when(projetRepository.findById(id)).thenReturn(Optional.of(existant));
        when(programmeRepository.findById(idProgramme)).thenReturn(Optional.of(new Programme()));
        when(communeRepository.findById(idCommune)).thenReturn(Optional.of(communeExemple()));
        when(projetRepository.save(any(Projet.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        ProjetDto result = projetService.update(id, request);

        // Assert: the SAME object was modified and saved (no new projet created)
        verify(projetRepository).save(existant);
        assertThat(existant.getNom()).isEqualTo("Nouveau nom");
        assertThat(result.getNom()).isEqualTo("Nouveau nom");
    }

    @Test
    void update_projetInexistant_lanceExceptionEtNeSauvegardePas() {
        UUID id = UUID.randomUUID();
        when(projetRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> projetService.update(id, new ProjetDto()));
        verify(projetRepository, never()).save(any());
    }

    // =========================================================
    //  delete
    // =========================================================

    @Test
    void delete_projetExiste_leSupprime() {
        UUID id = UUID.randomUUID();
        Projet projet = projetExemple();
        when(projetRepository.findById(id)).thenReturn(Optional.of(projet));

        projetService.delete(id);

        // We check that delete(...) was really called with this projet
        verify(projetRepository).delete(projet);
    }

    @Test
    void delete_projetInexistant_lanceExceptionEtNeSupprimeRien() {
        UUID id = UUID.randomUUID();
        when(projetRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> projetService.delete(id));
        verify(projetRepository, never()).delete(any());
    }

    // =========================================================
    //  findPage (the search logic: empty search vs real search)
    // =========================================================

    @Test
    void findPage_rechercheVide_utiliseFindAllOrderByRecent() {
        Pageable pageable = PageRequest.of(0, 10);
        when(projetRepository.findAllOrderByRecent(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(projetExemple())));

        PageResponse<ProjetDto> result = projetService.findPage("   ", pageable);

        assertThat(result).isNotNull();
        verify(projetRepository).findAllOrderByRecent(any(Pageable.class));
        verify(projetRepository, never()).search(any(), any());
    }

    @Test
    void findPage_avecRecherche_utiliseSearch() {
        Pageable pageable = PageRequest.of(0, 10);
        when(projetRepository.search(eq("Oujda"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(projetExemple())));

        PageResponse<ProjetDto> result = projetService.findPage("Oujda", pageable);

        assertThat(result).isNotNull();
        verify(projetRepository).search(eq("Oujda"), any(Pageable.class));
        verify(projetRepository, never()).findAllOrderByRecent(any());
    }

    // =========================================================
    //  findByProgramme
    // =========================================================

    @Test
    void findByProgramme_retourneLesProjetsDuProgramme() {
        UUID idProgramme = UUID.randomUUID();
        when(projetRepository.findByProgrammeIdProgramme(idProgramme))
                .thenReturn(List.of(projetExemple(), projetExemple()));

        List<ProjetDto> result = projetService.findByProgramme(idProgramme);

        assertThat(result).hasSize(2);
    }
}