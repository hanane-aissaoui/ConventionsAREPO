package com.arepo.serveur.service;

import com.arepo.serveur.dto.ProjetDto;
import com.arepo.serveur.dto.PageResponse;
import com.arepo.serveur.model.Projet;
import com.arepo.serveur.repository.ProjetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProjetService {

    @Autowired
    private  ProjetRepository projetRepository;


    public PageResponse<ProjetDto> findPage(String search, Pageable pageable) {
        Page<Projet> result = (search == null || search.isBlank())
                ? projetRepository.findAll(pageable)
                : projetRepository.findByNomContainingIgnoreCase(search, pageable);
        return PageResponse.from(result.map(ProjetDto::fromEntity));
    }


}
