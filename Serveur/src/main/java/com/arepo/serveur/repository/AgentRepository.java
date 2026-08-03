package com.arepo.serveur.repository;

import com.arepo.serveur.model.Agent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AgentRepository extends JpaRepository<Agent, UUID> {

    Optional<Agent> findByCin(String cin);

    boolean existsByCin(String cin);
}
