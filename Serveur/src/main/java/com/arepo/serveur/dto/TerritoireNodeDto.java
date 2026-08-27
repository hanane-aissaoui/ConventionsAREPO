package com.arepo.serveur.dto;

import java.util.List;

public record TerritoireNodeDto(
        String id,
        String nom,
        List<TerritoireNodeDto> enfants
) {}