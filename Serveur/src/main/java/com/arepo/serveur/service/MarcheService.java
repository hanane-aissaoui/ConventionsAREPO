package com.arepo.serveur.service;

import com.arepo.serveur.dto.MarcheDto;
import com.arepo.serveur.exception.ResourceNotFoundException;
import com.arepo.serveur.model.Enums;
import com.arepo.serveur.model.Marche;
import com.arepo.serveur.model.Projet;
import com.arepo.serveur.repository.MarcheRepository;
import com.arepo.serveur.repository.ProjetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class MarcheService {
    @Autowired
    public MarcheRepository marcheRepository;
    @Autowired
    public ProjetRepository projetRepository;

    public List<MarcheDto> findAll() {
        return marcheRepository.findAll().stream().map(MarcheDto::fromEntity).toList();
    }

    public List<MarcheDto> findByProjetId(UUID idProjet) {
        return marcheRepository.findByProjet_IdProjet(idProjet)
                .stream()
                .map(MarcheDto::fromEntity)
                .toList();
    }

    public MarcheDto create(MarcheDto request) {
        Marche marche = new Marche();
        applyRequest(marche, request);
        return MarcheDto.fromEntity(marcheRepository.save(marche));
    }

    public MarcheDto update(UUID id, MarcheDto request) {
        Marche marche = getOrThrow(id);
        applyRequest(marche, request);
        return MarcheDto.fromEntity(marcheRepository.save(marche));
    }

    public void delete(UUID id) {
        marcheRepository.delete(getOrThrow(id));
    }

    private void applyRequest(Marche marche, MarcheDto request) {
        if (request.getTypeAction() == null || request.getTypeAction().isBlank()) {
            throw new IllegalArgumentException("Le type d'action est requis.");
        }
        Enums.TypeAction typeAction;
        try {
            typeAction = Enums.TypeAction.valueOf(request.getTypeAction());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Type d'action invalide : " + request.getTypeAction());
        }
        marche.setTypeAction(typeAction);
        marche.setAttributaireRealisateur(request.getAttributaireRealisateur());
        marche.setMontantEngage(request.getMontantEngage());
        marche.setAvancementPhysique(request.getAvancementPhysique());
        marche.setAvancementFinancier(request.getAvancementFinancier());
        marche.setEstimation(request.getEstimation());
        marche.setDateDebut(request.getDateDebut());
        marche.setDateFin(request.getDateFin());

        Projet projet = projetRepository.findById(request.getIdProjet())
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable : " + request.getIdProjet()));
        marche.setProjet(projet);
    }

    private Marche getOrThrow(UUID id) {
        return marcheRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marché introuvable : " + id));
    }
}
