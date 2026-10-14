package com.arepo.serveur.service;

import com.arepo.serveur.dto.MarcheDto;
import com.arepo.serveur.exception.ResourceNotFoundException;
import com.arepo.serveur.model.Enums;
import com.arepo.serveur.model.Marche;
import com.arepo.serveur.model.Projet;
import com.arepo.serveur.repository.MarcheRepository;
import com.arepo.serveur.repository.ProjetRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MarcheServiceTest {

    @Mock
    private MarcheRepository marcheRepository;

    @Mock
    private ProjetRepository projetRepository;

    @InjectMocks
    private MarcheService marcheService;

    // MarcheDto.fromEntity reads marche.getProjet().getIdProjet(),
    // so every Marche in our tests needs a projet.
    private Projet projetExemple(UUID idProjet) {
        Projet projet = new Projet();
        projet.setIdProjet(idProjet);
        return projet;
    }

    private Marche marcheExemple() {
        Marche marche = new Marche();
        marche.setTypeAction(Enums.TypeAction.ETUDES);
        marche.setProjet(projetExemple(UUID.randomUUID()));
        return marche;
    }

    private MarcheDto requestExemple(UUID idProjet) {
        MarcheDto request = new MarcheDto();
        request.setTypeAction("TRAVAUX");
        request.setAttributaireRealisateur("Entreprise BTP");
        request.setMontantEngage(500_000.0);
        request.setAvancementPhysique(40);
        request.setAvancementFinancier(30);
        request.setEstimation(600_000.0);
        request.setDateDebut(LocalDate.of(2026, 3, 1));
        request.setDateFin(LocalDate.of(2026, 9, 30));
        request.setIdProjet(idProjet);
        return request;
    }

    // =========================================================
    //  findAll / findByProjetId
    // =========================================================

    @Test
    void findAll_retourneTousLesMarches() {
        when(marcheRepository.findAll()).thenReturn(List.of(marcheExemple(), marcheExemple()));

        assertThat(marcheService.findAll()).hasSize(2);
    }

    @Test
    void findByProjetId_retourneLesMarchesDuProjet() {
        UUID idProjet = UUID.randomUUID();
        Marche marche = marcheExemple();
        marche.setProjet(projetExemple(idProjet));
        when(marcheRepository.findByProjet_IdProjet(idProjet)).thenReturn(List.of(marche));

        List<MarcheDto> result = marcheService.findByProjetId(idProjet);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getIdProjet()).isEqualTo(idProjet);
        assertThat(result.get(0).getTypeAction()).isEqualTo("ETUDES");
    }

    // =========================================================
    //  create
    // =========================================================

    @Test
    void create_copieTousLesChampsEtLieLeProjet() {
        UUID idProjet = UUID.randomUUID();
        Projet projet = projetExemple(idProjet);
        when(projetRepository.findById(idProjet)).thenReturn(Optional.of(projet));
        when(marcheRepository.save(any(Marche.class))).thenAnswer(inv -> inv.getArgument(0));

        MarcheDto result = marcheService.create(requestExemple(idProjet));

        ArgumentCaptor<Marche> captor = ArgumentCaptor.forClass(Marche.class);
        verify(marcheRepository).save(captor.capture());
        Marche saved = captor.getValue();

        // The String "TRAVAUX" was converted into the enum value
        assertThat(saved.getTypeAction()).isEqualTo(Enums.TypeAction.TRAVAUX);
        assertThat(saved.getAttributaireRealisateur()).isEqualTo("Entreprise BTP");
        assertThat(saved.getMontantEngage()).isEqualTo(500_000.0);
        assertThat(saved.getAvancementPhysique()).isEqualTo(40);
        assertThat(saved.getAvancementFinancier()).isEqualTo(30);
        assertThat(saved.getEstimation()).isEqualTo(600_000.0);
        assertThat(saved.getDateDebut()).isEqualTo(LocalDate.of(2026, 3, 1));
        assertThat(saved.getDateFin()).isEqualTo(LocalDate.of(2026, 9, 30));
        assertThat(saved.getProjet()).isSameAs(projet);

        assertThat(result.getTypeAction()).isEqualTo("TRAVAUX");
        assertThat(result.getIdProjet()).isEqualTo(idProjet);
    }

    // @ParameterizedTest runs the same test several times with different values:
    // here null, "" and "   " -> all must be rejected.
    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   "})
    void create_typeActionManquant_lanceIllegalArgumentEtNeSauvegardePas(String typeAction) {
        MarcheDto request = requestExemple(UUID.randomUUID());
        request.setTypeAction(typeAction);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> marcheService.create(request));
        assertThat(ex.getMessage()).isEqualTo("Le type d'action est requis.");

        // Validation happens before anything else: no database call at all
        verifyNoInteractions(projetRepository);
        verify(marcheRepository, never()).save(any());
    }

    @ParameterizedTest
    @ValueSource(strings = {"PEINTURE", "travaux"}) // unknown value, and wrong case
    void create_typeActionInvalide_lanceIllegalArgumentEtNeSauvegardePas(String typeAction) {
        MarcheDto request = requestExemple(UUID.randomUUID());
        request.setTypeAction(typeAction);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> marcheService.create(request));
        assertThat(ex.getMessage()).isEqualTo("Type d'action invalide : " + typeAction);
        verify(marcheRepository, never()).save(any());
    }

    @Test
    void create_projetInexistant_lanceResourceNotFoundEtNeSauvegardePas() {
        UUID idProjet = UUID.randomUUID();
        when(projetRepository.findById(idProjet)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> marcheService.create(requestExemple(idProjet)));
        assertThat(ex.getMessage()).contains("Projet introuvable");
        verify(marcheRepository, never()).save(any());
    }

    // =========================================================
    //  update
    // =========================================================

    @Test
    void update_marcheExiste_modifieLeMemeObjet() {
        UUID id = UUID.randomUUID();
        UUID idProjet = UUID.randomUUID();
        Marche existant = marcheExemple();
        when(marcheRepository.findById(id)).thenReturn(Optional.of(existant));
        when(projetRepository.findById(idProjet)).thenReturn(Optional.of(projetExemple(idProjet)));
        when(marcheRepository.save(any(Marche.class))).thenAnswer(inv -> inv.getArgument(0));

        marcheService.update(id, requestExemple(idProjet));

        verify(marcheRepository).save(existant);
        assertThat(existant.getTypeAction()).isEqualTo(Enums.TypeAction.TRAVAUX);
        assertThat(existant.getProjet().getIdProjet()).isEqualTo(idProjet);
    }

    @Test
    void update_marcheInexistant_lanceExceptionEtNeSauvegardePas() {
        UUID id = UUID.randomUUID();
        when(marcheRepository.findById(id)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> marcheService.update(id, requestExemple(UUID.randomUUID())));
        assertThat(ex.getMessage()).contains("Marché introuvable");
        verify(marcheRepository, never()).save(any());
    }

    // =========================================================
    //  delete
    // =========================================================

    @Test
    void delete_marcheExiste_leSupprime() {
        UUID id = UUID.randomUUID();
        Marche marche = marcheExemple();
        when(marcheRepository.findById(id)).thenReturn(Optional.of(marche));

        marcheService.delete(id);

        verify(marcheRepository).delete(marche);
    }

    @Test
    void delete_marcheInexistant_lanceExceptionEtNeSupprimeRien() {
        UUID id = UUID.randomUUID();
        when(marcheRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> marcheService.delete(id));
        verify(marcheRepository, never()).delete(any());
    }
}
