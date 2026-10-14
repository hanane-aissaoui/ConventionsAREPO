package com.arepo.serveur.security;

import com.arepo.serveur.model.Compte;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class CompteUserDetails implements UserDetails {

    private final Compte compte;

    public CompteUserDetails(Compte compte) {
        this.compte = compte;
    }

   public Compte getCompte() {
        return compte;
    }


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String roleAuthority = "ROLE_" + compte.getRole().name();

        Stream<String> permissionAuthorities = RolePermissions.forRole(compte.getRole())
                .stream()
                .map(Enum::name);

        return Stream.concat(Stream.of(roleAuthority), permissionAuthorities)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }


    @Override
    public String getPassword() {
        return compte.getMotDePasse();
    }

    @Override
    public String getUsername() {
        return compte.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(compte.getStatus());
    }
}