package com.arepo.serveur.repository;

import com.arepo.serveur.model.Region;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RegionRepository extends JpaRepository<Region, UUID> {
    boolean existsByNomIgnoreCaseAndIdRegionNot(String nom, UUID idRegion);
    boolean existsByNomIgnoreCase(String nom);
}