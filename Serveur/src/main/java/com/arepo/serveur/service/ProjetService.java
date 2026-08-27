package com.arepo.serveur.service;

import com.arepo.serveur.dto.ProjetDto;
import com.arepo.serveur.dto.PageResponse;
import com.arepo.serveur.model.Commune;
import com.arepo.serveur.model.Programme;
import com.arepo.serveur.model.Projet;
import com.arepo.serveur.repository.CommuneRepository;
import com.arepo.serveur.repository.ProgrammeRepository;
import com.arepo.serveur.repository.ProjetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ProjetService {

    @Autowired
    private  ProjetRepository projetRepository;

    @Autowired
    private ProgrammeRepository programmeRepository;

    @Autowired
    private CommuneRepository communeRepository;

    public PageResponse<ProjetDto> findPage(String search, Pageable pageable) {
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "dateCreation")
        );

        Page<Projet> result = (search == null || search.isBlank())
                ? projetRepository.findAll(sortedPageable)
                : projetRepository.search(search, sortedPageable);
        return PageResponse.from(result.map(ProjetDto::fromEntity));
    }

    public ProjetDto findById(UUID id) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet introuvable : " + id));
        return ProjetDto.fromEntityDetail(projet);
    }


    public ProjetDto create(ProjetDto request) {
        Projet projet = new Projet();
        applyRequest(projet, request);
        return ProjetDto.fromEntity(projetRepository.save(projet));
    }

    public ProjetDto update(UUID id, ProjetDto request) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet introuvable : " + id));
        applyRequest(projet, request);
        return ProjetDto.fromEntity(projetRepository.save(projet));
    }

    public void delete(UUID id) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet introuvable : " + id));
        projetRepository.delete(projet);
    }
    private void applyRequest(Projet projet, ProjetDto request) {
        projet.setNom(request.getNom());
        projet.setDateDebut(request.getDateDebut());
        projet.setDateFin(request.getDateFin());
        projet.setBudgetEstime(request.getBudgetEstime());
        projet.setStatut(request.getStatut());

        Programme programme = programmeRepository.findById(request.getIdProgramme())
                .orElseThrow(() -> new RuntimeException("Programme introuvable : " + request.getIdProgramme()));
        projet.setProgramme(programme);

        Commune commune = communeRepository.findById(request.getIdCommune())
                .orElseThrow(() -> new RuntimeException("Commune introuvable : " + request.getIdCommune()));
        projet.setCommune(commune);
    }
    public List<ProjetDto> findByProgramme(UUID idProgramme) {
        return projetRepository.findByProgrammeIdProgramme(idProgramme)
                .stream()
                .map(ProjetDto::fromEntity)
                .toList();
    }
}

