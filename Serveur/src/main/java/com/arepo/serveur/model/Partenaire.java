package com.arepo.serveur.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "partenaire")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Partenaire {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_partenaire")
    private UUID idPartenaire;

    @Column(name = "nom", nullable = false, length = 200)
    private String nom;

    @Column(name = "telephone", length = 30)
    private String telephone;

    @Column(name = "email", length = 200)
    private String email;

    @OneToMany(mappedBy = "partenaire")
    private List<ConventionCadre> conventionsCadre = new ArrayList<>();

    @OneToMany(mappedBy = "partenaire")
    private List<ConventionSpecifique> conventionsSpecifiques = new ArrayList<>();
}
