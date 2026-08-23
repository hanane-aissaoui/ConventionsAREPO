package com.arepo.serveur.service;

import com.arepo.serveur.dto.ProgrammeDto;
import com.arepo.serveur.exception.ResourceNotFoundException;
import com.arepo.serveur.model.Programme;
import com.arepo.serveur.repository.ProgrammeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class ProgrammeService {
    @Autowired
    public ProgrammeRepository programmeRepository;
    
    public Page<ProgrammeDto> findAll(Pageable pageable, String objet) {
        Page<Programme> programmes = (objet == null || objet.isBlank())
                ? programmeRepository.findAll(pageable)
                : programmeRepository.findByObjetContainingIgnoreCase(objet, pageable);

        return programmes.map(ProgrammeDto::fromEntity);
    }
   
    public ProgrammeDto findById(UUID id) {
        return ProgrammeDto.fromEntity(getOrThrow(id));
    }

    public ProgrammeDto create(ProgrammeDto request) {
        Programme programme = new Programme();
        applyRequest(programme, request);
        return ProgrammeDto.fromEntity(programmeRepository.save(programme));
    }

    public ProgrammeDto update(UUID id, ProgrammeDto request) {
        Programme programme = getOrThrow(id);
        applyRequest(programme, request);
        return ProgrammeDto.fromEntity(programmeRepository.save(programme));
    }

    public void delete(UUID id) {
        programmeRepository.delete(getOrThrow(id));
    }

    private void applyRequest(Programme programme, ProgrammeDto request) {
        programme.setObjet(request.getObjet());
        programme.setDateDebut(request.getDateDebut());
        programme.setDateFin(request.getDateFin());
        programme.setBudgetEstime(request.getBudgetEstime());
    }

    private Programme getOrThrow(UUID id) {
        return programmeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programme introuvable : " + id));
    }
}
