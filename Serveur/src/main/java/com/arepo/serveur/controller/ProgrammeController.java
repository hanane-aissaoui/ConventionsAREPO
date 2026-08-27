package com.arepo.serveur.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.arepo.serveur.dto.ProgrammeDto;
import com.arepo.serveur.service.ProgrammeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@CrossOrigin(originPatterns = "http://localhost:*", allowCredentials = "true")
@RestController
@RequestMapping("/api/programmes")
public class ProgrammeController {
    @Autowired
    public ProgrammeService programmeService;
    
    @GetMapping
    public Page<ProgrammeDto> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String objet) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateUpdate").descending());
        return programmeService.findAll(pageable, objet);
    }

    @GetMapping("/{id}")
    public ProgrammeDto getById(@PathVariable UUID id) {
        return programmeService.findById(id);
    }

    @PostMapping
    public ResponseEntity<ProgrammeDto> create(@RequestBody ProgrammeDto request) {
        return ResponseEntity.status(201).body(programmeService.create(request));
    }

    @PutMapping("/{id}")
    public ProgrammeDto update(@PathVariable UUID id, @RequestBody ProgrammeDto request) {
        return programmeService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        programmeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
