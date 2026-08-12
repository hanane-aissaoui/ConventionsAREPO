package com.arepo.serveur.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Convention Specifique : accord precis entre un Partenaire et un Projet
 * (niveau operationnel). Un Projet peut avoir plusieurs ConventionSpecifique.
 */
@Entity
@Table(name = "convention_specifique")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConventionSpecifique {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_convention_specifique")
    private UUID idConventionSpecifique;

    @Column(name = "montant_contribution")
    private Double montantContribution;

    @Column(name = "montant_debloque")
    private Double montantDebloque;

    @Column(name = "etat_convention", nullable = false, length = 30)
    private String etatConvention;

    @Column(name = "date_participation")
    private LocalDate dateParticipation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_partenaire", referencedColumnName = "id_partenaire", nullable = false)
    private Partenaire partenaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_projet", referencedColumnName = "id_projet", nullable = false)
    private Projet projet;
}
