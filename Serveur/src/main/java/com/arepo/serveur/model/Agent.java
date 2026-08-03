package com.arepo.serveur.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "agent")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Agent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_agent")
    private UUID idAgent;

    @Column(name = "nom_agent", nullable = false, length = 100)
    private String nomAgent;

    @Column(name = "prenom_agent", nullable = false, length = 100)
    private String prenomAgent;

    @Column(name = "cin", nullable = false, unique = true, length = 20)
    private String cin;

    @Column(name = "grade", length = 50)
    private String grade;

    @Column(name = "telephone", length = 20)
    private String telephone;

    @Column(name = "adresse", length = 255)
    private String adresse;

    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    @Column(name = "date_mise_en_service")
    private LocalDate dateMiseEnService;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private Enums.StatusAgent status;
}