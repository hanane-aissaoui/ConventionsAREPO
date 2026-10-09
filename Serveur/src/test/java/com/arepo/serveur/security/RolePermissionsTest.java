package com.arepo.serveur.security;

import com.arepo.serveur.model.Enums.Permission;
import com.arepo.serveur.model.Enums.Role;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

// RolePermissions is plain Java: no mocks needed at all.
// These tests "lock" the permission table: if someone changes it by mistake, a test fails.
class RolePermissionsTest {

    @Test
    void admin_aToutesLesPermissions() {
        assertThat(RolePermissions.forRole(Role.ADMIN))
                .containsExactlyInAnyOrder(Permission.values());
    }

    @Test
    void agent_peutLireCreerEtModifier() {
        assertThat(RolePermissions.forRole(Role.AGENT)).containsExactlyInAnyOrder(
                Permission.PROGRAMME_VIEW,
                Permission.PROGRAMME_EDIT,
                Permission.PROJET_VIEW,
                Permission.PROJET_CREATE,
                Permission.PROJET_EDIT,
                Permission.CONVENTION_VIEW,
                Permission.CONVENTION_CREATE,
                Permission.CONVENTION_EDIT
        );
    }

    @Test
    void agent_neJamaisSupprimerNiGerer() {
        Set<Permission> permissions = RolePermissions.forRole(Role.AGENT);

        // No *_DELETE and no *_MANAGE permission for an AGENT
        assertThat(permissions)
                .noneMatch(p -> p.name().endsWith("_DELETE"))
                .noneMatch(p -> p.name().endsWith("_MANAGE"));
    }

    @Test
    void roleNull_retourneEnsembleVide() {
        // getOrDefault(...) -> no crash, just no permission
        assertThat(RolePermissions.forRole(null)).isEmpty();
    }
}
