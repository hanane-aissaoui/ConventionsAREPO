package com.arepo.serveur.repository;

import com.arepo.serveur.model.PrefectureProvince;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PrefectureProvinceRepository extends JpaRepository<PrefectureProvince, UUID> {
    boolean existsByNomIgnoreCaseAndRegion_IdRegion(String nom, UUID idRegion);
    boolean existsByNomIgnoreCaseAndRegion_IdRegionAndIdPrefectureNot(String nom, UUID idRegion, UUID idPrefecture);
}