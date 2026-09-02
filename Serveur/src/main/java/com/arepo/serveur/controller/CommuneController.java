package com.arepo.serveur.controller;

import com.arepo.serveur.dto.CommuneDto;
import com.arepo.serveur.service.CommuneService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(originPatterns = "http://localhost:*", allowCredentials = "true")
@RestController
@RequestMapping("/api/communes")
public class CommuneController {

    private final CommuneService communeService;

    public CommuneController(CommuneService communeService) {
        this.communeService = communeService;
    }

    // Lecture seule, utilisée pour peupler les <select> de communes dans les formulaires.
    @GetMapping
    @PreAuthorize("hasAuthority('TERRITOIRE_VIEW')")
    public List<CommuneDto> getAll() {
        return communeService.findAll();
    }
}
