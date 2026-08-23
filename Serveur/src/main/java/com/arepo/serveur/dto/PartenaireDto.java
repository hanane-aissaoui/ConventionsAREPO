package com.arepo.serveur.dto;

import com.arepo.serveur.model.Partenaire;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PartenaireDto {
    public UUID idPartenaire;
    public String nom;
    public String code;

    public static PartenaireDto fromEntity(Partenaire p) {
        PartenaireDto dto = new PartenaireDto();
        dto.idPartenaire = p.getIdPartenaire();
        dto.nom = p.getNom();
        dto.code = p.getCode();
        return dto;
    }


}
