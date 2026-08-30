package com.arepo.serveur.dto;

import com.arepo.serveur.model.Marche;
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
public class MarcheDto {
    public UUID idMarche;
    public String typeAction;
    public String attributaireRealisateur;
    public Double montantEngage;
    public Integer avancementPhysique;
    public Integer avancementFinancier;
    public Double estimation;
    public LocalDate dateDebut;
    public LocalDate dateFin;
    public UUID idProjet;

    public static MarcheDto fromEntity(Marche m) {
        MarcheDto dto = new MarcheDto();
        dto.idMarche = m.getIdMarche();
        dto.typeAction = m.getTypeAction() != null ? m.getTypeAction().name() : null;
        dto.attributaireRealisateur = m.getAttributaireRealisateur();
        dto.montantEngage = m.getMontantEngage();
        dto.avancementPhysique = m.getAvancementPhysique();
        dto.avancementFinancier = m.getAvancementFinancier();
        dto.estimation = m.getEstimation();
        dto.dateDebut = m.getDateDebut();
        dto.dateFin = m.getDateFin();
        dto.idProjet = m.getProjet().getIdProjet();
        return dto;
    }
}
