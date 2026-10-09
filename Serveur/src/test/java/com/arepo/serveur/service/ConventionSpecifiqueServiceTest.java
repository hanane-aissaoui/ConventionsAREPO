package com.arepo.serveur.service;

import com.arepo.serveur.dto.ConventionSpecifiqueDto;
import com.arepo.serveur.exception.ResourceNotFoundException;
import com.arepo.serveur.model.ConventionSpecifique;
import com.arepo.serveur.model.Partenaire;
import com.arepo.serveur.model.Projet;
import com.arepo.serveur.repository.ConventionSpecifiqueRepository;
import com.arepo.serveur.repository.PartenaireRepository;
import com.arepo.serveur.repository.ProjetRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
class ConventionSpecifiqueServiceTest {

    @Mock
    private ConventionSpecifiqueRepository conventionSpecifiqueRepository;

    @Mock
    private PartenaireRepository partenaireRepository;

    @Mock
    private ProjetRepository projetRepository;

    @InjectMocks
    private ConventionSpecifiqueService conventionSpecifiqueService;

    private Partenaire partenaireExemple(UUID id) {
        Partenaire partenaire = new Partenaire();
        partenaire.setIdPartenaire(id);
        return partenaire;
    }

    private Projet projetExemple(UUID id) {
        Projet projet = new Projet();
        projet.setIdProjet(id);
        return projet;
    }

    private ConventionSpecifique conventionExemple() {
        ConventionSpecifique convention = new ConventionSpecifique();
        convention.setEtatConvention("EN_COURS");
        convention.setPartenaire(partenaireExemple(UUID.randomUUID()));
        convention.setProjet(projetExemple(UUID.randomUUID()));
        return convention;
    }

    private ConventionSpecifiqueDto requestExemple(UUID idPartenaire, UUID idProjet) {
        ConventionSpecifiqueDto request = new ConventionSpecifiqueDto();
        request.setMontantContribution(300_000.0);
        request.setMontantDebloque(100_000.0);
        request.setEtatConvention("SIGNEE");
        request.setDateParticipation(LocalDate.of(2026, 6, 1));
        request.setIdPartenaire(idPartenaire);
        request.setIdProjet(idProjet);
        return request;
    }

    // =========================================================
    //  findAll / findByProjetId
    // =========================================================

    @Test
    void findAll_retourneToutesLesConventions() {
        when(conventionSpecifiqueRepository.findAll()).thenReturn(List.of(conventionExemple()));

        assertThat(conventionSpecifiqueService.findAll()).hasSize(1);
    }

    @Test
    void findByProjetId_retourneLesConventionsDuProjet() {
        UUID idProjet = UUID.randomUUID();
        ConventionSpecifique convention = conventionExemple();
        convention.setProjet(projetExemple(idProjet));
        when(conventionSpecifiqueRepository.findByProjet_IdProjet(idProjet)).thenReturn(List.of(convention));

        List<ConventionSpecifiqueDto> result = conventionSpecifiqueService.findByProjetId(idProjet);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getIdProjet()).isEqualTo(idProjet);
    }

    // =========================================================
    //  create
    // =========================================================

    @Test
    void create_copieLesChampsEtLiePartenaireEtProjet() {
        UUID idPartenaire = UUID.randomUUID();
        UUID idProjet = UUID.randomUUID();
        Partenaire partenaire = partenaireExemple(idPartenaire);
        Projet projet = projetExemple(idProjet);
        when(partenaireRepository.findById(idPartenaire)).thenReturn(Optional.of(partenaire));
        when(projetRepository.findById(idProjet)).thenReturn(Optional.of(projet));
        when(conventionSpecifiqueRepository.save(any(ConventionSpecifique.class))).thenAnswer(inv -> inv.getArgument(0));

        ConventionSpecifiqueDto result = conventionSpecifiqueService.create(requestExemple(idPartenaire, idProjet));

        ArgumentCaptor<ConventionSpecifique> captor = ArgumentCaptor.forClass(ConventionSpecifique.class);
        verify(conventionSpecifiqueRepository).save(captor.capture());
        ConventionSpecifique saved = captor.getValue();

        assertThat(saved.getMontantContribution()).isEqualTo(300_000.0);
        assertThat(saved.getMontantDebloque()).isEqualTo(100_000.0);
        assertThat(saved.getEtatConvention()).isEqualTo("SIGNEE");
        assertThat(saved.getDateParticipation()).isEqualTo(LocalDate.of(2026, 6, 1));
        assertThat(saved.getPartenaire()).isSameAs(partenaire);
        assertThat(saved.getProjet()).isSameAs(projet);

        assertThat(result.getIdProjet()).isEqualTo(idProjet);
    }

    @Test
    void create_partenaireInexistant_lanceExceptionEtNeSauvegardePas() {
        UUID idPartenaire = UUID.randomUUID();
        when(partenaireRepository.findById(idPartenaire)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> conventionSpecifiqueService.create(requestExemple(idPartenaire, UUID.randomUUID())));
        assertThat(ex.getMessage()).contains("Partenaire introuvable");
        verify(conventionSpecifiqueRepository, never()).save(any());
    }

    @Test
    void create_projetInexistant_lanceExceptionEtNeSauvegardePas() {
        UUID idPartenaire = UUID.randomUUID();
        UUID idProjet = UUID.randomUUID();
        when(partenaireRepository.findById(idPartenaire)).thenReturn(Optional.of(partenaireExemple(idPartenaire)));
        when(projetRepository.findById(idProjet)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> conventionSpecifiqueService.create(requestExemple(idPartenaire, idProjet)));
        assertThat(ex.getMessage()).contains("Projet introuvable");
        verify(conventionSpecifiqueRepository, never()).save(any());
    }

    // =========================================================
    //  update
    // =========================================================

    @Test
    void update_conventionExiste_modifieLeMemeObjet() {
        UUID id = UUID.randomUUID();
        UUID idPartenaire = UUID.randomUUID();
        UUID idProjet = UUID.randomUUID();
        ConventionSpecifique existant = conventionExemple();
        when(conventionSpecifiqueRepository.findById(id)).thenReturn(Optional.of(existant));
        when(partenaireRepository.findById(idPartenaire)).thenReturn(Optional.of(partenaireExemple(idPartenaire)));
        when(projetRepository.findById(idProjet)).thenReturn(Optional.of(projetExemple(idProjet)));
        when(conventionSpecifiqueRepository.save(any(ConventionSpecifique.class))).thenAnswer(inv -> inv.getArgument(0));

        conventionSpecifiqueService.update(id, requestExemple(idPartenaire, idProjet));

        verify(conventionSpecifiqueRepository).save(existant);
        assertThat(existant.getEtatConvention()).isEqualTo("SIGNEE");
        assertThat(existant.getProjet().getIdProjet()).isEqualTo(idProjet);
    }

    @Test
    void update_conventionInexistante_lanceExceptionEtNeSauvegardePas() {
        UUID id = UUID.randomUUID();
        when(conventionSpecifiqueRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> conventionSpecifiqueService.update(id, requestExemple(UUID.randomUUID(), UUID.randomUUID())));
        verify(conventionSpecifiqueRepository, never()).save(any());
    }

    // =========================================================
    //  delete
    // =========================================================

    @Test
    void delete_conventionExiste_laSupprime() {
        UUID id = UUID.randomUUID();
        ConventionSpecifique convention = conventionExemple();
        when(conventionSpecifiqueRepository.findById(id)).thenReturn(Optional.of(convention));

        conventionSpecifiqueService.delete(id);

        verify(conventionSpecifiqueRepository).delete(convention);
    }

    @Test
    void delete_conventionInexistante_lanceExceptionEtNeSupprimeRien() {
        UUID id = UUID.randomUUID();
        when(conventionSpecifiqueRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> conventionSpecifiqueService.delete(id));
        verify(conventionSpecifiqueRepository, never()).delete(any());
    }
}
