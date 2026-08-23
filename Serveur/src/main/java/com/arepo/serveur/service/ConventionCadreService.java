package com.arepo.serveur.service;

import com.arepo.serveur.dto.ConventionCadreDto;
import com.arepo.serveur.exception.ResourceNotFoundException;
import com.arepo.serveur.model.ConventionCadre;
import com.arepo.serveur.model.Partenaire;
import com.arepo.serveur.model.Programme;
import com.arepo.serveur.repository.ConventionCadreRepository;
import com.arepo.serveur.repository.PartenaireRepository;
import com.arepo.serveur.repository.ProgrammeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ConventionCadreService {
    @Autowired
    public ConventionCadreRepository conventionCadreRepository;
    @Autowired
    public PartenaireRepository partenaireRepository;
    @Autowired
    public ProgrammeRepository programmeRepository;

    public List<ConventionCadreDto> findAll() {
        return conventionCadreRepository.findAll().stream().map(ConventionCadreDto::fromEntity).toList();
    }

    public ConventionCadreDto create(ConventionCadreDto request) {
        ConventionCadre convention = new ConventionCadre();
        applyRequest(convention, request);
        return ConventionCadreDto.fromEntity(conventionCadreRepository.save(convention));
    }

    public ConventionCadreDto update(UUID id, ConventionCadreDto request) {
        ConventionCadre convention = getOrThrow(id);
        applyRequest(convention, request);
        return ConventionCadreDto.fromEntity(conventionCadreRepository.save(convention));
    }

    public void delete(UUID id) {
        conventionCadreRepository.delete(getOrThrow(id));
    }

    private void applyRequest(ConventionCadre convention, ConventionCadreDto request) {
        convention.setMontantContribution(request.getMontantContribution());
        convention.setMontantDebloque(request.getMontantDebloque());
        convention.setEtatConvention(request.getEtatConvention());
        convention.setDateParticipation(request.getDateParticipation());

        Partenaire partenaire = partenaireRepository.findById(request.getIdPartenaire())
                .orElseThrow(() -> new ResourceNotFoundException("Partenaire introuvable : " + request.getIdPartenaire()));
        convention.setPartenaire(partenaire);

        Programme programme = programmeRepository.findById(request.getIdProgramme())
                .orElseThrow(() -> new ResourceNotFoundException("Programme introuvable : " + request.getIdProgramme()));
        convention.setProgramme(programme);
    }

    private ConventionCadre getOrThrow(UUID id) {
        return conventionCadreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ConventionCadre introuvable : " + id));
    }
    public List<ConventionCadreDto> findByProgrammeId(UUID idProgramme) {
        return conventionCadreRepository.findByProgramme_IdProgramme(idProgramme)
                .stream()
                .map(ConventionCadreDto::fromEntity)
                .toList();
    }
}
