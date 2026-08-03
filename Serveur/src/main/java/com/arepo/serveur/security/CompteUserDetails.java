package com.arepo.serveur.security;

import com.arepo.serveur.model.Compte;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

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
       String role = "ROLE_" + compte.getRole().name();
        return List.of(new SimpleGrantedAuthority(role));
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