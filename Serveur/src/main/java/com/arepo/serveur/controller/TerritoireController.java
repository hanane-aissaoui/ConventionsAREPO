package com.arepo.serveur.controller;

import com.arepo.serveur.dto.NomRequest;
import com.arepo.serveur.dto.TerritoireNodeDto;
import com.arepo.serveur.model.Commune;
import com.arepo.serveur.model.PrefectureProvince;
import com.arepo.serveur.model.Region;
import com.arepo.serveur.repository.CommuneRepository;
import com.arepo.serveur.repository.PrefectureProvinceRepository;
import com.arepo.serveur.repository.RegionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin
@RestController
@RequestMapping("/api/territoire")
public class TerritoireController {
    @Autowired
    public RegionRepository regionRepository;
    @Autowired
    public PrefectureProvinceRepository prefectureRepository;
    @Autowired
    public CommuneRepository communeRepository;

    @GetMapping("/hierarchie")
    public List<TerritoireNodeDto> hierarchie() {
        return regionRepository.findAll().stream()
                .map(this::regionToDto)
                .toList();
    }

    // ---- Region ----

    @PostMapping("/regions")
    public ResponseEntity<TerritoireNodeDto> createRegion(@RequestBody NomRequest request) {
        Region region = new Region();
        region.setNom(request.getNom());
        regionRepository.save(region);
        return ResponseEntity.ok(regionToDto(region));
    }

    @PutMapping("/regions/{id}")
    public ResponseEntity<TerritoireNodeDto> updateRegion(@PathVariable UUID id, @RequestBody NomRequest request) {
        Region region = regionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Région introuvable"));
        region.setNom(request.getNom());
        regionRepository.save(region);
        return ResponseEntity.ok(regionToDto(region));
    }

    @DeleteMapping("/regions/{id}")
    public ResponseEntity<Void> deleteRegion(@PathVariable UUID id) {
        regionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ---- PrefectureProvince ----

    @PostMapping("/regions/{regionId}/prefectures")
    public ResponseEntity<TerritoireNodeDto> createPrefecture(@PathVariable UUID regionId, @RequestBody NomRequest request) {
        Region region = regionRepository.findById(regionId)
                .orElseThrow(() -> new RuntimeException("Région introuvable"));
        PrefectureProvince prefecture = new PrefectureProvince();
        prefecture.setNom(request.getNom());
        prefecture.setRegion(region);
        prefectureRepository.save(prefecture);
        return ResponseEntity.ok(prefectureToDto(prefecture));
    }

    @PutMapping("/prefectures/{id}")
    public ResponseEntity<TerritoireNodeDto> updatePrefecture(@PathVariable UUID id, @RequestBody NomRequest request) {
        PrefectureProvince prefecture = prefectureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Préfecture/Province introuvable"));
        prefecture.setNom(request.getNom());
        prefectureRepository.save(prefecture);
        return ResponseEntity.ok(prefectureToDto(prefecture));
    }

    @DeleteMapping("/prefectures/{id}")
    public ResponseEntity<Void> deletePrefecture(@PathVariable UUID id) {
        prefectureRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Commune ----

    @PostMapping("/prefectures/{prefectureId}/communes")
    public ResponseEntity<TerritoireNodeDto> createCommune(@PathVariable UUID prefectureId, @RequestBody NomRequest request) {
        PrefectureProvince prefecture = prefectureRepository.findById(prefectureId)
                .orElseThrow(() -> new RuntimeException("Préfecture/Province introuvable"));
        Commune commune = new Commune();
        commune.setNom(request.getNom());
        commune.setPrefecture(prefecture);
        communeRepository.save(commune);
        return ResponseEntity.ok(communeToDto(commune));
    }

    @PutMapping("/communes/{id}")
    public ResponseEntity<TerritoireNodeDto> updateCommune(@PathVariable UUID id, @RequestBody NomRequest request) {
        Commune commune = communeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commune introuvable"));
        commune.setNom(request.getNom());
        communeRepository.save(commune);
        return ResponseEntity.ok(communeToDto(commune));
    }

    @DeleteMapping("/communes/{id}")
    public ResponseEntity<Void> deleteCommune(@PathVariable UUID id) {
        communeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ---- mapping ----

    private TerritoireNodeDto regionToDto(Region region) {
        List<TerritoireNodeDto> prefectures = region.getPrefectures().stream()
                .map(this::prefectureToDto)
                .toList();
        return new TerritoireNodeDto(region.getIdRegion().toString(), region.getNom(), prefectures);
    }

    private TerritoireNodeDto prefectureToDto(PrefectureProvince prefecture) {
        List<TerritoireNodeDto> communes = prefecture.getCommunes().stream()
                .map(this::communeToDto)
                .toList();
        return new TerritoireNodeDto(prefecture.getIdPrefecture().toString(), prefecture.getNom(), communes);
    }

    private TerritoireNodeDto communeToDto(Commune commune) {
        return new TerritoireNodeDto(commune.getIdCommune().toString(), commune.getNom(), List.of());
    }
}