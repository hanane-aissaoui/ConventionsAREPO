package com.arepo.serveur.repository;

import com.arepo.serveur.model.Commune;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CommuneRepository extends JpaRepository<Commune, UUID> {
    List<Commune> findByPrefecture_IdPrefecture(UUID idPrefecture);
}
