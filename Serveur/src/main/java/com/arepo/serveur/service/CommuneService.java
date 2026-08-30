package com.arepo.serveur.service;

import com.arepo.serveur.dto.CommuneDto;
import com.arepo.serveur.repository.CommuneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class CommuneService {
    @Autowired
    public CommuneRepository communeRepository;

    public List<CommuneDto> findAll() {
        return communeRepository.findAll().stream()
                .map(CommuneDto::fromEntity)
                .sorted(Comparator.comparing(c -> c.nom, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }
}
