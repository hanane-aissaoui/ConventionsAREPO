package com.arepo.serveur.service;

import com.arepo.serveur.dto.PartenaireDto;
import com.arepo.serveur.exception.ResourceNotFoundException;
import com.arepo.serveur.model.Partenaire;
import com.arepo.serveur.repository.PartenaireRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PartenaireService {
    @Autowired
    public PartenaireRepository partenaireRepository;



    public List<PartenaireDto> findAll() {
        return partenaireRepository.findAll().stream().map(PartenaireDto::fromEntity).toList();
    }



    public PartenaireDto findById(UUID id) {
        return PartenaireDto.fromEntity(getOrThrow(id));
    }

    public PartenaireDto create(PartenaireDto request) {
        Partenaire partenaire = new Partenaire();
        applyRequest(partenaire, request);
        return PartenaireDto.fromEntity(partenaireRepository.save(partenaire));
    }

    public PartenaireDto update(UUID id, PartenaireDto request) {
        Partenaire partenaire = getOrThrow(id);
        applyRequest(partenaire, request);
        return PartenaireDto.fromEntity(partenaireRepository.save(partenaire));
    }

    public void delete(UUID id) {
        partenaireRepository.delete(getOrThrow(id));
    }

    private void applyRequest(Partenaire partenaire, PartenaireDto request) {
        partenaire.setNom(request.getNom());
        partenaire.setCode(request.getCode());
    }

    private Partenaire getOrThrow(UUID id) {
        return partenaireRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partenaire introuvable : " + id));
    }
}
