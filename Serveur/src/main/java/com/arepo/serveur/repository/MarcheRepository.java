package com.arepo.serveur.repository;

import com.arepo.serveur.model.Marche;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MarcheRepository extends JpaRepository<Marche, UUID> {
    List<Marche> findByProjet_IdProjet(UUID idProjet);
}
