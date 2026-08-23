package com.arepo.serveur.dto;

import com.arepo.serveur.model.Programme;
import java.time.LocalDate;
import java.util.UUID;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class ProgrammeDto {
    public UUID idProgramme;
    public String objet;
    public LocalDate dateDebut;
    public LocalDate dateFin;
    public Double budgetEstime;
    public Integer nbrPartenaire;
    public Integer nbrProjet;
    public static ProgrammeDto fromEntity(Programme p) {
        ProgrammeDto dto = new ProgrammeDto();
        dto.idProgramme = p.getIdProgramme();
        dto.objet = p.getObjet();
        dto.dateDebut = p.getDateDebut();
        dto.dateFin = p.getDateFin();
        dto.budgetEstime = p.getBudgetEstime();
        dto.nbrPartenaire=p.getConventionsCadre().size();
        dto.nbrProjet=p.getProjets().size();
        return dto;
    }

}
