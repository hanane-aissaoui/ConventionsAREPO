package com.arepo.serveur.dto;

import com.arepo.serveur.model.Commune;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommuneDto {
    public UUID idCommune;
    public String nom;

    public static CommuneDto fromEntity(Commune c) {
        CommuneDto dto = new CommuneDto();
        dto.idCommune = c.getIdCommune();
        dto.nom = c.getNom();
        return dto;
    }
}
