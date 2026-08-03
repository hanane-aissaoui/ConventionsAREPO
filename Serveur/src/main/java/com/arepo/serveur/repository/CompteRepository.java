package com.arepo.serveur.repository;

import com.arepo.serveur.model.Compte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompteRepository extends JpaRepository<Compte, Integer> {

    Optional<Compte> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<Compte> findByAgent_IdAgent(UUID idAgent);
}