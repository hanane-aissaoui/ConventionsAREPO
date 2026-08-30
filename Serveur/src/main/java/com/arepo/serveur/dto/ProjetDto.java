package com.arepo.serveur.dto;

import com.arepo.serveur.model.Projet;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class ProjetDto {
    public UUID idProjet;
    public String nom;
    public LocalDate dateDebut;
    public LocalDate dateFin;
    public Double budgetEstime;
    public String statut;
    public String nomProgramme;
    public String nomCommune;
    public Integer nbrPartenaire;
    public Integer nbrSociete;
    public UUID idProgramme;
    public UUID idCommune;
    public LocalDateTime dateCreation;
    public LocalDateTime dateModification;

    // Province/Préfecture de la commune du projet (pour le regroupement "Projets par Province")
    public UUID idPrefecture;
    public String nomPrefecture;

    public Integer avancementPhysiqueMoyen;
    public Integer avancementFinancierMoyen;

    // Remplies UNIQUEMENT par fromEntityDetail() (page de detail)
    public List<String> marches;
    public List<String> partenaires;

    public static ProjetDto fromEntity(Projet p) {
        ProjetDto dto = new ProjetDto();
        dto.idProjet = p.getIdProjet();
        dto.nom = p.getNom();
        dto.dateDebut = p.getDateDebut();
        dto.dateFin = p.getDateFin();
        dto.budgetEstime = p.getBudgetEstime();
        dto.statut = p.getStatut();
        dto.nomProgramme = p.getProgramme().getObjet();
        dto.idProgramme = p.getProgramme().getIdProgramme();
        dto.idCommune = p.getCommune().getIdCommune();
        dto.nomCommune = p.getCommune().getNom();
        dto.idPrefecture = p.getCommune().getPrefecture().getIdPrefecture();
        dto.nomPrefecture = p.getCommune().getPrefecture().getNom();
        dto.dateCreation = p.getDateCreation();
        dto.dateModification = p.getDateModification();
        dto.nbrPartenaire = p.getConventionsSpecifiques().size();
        dto.nbrSociete = p.getMarches().size();
        return dto;
    }

    // Calcul des moyennes d'avancement + listes détaillées : uniquement pour la
    // page de détail, pour ne pas alourdir les requêtes de liste paginées.
    public static ProjetDto fromEntityDetail(Projet p) {
        ProjetDto dto = fromEntity(p);

        dto.marches = p.getMarches().stream()
                .map(m -> (m.getAttributaireRealisateur() == null ? "Société non renseignée" : m.getAttributaireRealisateur())
                        + " (" + m.getTypeAction() + ")")
                .toList();

        dto.partenaires = p.getConventionsSpecifiques().stream()
                .map(cs -> cs.getPartenaire().getNom())
                .toList();

        dto.avancementPhysiqueMoyen = p.getMarches().isEmpty()
                ? null
                : (int) p.getMarches().stream()
                .mapToInt(m -> m.getAvancementPhysique() == null ? 0 : m.getAvancementPhysique())
                .average()
                .orElse(0);
        dto.avancementFinancierMoyen = p.getMarches().isEmpty()
                ? null
                : (int) p.getMarches().stream()
                .mapToInt(m -> m.getAvancementFinancier() == null ? 0 : m.getAvancementFinancier())
                .average()
                .orElse(0);

        return dto;
    }
}