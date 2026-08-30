package com.arepo.serveur.controller;

import com.arepo.serveur.dto.MarcheDto;
import com.arepo.serveur.service.MarcheService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin(originPatterns = "http://localhost:*", allowCredentials = "true")
@RestController
@RequestMapping("/api/marches")
public class MarcheController {

    private final MarcheService marcheService;

    public MarcheController(MarcheService marcheService) {
        this.marcheService = marcheService;
    }

    @GetMapping
    public List<MarcheDto> getAll() {
        return marcheService.findAll();
    }

    @PostMapping
    public ResponseEntity<MarcheDto> create(@RequestBody MarcheDto request) {
        return ResponseEntity.status(201).body(marcheService.create(request));
    }

    @PutMapping("/{id}")
    public MarcheDto update(@PathVariable UUID id, @RequestBody MarcheDto request) {
        return marcheService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        marcheService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/projet/{idProjet}")
    public List<MarcheDto> getByProjet(@PathVariable UUID idProjet) {
        return marcheService.findByProjetId(idProjet);
    }
}
