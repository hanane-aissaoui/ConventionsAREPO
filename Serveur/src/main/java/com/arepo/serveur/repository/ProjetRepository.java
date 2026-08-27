package com.arepo.serveur.repository;

import com.arepo.serveur.model.Projet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.UUID;

@Repository
public interface ProjetRepository extends JpaRepository<Projet, UUID> {
    List<Projet> findByProgramme_IdProgramme(UUID idProgramme);

    @Query("SELECT p FROM Projet p WHERE " +
            "LOWER(p.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.programme.objet) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.commune.prefecture.nom) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Projet> search(@Param("search") String search, Pageable pageable);
    List<Projet> findByProgrammeIdProgramme(UUID idProgramme);
}
