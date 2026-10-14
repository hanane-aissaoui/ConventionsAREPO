package com.arepo.serveur.service;

import com.arepo.serveur.dto.PartenaireDto;
import com.arepo.serveur.exception.ResourceNotFoundException;
import com.arepo.serveur.model.Partenaire;
import com.arepo.serveur.repository.PartenaireRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PartenaireServiceTest {

    @Mock
    private PartenaireRepository partenaireRepository;

    @InjectMocks
    private PartenaireService partenaireService;

    private Partenaire partenaireExemple(String nom) {
        Partenaire partenaire = new Partenaire();
        partenaire.setNom(nom);
        return partenaire;
    }

    private PartenaireDto requestExemple() {
        PartenaireDto request = new PartenaireDto();
        request.setNom("ONEE");
        request.setTelephone("0536000000");
        request.setEmail("contact@onee.ma");
        return request;
    }

    // =========================================================
    //  findAll / findById
    // =========================================================

    @Test
    void findAll_retourneTousLesPartenaires() {
        when(partenaireRepository.findAll())
                .thenReturn(List.of(partenaireExemple("A"), partenaireExemple("B")));

        List<PartenaireDto> result = partenaireService.findAll();

        assertThat(result).extracting(PartenaireDto::getNom).containsExactly("A", "B");
    }

    @Test
    void findById_partenaireExiste_retourneLeDto() {
        UUID id = UUID.randomUUID();
        when(partenaireRepository.findById(id)).thenReturn(Optional.of(partenaireExemple("ONEE")));

        assertThat(partenaireService.findById(id).getNom()).isEqualTo("ONEE");
    }

    @Test
    void findById_partenaireInexistant_lanceResourceNotFound() {
        UUID id = UUID.randomUUID();
        when(partenaireRepository.findById(id)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> partenaireService.findById(id));
        assertThat(ex.getMessage()).contains("Partenaire introuvable");
    }

    // =========================================================
    //  create
    // =========================================================

    @Test
    void create_copieNomTelephoneEmailEtSauvegarde() {
        when(partenaireRepository.save(any(Partenaire.class))).thenAnswer(inv -> inv.getArgument(0));

        PartenaireDto result = partenaireService.create(requestExemple());

        ArgumentCaptor<Partenaire> captor = ArgumentCaptor.forClass(Partenaire.class);
        verify(partenaireRepository).save(captor.capture());
        Partenaire saved = captor.getValue();

        assertThat(saved.getNom()).isEqualTo("ONEE");
        assertThat(saved.getTelephone()).isEqualTo("0536000000");
        assertThat(saved.getEmail()).isEqualTo("contact@onee.ma");
        assertThat(result.getEmail()).isEqualTo("contact@onee.ma");
    }

    // =========================================================
    //  update
    // =========================================================

    @Test
    void update_partenaireExiste_modifieLeMemeObjet() {
        UUID id = UUID.randomUUID();
        Partenaire existant = partenaireExemple("Ancien nom");
        when(partenaireRepository.findById(id)).thenReturn(Optional.of(existant));
        when(partenaireRepository.save(any(Partenaire.class))).thenAnswer(inv -> inv.getArgument(0));

        partenaireService.update(id, requestExemple());

        verify(partenaireRepository).save(existant);
        assertThat(existant.getNom()).isEqualTo("ONEE");
    }

    @Test
    void update_partenaireInexistant_lanceExceptionEtNeSauvegardePas() {
        UUID id = UUID.randomUUID();
        when(partenaireRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> partenaireService.update(id, requestExemple()));
        verify(partenaireRepository, never()).save(any());
    }

    // =========================================================
    //  delete
    // =========================================================

    @Test
    void delete_partenaireExiste_leSupprime() {
        UUID id = UUID.randomUUID();
        Partenaire partenaire = partenaireExemple("A");
        when(partenaireRepository.findById(id)).thenReturn(Optional.of(partenaire));

        partenaireService.delete(id);

        verify(partenaireRepository).delete(partenaire);
    }

    @Test
    void delete_partenaireInexistant_lanceExceptionEtNeSupprimeRien() {
        UUID id = UUID.randomUUID();
        when(partenaireRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> partenaireService.delete(id));
        verify(partenaireRepository, never()).delete(any());
    }
}
