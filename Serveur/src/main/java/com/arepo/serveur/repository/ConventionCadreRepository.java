package com.arepo.serveur.repository;

import com.arepo.serveur.model.ConventionCadre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ConventionCadreRepository extends JpaRepository<ConventionCadre, UUID> {
    List<ConventionCadre> findByProgramme_IdProgramme(UUID idProgramme);
}
