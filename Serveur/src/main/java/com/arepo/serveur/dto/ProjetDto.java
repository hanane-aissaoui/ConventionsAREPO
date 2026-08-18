package com.arepo.serveur.dto;

import com.arepo.serveur.model.Projet;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class ProjetDto {
    public UUID idProjet; //public
    public String nom;
    public LocalDate dateDebut;
    public LocalDate dateFin;
    public Double budgetEstime;
    public String statut;
    public String nomProgramme;
    public String nomCommune;
    public  Integer nbrPartenaire;
    public Integer nbrSociete;


    public static ProjetDto fromEntity(Projet p) {
        ProjetDto dto = new ProjetDto();
        dto.idProjet = p.getIdProjet();
        dto.nom = p.getNom();
        dto.dateDebut = p.getDateDebut();
        dto.dateFin = p.getDateFin();
        dto.budgetEstime = p.getBudgetEstime();
        dto.statut = p.getStatut();
        dto.nomProgramme = p.getProgramme().getObjet();
        dto.nomCommune = p.getCommune().getNom();
        dto.nbrPartenaire=p.getConventionsSpecifiques().size();
        dto.nbrSociete=p.getMarches().size();
        return dto;
    }

  }



