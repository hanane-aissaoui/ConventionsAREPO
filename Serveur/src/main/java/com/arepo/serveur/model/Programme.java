package com.arepo.serveur.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "programme")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Programme {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_programme")
    private UUID idProgramme;

    @Column(name = "objet", nullable = false, columnDefinition = "TEXT")
    private String objet;

    @Column(name = "date_debut")
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Column(name = "budget_estime")
    private Double budgetEstime;


    @OneToMany(mappedBy = "programme", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Projet> projets = new ArrayList<>();

    @OneToMany(mappedBy = "programme", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ConventionCadre> conventionCadre= new ArrayList<>();;
}
