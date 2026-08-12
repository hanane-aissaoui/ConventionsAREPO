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
@Table(name = "commune")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Commune {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_commune")
    private UUID idCommune;

    @Column(name = "nom", nullable = false, length = 150)
    private String nom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_prefecture", referencedColumnName = "id_prefecture", nullable = false)
    private PrefectureProvince prefecture;

    @OneToMany(mappedBy = "commune", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Projet> projets = new ArrayList<>();
}
