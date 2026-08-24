package com.arepo.serveur.controller;

import com.arepo.serveur.dto.CommuneDto;
import com.arepo.serveur.service.CommuneService;
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

    @GetMapping
    public List<CommuneDto> getAll() {
        return communeService.findAll();
    }
}
