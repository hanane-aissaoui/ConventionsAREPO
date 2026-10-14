package com.arepo.serveur.security;

import com.arepo.serveur.model.Compte;
import com.arepo.serveur.model.Enums.Role;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CompteUserDetailsTest {

    private Compte compte(Role role, Boolean status) {
        Compte compte = new Compte();
        compte.setEmail("agent@arepo.ma");
        compte.setMotDePasse("$2a$10$hash");
        compte.setRole(role);
        compte.setStatus(status);
        return compte;
    }

    private List<String> authorities(CompteUserDetails details) {
        return details.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();
    }

    @Test
    void getAuthorities_contientLeRoleEtSesPermissions() {
        CompteUserDetails details = new CompteUserDetails(compte(Role.AGENT, true));

        List<String> authorities = authorities(details);

        // "ROLE_AGENT" (for hasRole) + each permission (for hasAuthority)
        assertThat(authorities).contains("ROLE_AGENT", "PROJET_VIEW", "PROJET_CREATE");
        assertThat(authorities).doesNotContain("PROJET_DELETE", "ROLE_ADMIN");
        // 1 role + 8 permissions of AGENT
        assertThat(authorities).hasSize(1 + RolePermissions.forRole(Role.AGENT).size());
    }

    @Test
    void getAuthorities_admin_contientToutesLesPermissions() {
        CompteUserDetails details = new CompteUserDetails(compte(Role.ADMIN, true));

        assertThat(authorities(details)).contains("ROLE_ADMIN", "PROGRAMME_DELETE", "TERRITOIRE_MANAGE");
    }

    @Test
    void usernameEtPassword_viennentDuCompte() {
        CompteUserDetails details = new CompteUserDetails(compte(Role.AGENT, true));

        assertThat(details.getUsername()).isEqualTo("agent@arepo.ma");
        assertThat(details.getPassword()).isEqualTo("$2a$10$hash");
    }

    @Test
    void isEnabled_suitLeStatusDuCompte() {
        assertThat(new CompteUserDetails(compte(Role.AGENT, true)).isEnabled()).isTrue();
        assertThat(new CompteUserDetails(compte(Role.AGENT, false)).isEnabled()).isFalse();
        // null status must NOT be considered active
        assertThat(new CompteUserDetails(compte(Role.AGENT, null)).isEnabled()).isFalse();
    }
}
