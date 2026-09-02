package com.arepo.serveur.controller;

import com.arepo.serveur.dto.ConventionCadreDto;
import com.arepo.serveur.service.ConventionCadreService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin(originPatterns = "http://localhost:*", allowCredentials = "true")
@RestController
@RequestMapping("/api/conventions-cadre")
public class ConventionCadreController {

    private final ConventionCadreService conventionCadreService;

    public ConventionCadreController(ConventionCadreService conventionCadreService) {
        this.conventionCadreService = conventionCadreService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('CONVENTION_VIEW')")
    public List<ConventionCadreDto> getAll() {
        return conventionCadreService.findAll();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CONVENTION_CREATE')")
    public ResponseEntity<ConventionCadreDto> create(@RequestBody ConventionCadreDto request) {
        return ResponseEntity.status(201).body(conventionCadreService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CONVENTION_EDIT')")
    public ConventionCadreDto update(@PathVariable UUID id, @RequestBody ConventionCadreDto request) {
        return conventionCadreService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CONVENTION_DELETE')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        conventionCadreService.delete(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/programme/{idProgramme}")
    @PreAuthorize("hasAuthority('CONVENTION_VIEW')")
    public List<ConventionCadreDto> getByProgramme(@PathVariable UUID idProgramme) {
        return conventionCadreService.findByProgrammeId(idProgramme);
    }
}
