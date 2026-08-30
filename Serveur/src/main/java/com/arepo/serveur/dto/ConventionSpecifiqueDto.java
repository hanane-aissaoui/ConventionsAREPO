package com.arepo.serveur.dto;

import com.arepo.serveur.model.ConventionSpecifique;
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
public class ConventionSpecifiqueDto {
    public UUID idConventionSpecifique;
    public Double montantContribution;
    public Double montantDebloque;
    public String etatConvention;
    public LocalDate dateParticipation;
    public UUID idPartenaire;
    public UUID idProjet;

    public static ConventionSpecifiqueDto fromEntity(ConventionSpecifique c) {
        ConventionSpecifiqueDto dto = new ConventionSpecifiqueDto();
        dto.idConventionSpecifique = c.getIdConventionSpecifique();
        dto.montantContribution = c.getMontantContribution();
        dto.montantDebloque = c.getMontantDebloque();
        dto.etatConvention = c.getEtatConvention();
        dto.dateParticipation = c.getDateParticipation();
        dto.idPartenaire = c.getPartenaire().getIdPartenaire();
        dto.idProjet = c.getProjet().getIdProjet();
        return dto;
    }
}
