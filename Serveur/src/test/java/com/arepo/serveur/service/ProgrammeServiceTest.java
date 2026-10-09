package com.arepo.serveur.service;

import com.arepo.serveur.dto.ProgrammeDto;
import com.arepo.serveur.exception.ResourceNotFoundException;
import com.arepo.serveur.model.Programme;
import com.arepo.serveur.model.Projet;
import com.arepo.serveur.repository.ProgrammeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// Pure unit test: no Spring, no database. Only Mockito.
@ExtendWith(MockitoExtension.class)
class ProgrammeServiceTest {

    @Mock
    private ProgrammeRepository programmeRepository;

    @InjectMocks
    private ProgrammeService programmeService;

    // new Programme() already has empty lists for projets / conventionsCadre,
    // so ProgrammeDto.fromEntity(...) can call .size() on them safely.
    private Programme programmeExemple(String objet) {
        Programme programme = new Programme();
        programme.setObjet(objet);
        return programme;
    }

    private ProgrammeDto requestExemple() {
        ProgrammeDto request = new ProgrammeDto();
        request.setObjet("Programme eau potable");
        request.setDateDebut(LocalDate.of(2026, 1, 1));
        request.setDateFin(LocalDate.of(2027, 12, 31));
        request.setBudgetEstime(1_500_000.0);
        return request;
    }

    // =========================================================
    //  findAll (pagination + search on "objet")
    // =========================================================

    @Test
    void findAll_rechercheNull_utiliseFindAll() {
        Pageable pageable = PageRequest.of(0, 10);
        when(programmeRepository.findAll(pageable))
                .thenReturn(new PageImpl<>(List.of(programmeExemple("A"))));

        Page<ProgrammeDto> result = programmeService.findAll(pageable, null);

        assertThat(result.getContent()).hasSize(1);
        verify(programmeRepository, never()).findByObjetContainingIgnoreCase(any(), any());
    }

    @Test
    void findAll_rechercheVide_utiliseFindAll() {
        Pageable pageable = PageRequest.of(0, 10);
        when(programmeRepository.findAll(pageable))
                .thenReturn(new PageImpl<>(List.of(programmeExemple("A"))));

        programmeService.findAll(pageable, "   ");

        verify(programmeRepository).findAll(pageable);
        verify(programmeRepository, never()).findByObjetContainingIgnoreCase(any(), any());
    }

    @Test
    void findAll_avecRecherche_utiliseFindByObjet() {
        Pageable pageable = PageRequest.of(0, 10);
        when(programmeRepository.findByObjetContainingIgnoreCase("eau", pageable))
                .thenReturn(new PageImpl<>(List.of(programmeExemple("Programme eau potable"))));

        Page<ProgrammeDto> result = programmeService.findAll(pageable, "eau");

        assertThat(result.getContent().get(0).getObjet()).isEqualTo("Programme eau potable");
        verify(programmeRepository, never()).findAll(any(Pageable.class));
    }

    // =========================================================
    //  findAllList (for the <select>)
    // =========================================================

    @Test
    void findAllList_trieParDateDebutDecroissante() {
        when(programmeRepository.findAll(any(Sort.class)))
                .thenReturn(List.of(programmeExemple("A"), programmeExemple("B")));

        List<ProgrammeDto> result = programmeService.findAllList();

        assertThat(result).hasSize(2);
        // We check the exact Sort that was asked to the repository
        verify(programmeRepository).findAll(Sort.by("dateDebut").descending());
    }

    // =========================================================
    //  findById
    // =========================================================

    @Test
    void findById_programmeExiste_retourneLeDtoAvecLesCompteurs() {
        UUID id = UUID.randomUUID();
        Programme programme = programmeExemple("Programme A");
        // 2 projets linked -> nbrProjet must be 2
        programme.getProjets().add(new Projet());
        programme.getProjets().add(new Projet());
        when(programmeRepository.findById(id)).thenReturn(Optional.of(programme));

        ProgrammeDto result = programmeService.findById(id);

        assertThat(result.getObjet()).isEqualTo("Programme A");
        assertThat(result.getNbrProjet()).isEqualTo(2);
        assertThat(result.getNbrPartenaire()).isZero();
    }

    @Test
    void findById_programmeInexistant_lanceResourceNotFound() {
        UUID id = UUID.randomUUID();
        when(programmeRepository.findById(id)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> programmeService.findById(id));
        assertThat(ex.getMessage()).contains("Programme introuvable");
    }

    // =========================================================
    //  create
    // =========================================================

    @Test
    void create_copieTousLesChampsEtSauvegarde() {
        ProgrammeDto request = requestExemple();
        when(programmeRepository.save(any(Programme.class))).thenAnswer(inv -> inv.getArgument(0));

        ProgrammeDto result = programmeService.create(request);

        ArgumentCaptor<Programme> captor = ArgumentCaptor.forClass(Programme.class);
        verify(programmeRepository).save(captor.capture());
        Programme saved = captor.getValue();

        assertThat(saved.getObjet()).isEqualTo("Programme eau potable");
        assertThat(saved.getDateDebut()).isEqualTo(LocalDate.of(2026, 1, 1));
        assertThat(saved.getDateFin()).isEqualTo(LocalDate.of(2027, 12, 31));
        assertThat(saved.getBudgetEstime()).isEqualTo(1_500_000.0);
        assertThat(result.getObjet()).isEqualTo("Programme eau potable");
    }

    // =========================================================
    //  update
    // =========================================================

    @Test
    void update_programmeExiste_modifieLeMemeObjet() {
        UUID id = UUID.randomUUID();
        Programme existant = programmeExemple("Ancien objet");
        when(programmeRepository.findById(id)).thenReturn(Optional.of(existant));
        when(programmeRepository.save(any(Programme.class))).thenAnswer(inv -> inv.getArgument(0));

        ProgrammeDto result = programmeService.update(id, requestExemple());

        // The existing object was modified and saved, no new Programme created
        verify(programmeRepository).save(existant);
        assertThat(existant.getObjet()).isEqualTo("Programme eau potable");
        assertThat(existant.getBudgetEstime()).isEqualTo(1_500_000.0);
        assertThat(result.getObjet()).isEqualTo("Programme eau potable");
    }

    @Test
    void update_programmeInexistant_lanceExceptionEtNeSauvegardePas() {
        UUID id = UUID.randomUUID();
        when(programmeRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> programmeService.update(id, requestExemple()));
        verify(programmeRepository, never()).save(any());
    }

    // =========================================================
    //  delete
    // =========================================================

    @Test
    void delete_programmeExiste_leSupprime() {
        UUID id = UUID.randomUUID();
        Programme programme = programmeExemple("A");
        when(programmeRepository.findById(id)).thenReturn(Optional.of(programme));

        programmeService.delete(id);

        verify(programmeRepository).delete(programme);
    }

    @Test
    void delete_programmeInexistant_lanceExceptionEtNeSupprimeRien() {
        UUID id = UUID.randomUUID();
        when(programmeRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> programmeService.delete(id));
        verify(programmeRepository, never()).delete(any());
    }
}
