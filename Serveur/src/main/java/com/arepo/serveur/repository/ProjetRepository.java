package com.arepo.serveur.repository;

import com.arepo.serveur.model.Projet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.UUID;

@Repository
public interface ProjetRepository extends JpaRepository<Projet, UUID> {

    Page<Projet> findByNomContainingIgnoreCase(String nom, Pageable pageable);
}
