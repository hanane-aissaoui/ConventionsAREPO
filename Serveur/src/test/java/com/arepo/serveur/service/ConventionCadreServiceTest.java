package com.arepo.serveur.service;

import com.arepo.serveur.dto.ConventionCadreDto;
import com.arepo.serveur.exception.ResourceNotFoundException;
import com.arepo.serveur.model.ConventionCadre;
import com.arepo.serveur.model.Partenaire;
import com.arepo.serveur.model.Programme;
import com.arepo.serveur.repository.ConventionCadreRepository;
import com.arepo.serveur.repository.PartenaireRepository;
import com.arepo.serveur.repository.ProgrammeRepository;
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
class ConventionCadreServiceTest {

    @Mock
    private ConventionCadreRepository conventionCadreRepository;

    @Mock
    private PartenaireRepository partenaireRepository;

    @Mock
    private ProgrammeRepository programmeRepository;

    @InjectMocks
    private ConventionCadreService conventionCadreService;

    private Partenaire partenaireExemple(UUID id) {
        Partenaire partenaire = new Partenaire();
        partenaire.setIdPartenaire(id);
        return partenaire;
    }

    private Programme programmeExemple(UUID id) {
        Programme programme = new Programme();
        programme.setIdProgramme(id);
        return programme;
    }

    // ConventionCadreDto.fromEntity reads partenaire.getId... and programme.getId...
    private ConventionCadre conventionExemple() {
        ConventionCadre convention = new ConventionCadre();
        convention.setEtatConvention("EN_COURS");
        convention.setPartenaire(partenaireExemple(UUID.randomUUID()));
        convention.setProgramme(programmeExemple(UUID.randomUUID()));
        return convention;
    }

    private ConventionCadreDto requestExemple(UUID idPartenaire, UUID idProgramme) {
        ConventionCadreDto request = new ConventionCadreDto();
        request.setMontantContribution(1_000_000.0);
        request.setMontantDebloque(250_000.0);
        request.setEtatConvention("SIGNEE");
        request.setDateParticipation(LocalDate.of(2026, 5, 10));
        request.setIdPartenaire(idPartenaire);
        request.setIdProgramme(idProgramme);
        return request;
    }

    // =========================================================
    //  findAll / findByProgrammeId
    // =========================================================

    @Test
    void findAll_retourneToutesLesConventions() {
        when(conventionCadreRepository.findAll()).thenReturn(List.of(conventionExemple(), conventionExemple()));

        assertThat(conventionCadreService.findAll()).hasSize(2);
    }

    @Test
    void findByProgrammeId_retourneLesConventionsDuProgramme() {
        UUID idProgramme = UUID.randomUUID();
        ConventionCadre convention = conventionExemple();
        convention.setProgramme(programmeExemple(idProgramme));
        when(conventionCadreRepository.findByProgramme_IdProgramme(idProgramme)).thenReturn(List.of(convention));

        List<ConventionCadreDto> result = conventionCadreService.findByProgrammeId(idProgramme);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getIdProgramme()).isEqualTo(idProgramme);
    }

    // =========================================================
    //  create
    // =========================================================

    @Test
    void create_copieLesChampsEtLiePartenaireEtProgramme() {
        UUID idPartenaire = UUID.randomUUID();
        UUID idProgramme = UUID.randomUUID();
        Partenaire partenaire = partenaireExemple(idPartenaire);
        Programme programme = programmeExemple(idProgramme);
        when(partenaireRepository.findById(idPartenaire)).thenReturn(Optional.of(partenaire));
        when(programmeRepository.findById(idProgramme)).thenReturn(Optional.of(programme));
        when(conventionCadreRepository.save(any(ConventionCadre.class))).thenAnswer(inv -> inv.getArgument(0));

        ConventionCadreDto result = conventionCadreService.create(requestExemple(idPartenaire, idProgramme));

        ArgumentCaptor<ConventionCadre> captor = ArgumentCaptor.forClass(ConventionCadre.class);
        verify(conventionCadreRepository).save(captor.capture());
        ConventionCadre saved = captor.getValue();

        assertThat(saved.getMontantContribution()).isEqualTo(1_000_000.0);
        assertThat(saved.getMontantDebloque()).isEqualTo(250_000.0);
        assertThat(saved.getEtatConvention()).isEqualTo("SIGNEE");
        assertThat(saved.getDateParticipation()).isEqualTo(LocalDate.of(2026, 5, 10));
        assertThat(saved.getPartenaire()).isSameAs(partenaire);
        assertThat(saved.getProgramme()).isSameAs(programme);

        assertThat(result.getIdPartenaire()).isEqualTo(idPartenaire);
        assertThat(result.getIdProgramme()).isEqualTo(idProgramme);
    }

    @Test
    void create_partenaireInexistant_lanceExceptionEtNeSauvegardePas() {
        UUID idPartenaire = UUID.randomUUID();
        when(partenaireRepository.findById(idPartenaire)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> conventionCadreService.create(requestExemple(idPartenaire, UUID.randomUUID())));
        assertThat(ex.getMessage()).contains("Partenaire introuvable");
        verify(conventionCadreRepository, never()).save(any());
    }

    @Test
    void create_programmeInexistant_lanceExceptionEtNeSauvegardePas() {
        UUID idPartenaire = UUID.randomUUID();
        UUID idProgramme = UUID.randomUUID();
        when(partenaireRepository.findById(idPartenaire)).thenReturn(Optional.of(partenaireExemple(idPartenaire)));
        when(programmeRepository.findById(idProgramme)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> conventionCadreService.create(requestExemple(idPartenaire, idProgramme)));
        assertThat(ex.getMessage()).contains("Programme introuvable");
        verify(conventionCadreRepository, never()).save(any());
    }

    // =========================================================
    //  update
    // =========================================================

    @Test
    void update_conventionExiste_modifieLeMemeObjet() {
        UUID id = UUID.randomUUID();
        UUID idPartenaire = UUID.randomUUID();
        UUID idProgramme = UUID.randomUUID();
        ConventionCadre existant = conventionExemple();
        when(conventionCadreRepository.findById(id)).thenReturn(Optional.of(existant));
        when(partenaireRepository.findById(idPartenaire)).thenReturn(Optional.of(partenaireExemple(idPartenaire)));
        when(programmeRepository.findById(idProgramme)).thenReturn(Optional.of(programmeExemple(idProgramme)));
        when(conventionCadreRepository.save(any(ConventionCadre.class))).thenAnswer(inv -> inv.getArgument(0));

        conventionCadreService.update(id, requestExemple(idPartenaire, idProgramme));

        verify(conventionCadreRepository).save(existant);
        assertThat(existant.getEtatConvention()).isEqualTo("SIGNEE");
        assertThat(existant.getPartenaire().getIdPartenaire()).isEqualTo(idPartenaire);
    }

    @Test
    void update_conventionInexistante_lanceExceptionEtNeSauvegardePas() {
        UUID id = UUID.randomUUID();
        when(conventionCadreRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> conventionCadreService.update(id, requestExemple(UUID.randomUUID(), UUID.randomUUID())));
        verify(conventionCadreRepository, never()).save(any());
    }

    // =========================================================
    //  delete
    // =========================================================

    @Test
    void delete_conventionExiste_laSupprime() {
        UUID id = UUID.randomUUID();
        ConventionCadre convention = conventionExemple();
        when(conventionCadreRepository.findById(id)).thenReturn(Optional.of(convention));

        conventionCadreService.delete(id);

        verify(conventionCadreRepository).delete(convention);
    }

    @Test
    void delete_conventionInexistante_lanceExceptionEtNeSupprimeRien() {
        UUID id = UUID.randomUUID();
        when(conventionCadreRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> conventionCadreService.delete(id));
        verify(conventionCadreRepository, never()).delete(any());
    }
}
