package com.arepo.serveur.controller;

import com.arepo.serveur.service.ProjetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.arepo.serveur.dto.ProjetDto;
import com.arepo.serveur.dto.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;



@CrossOrigin(originPatterns = "http://localhost:*", allowCredentials = "true")
@RestController
@RequestMapping("/api/projets")
public class ProjetController {

  @Autowired
    public  ProjetService projetService;

    // Liste paginee
    @GetMapping
    public PageResponse<ProjetDto> getPage(
            @RequestParam(required = false, defaultValue = "") String search,
            Pageable pageable
    ) {

        return projetService.findPage(search, pageable);
    }



}
