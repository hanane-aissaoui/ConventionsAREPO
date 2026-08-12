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
@Table(name = "prefecture_province")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PrefectureProvince {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_prefecture")
    private UUID idPrefecture;

    @Column(name = "nom", nullable = false, length = 150)
    private String nom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_region", referencedColumnName = "id_region", nullable = false)
    private Region region;

    @OneToMany(mappedBy = "prefecture", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Commune> communes = new ArrayList<>();
}
