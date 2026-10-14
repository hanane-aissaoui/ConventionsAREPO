package com.arepo.serveur.controller;

import com.arepo.serveur.dto.ConventionSpecifiqueDto;
import com.arepo.serveur.service.ConventionSpecifiqueService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin(originPatterns = "http://localhost:*", allowCredentials = "true")
@RestController
@RequestMapping("/api/conventions-specifiques")
public class ConventionSpecifiqueController {

    private final ConventionSpecifiqueService conventionSpecifiqueService;

    public ConventionSpecifiqueController(ConventionSpecifiqueService conventionSpecifiqueService) {
        this.conventionSpecifiqueService = conventionSpecifiqueService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('CONVENTION_VIEW')")
    public List<ConventionSpecifiqueDto> getAll() {
        return conventionSpecifiqueService.findAll();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CONVENTION_CREATE')")
    public ResponseEntity<ConventionSpecifiqueDto> create(@RequestBody ConventionSpecifiqueDto request) {
        return ResponseEntity.status(201).body(conventionSpecifiqueService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CONVENTION_EDIT')")
    public ConventionSpecifiqueDto update(@PathVariable UUID id, @RequestBody ConventionSpecifiqueDto request) {
        return conventionSpecifiqueService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CONVENTION_DELETE')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        conventionSpecifiqueService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/projet/{idProjet}")
    @PreAuthorize("hasAuthority('CONVENTION_VIEW')")
    public List<ConventionSpecifiqueDto> getByProjet(@PathVariable UUID idProjet) {
        return conventionSpecifiqueService.findByProjetId(idProjet);
    }
}
