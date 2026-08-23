package com.arepo.serveur.dto;

import com.arepo.serveur.model.ConventionCadre;
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
public class ConventionCadreDto {
    public UUID idConventionCadre;
    public Double montantContribution;
    public Double montantDebloque;
    public String etatConvention;
    public LocalDate dateParticipation;
    public UUID idPartenaire;
    public UUID idProgramme;

    public static ConventionCadreDto fromEntity(ConventionCadre c) {
        ConventionCadreDto dto = new ConventionCadreDto();
        dto.idConventionCadre = c.getIdConventionCadre();
        dto.montantContribution = c.getMontantContribution();
        dto.montantDebloque = c.getMontantDebloque();
        dto.etatConvention = c.getEtatConvention();
        dto.dateParticipation = c.getDateParticipation();
        dto.idPartenaire = c.getPartenaire().getIdPartenaire();
        dto.idProgramme = c.getProgramme().getIdProgramme();
        return dto;
    }


}
