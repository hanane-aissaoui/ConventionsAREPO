package com.arepo.serveur.service;

import com.arepo.serveur.dto.ConventionSpecifiqueDto;
import com.arepo.serveur.exception.ResourceNotFoundException;
import com.arepo.serveur.model.ConventionSpecifique;
import com.arepo.serveur.model.Partenaire;
import com.arepo.serveur.model.Projet;
import com.arepo.serveur.repository.ConventionSpecifiqueRepository;
import com.arepo.serveur.repository.PartenaireRepository;
import com.arepo.serveur.repository.ProjetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ConventionSpecifiqueService {
    @Autowired
    public ConventionSpecifiqueRepository conventionSpecifiqueRepository;
    @Autowired
    public PartenaireRepository partenaireRepository;
    @Autowired
    public ProjetRepository projetRepository;

    public List<ConventionSpecifiqueDto> findAll() {
        return conventionSpecifiqueRepository.findAll().stream().map(ConventionSpecifiqueDto::fromEntity).toList();
    }

    public ConventionSpecifiqueDto create(ConventionSpecifiqueDto request) {
        ConventionSpecifique convention = new ConventionSpecifique();
        applyRequest(convention, request);
        return ConventionSpecifiqueDto.fromEntity(conventionSpecifiqueRepository.save(convention));
    }

    public ConventionSpecifiqueDto update(UUID id, ConventionSpecifiqueDto request) {
        ConventionSpecifique convention = getOrThrow(id);
        applyRequest(convention, request);
        return ConventionSpecifiqueDto.fromEntity(conventionSpecifiqueRepository.save(convention));
    }

    public void delete(UUID id) {
        conventionSpecifiqueRepository.delete(getOrThrow(id));
    }

    private void applyRequest(ConventionSpecifique convention, ConventionSpecifiqueDto request) {
        convention.setMontantContribution(request.getMontantContribution());
        convention.setMontantDebloque(request.getMontantDebloque());
        convention.setEtatConvention(request.getEtatConvention());
        convention.setDateParticipation(request.getDateParticipation());

        Partenaire partenaire = partenaireRepository.findById(request.getIdPartenaire())
                .orElseThrow(() -> new ResourceNotFoundException("Partenaire introuvable : " + request.getIdPartenaire()));
        convention.setPartenaire(partenaire);

        Projet projet = projetRepository.findById(request.getIdProjet())
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable : " + request.getIdProjet()));
        convention.setProjet(projet);
    }

    private ConventionSpecifique getOrThrow(UUID id) {
        return conventionSpecifiqueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ConventionSpecifique introuvable : " + id));
    }

    public List<ConventionSpecifiqueDto> findByProjetId(UUID idProjet) {
        return conventionSpecifiqueRepository.findByProjet_IdProjet(idProjet)
                .stream()
                .map(ConventionSpecifiqueDto::fromEntity)
                .toList();
    }
}
