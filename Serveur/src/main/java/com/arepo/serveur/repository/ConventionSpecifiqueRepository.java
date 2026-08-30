package com.arepo.serveur.repository;

import com.arepo.serveur.model.ConventionSpecifique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ConventionSpecifiqueRepository extends JpaRepository<ConventionSpecifique, UUID> {
    List<ConventionSpecifique> findByProjet_IdProjet(UUID idProjet);
}
