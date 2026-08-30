package com.arepo.serveur.repository;

import com.arepo.serveur.model.Commune;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CommuneRepository extends JpaRepository<Commune, UUID> {
    boolean existsByNomIgnoreCaseAndPrefecture_IdPrefecture(String nom, UUID idPrefecture);
    boolean existsByNomIgnoreCaseAndPrefecture_IdPrefectureAndIdCommuneNot(String nom, UUID idPrefecture, UUID idCommune);
}