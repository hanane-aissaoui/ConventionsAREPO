package com.arepo.serveur.repository;

import com.arepo.serveur.model.Programme;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProgrammeRepository extends JpaRepository<Programme, UUID> {

    Page<Programme> findByObjetContainingIgnoreCase(String objet, Pageable pageable);
<<<<<<< HEAD
=======

>>>>>>> e44b437 (ajout sidebar,programme,programme detail)
}
