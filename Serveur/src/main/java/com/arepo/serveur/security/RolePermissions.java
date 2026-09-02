package com.arepo.serveur.security;

import com.arepo.serveur.model.Enums.Permission;
import com.arepo.serveur.model.Enums.Role;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Centralise ce que chaque role a le droit de faire.
 * Une seule source de verite : modifie ici pour changer les droits
 * partout (token JWT, verification backend, reponse /me).
 */
public final class RolePermissions {

    private static final Map<Role, Set<Permission>> MAPPING = new EnumMap<>(Role.class);

    static {
        // ADMIN : accès complet
        MAPPING.put(Role.ADMIN, EnumSet.allOf(Permission.class));

        // AGENT : lecture partout, écriture limitée (pas de suppression, pas de gestion territoire/agents)
        MAPPING.put(Role.AGENT, EnumSet.of(
                Permission.PROGRAMME_VIEW,
                Permission.PROGRAMME_EDIT,

                Permission.PROJET_VIEW,
                Permission.PROJET_CREATE,
                Permission.PROJET_EDIT,

                Permission.CONVENTION_VIEW,
                Permission.CONVENTION_CREATE,
                Permission.CONVENTION_EDIT,

                Permission.PARTENAIRE_VIEW,

                Permission.TERRITOIRE_VIEW
        ));
    }

    public static Set<Permission> forRole(Role role) {
        return MAPPING.getOrDefault(role, Set.of());
    }

    private RolePermissions() {}
}