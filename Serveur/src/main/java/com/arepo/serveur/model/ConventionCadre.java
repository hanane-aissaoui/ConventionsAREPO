package com.arepo.serveur.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Convention Cadre : accord global entre un Partenaire et un Programme
 * (niveau strategique). Un Programme n'a qu'une seule ConventionCadre (1-1).
 */
@Entity
@Table(name = "convention_cadre")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConventionCadre {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_convention_cadre")
    private UUID idConventionCadre;

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
    @JoinColumn(name = "id_programme", referencedColumnName = "id_programme", nullable = false, unique = true)
    private Programme programme;
}
