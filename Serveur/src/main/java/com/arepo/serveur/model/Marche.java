package com.arepo.serveur.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "marche")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Marche {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_marche")
    private UUID idMarche;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_action", nullable = false, length = 30)
    private Enums.TypeAction typeAction;

    @Column(name = "attributaire_realisateur", length = 200)
    private String attributaireRealisateur;

    @Column(name = "montant_engage")
    private Double montantEngage;

    @Column(name = "avancement_physique")
    private Integer avancementPhysique;

    @Column(name = "avancement_financier")
    private Integer avancementFinancier;

    @Column(name = "estimation")
    private Double estimation;

    @Column(name = "date_debut")
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_projet", referencedColumnName = "id_projet", nullable = false)
    private Projet projet;
}
