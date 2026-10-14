package com.arepo.serveur.service;

import com.arepo.serveur.dto.CommuneDto;
import com.arepo.serveur.model.Commune;
import com.arepo.serveur.repository.CommuneRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommuneServiceTest {

    @Mock
    private CommuneRepository communeRepository;

    @InjectMocks
    private CommuneService communeService;

    private Commune commune(String nom) {
        Commune commune = new Commune();
        commune.setNom(nom);
        return commune;
    }

    @Test
    void findAll_trieParNomSansTenirCompteDesMajuscules() {
        // Mixed case on purpose: a normal sort would put "Oujda" before "berkane"
        when(communeRepository.findAll())
                .thenReturn(List.of(commune("Oujda"), commune("berkane"), commune("Ahfir"), commune("nador")));

        List<CommuneDto> result = communeService.findAll();

        assertThat(result).extracting(CommuneDto::getNom)
                .containsExactly("Ahfir", "berkane", "nador", "Oujda");
    }

    @Test
    void findAll_aucuneCommune_retourneListeVide() {
        when(communeRepository.findAll()).thenReturn(List.of());

        assertThat(communeService.findAll()).isEmpty();
    }
}
