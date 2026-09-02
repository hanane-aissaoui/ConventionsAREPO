package com.arepo.serveur.controller;

import com.arepo.serveur.service.ProjetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.arepo.serveur.dto.ProjetDto;
import com.arepo.serveur.dto.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;


@CrossOrigin(originPatterns = "http://localhost:*", allowCredentials = "true")
@RestController
@RequestMapping("/api/projets")
public class ProjetController {

  @Autowired
  public ProjetService projetService;

  @GetMapping
  @PreAuthorize("hasAuthority('PROJET_VIEW')")
  public PageResponse<ProjetDto> getPage(
          @RequestParam(required = false, defaultValue = "") String search,
          Pageable pageable
  ) {
    return projetService.findPage(search, pageable);
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAuthority('PROJET_VIEW')")
  public ProjetDto getById(@PathVariable UUID id) {
    return projetService.findById(id);
  }

  @GetMapping("/programme/{idProgramme}")
  @PreAuthorize("hasAuthority('PROJET_VIEW')")
  public List<ProjetDto> getByProgramme(@PathVariable UUID idProgramme) {
    return projetService.findByProgramme(idProgramme);
  }

  @PostMapping
  @PreAuthorize("hasAuthority('PROJET_CREATE')")
  public ResponseEntity<ProjetDto> create(@RequestBody ProjetDto request) {
    return ResponseEntity.status(201).body(projetService.create(request));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAuthority('PROJET_EDIT')")
  public ProjetDto update(@PathVariable UUID id, @RequestBody ProjetDto request) {
    return projetService.update(id, request);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasAuthority('PROJET_DELETE')")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    projetService.delete(id);
    return ResponseEntity.noContent().build();
  }
}