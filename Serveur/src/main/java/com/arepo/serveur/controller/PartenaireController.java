package com.arepo.serveur.controller;

import com.arepo.serveur.dto.PartenaireDto;
import com.arepo.serveur.service.PartenaireService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin(originPatterns = "http://localhost:*", allowCredentials = "true")
@RestController
@RequestMapping("/api/partenaires")
public class PartenaireController {

    private final PartenaireService partenaireService;

    public PartenaireController(PartenaireService partenaireService) {
        this.partenaireService = partenaireService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PARTENAIRE_VIEW')")
    public List<PartenaireDto> getAll() {
        return partenaireService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PARTENAIRE_VIEW')")
    public PartenaireDto getById(@PathVariable UUID id) {
        return partenaireService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PARTENAIRE_MANAGE')")
    public ResponseEntity<PartenaireDto> create(@RequestBody PartenaireDto request) {
        return ResponseEntity.status(201).body(partenaireService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PARTENAIRE_MANAGE')")
    public PartenaireDto update(@PathVariable UUID id, @RequestBody PartenaireDto request) {
        return partenaireService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PARTENAIRE_MANAGE')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        partenaireService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
