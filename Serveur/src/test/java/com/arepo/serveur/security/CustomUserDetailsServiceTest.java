package com.arepo.serveur.security;

import com.arepo.serveur.model.Compte;
import com.arepo.serveur.model.Enums.Role;
import com.arepo.serveur.repository.CompteRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private CompteRepository compteRepository;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void loadUserByUsername_emailConnu_retourneCompteUserDetails() {
        Compte compte = new Compte();
        compte.setEmail("admin@arepo.ma");
        compte.setRole(Role.ADMIN);
        when(compteRepository.findByEmail("admin@arepo.ma")).thenReturn(Optional.of(compte));

        UserDetails details = customUserDetailsService.loadUserByUsername("admin@arepo.ma");

        assertThat(details).isInstanceOf(CompteUserDetails.class);
        assertThat(((CompteUserDetails) details).getCompte()).isSameAs(compte);
        assertThat(details.getUsername()).isEqualTo("admin@arepo.ma");
    }

    @Test
    void loadUserByUsername_emailInconnu_lanceUsernameNotFound() {
        when(compteRepository.findByEmail("inconnu@arepo.ma")).thenReturn(Optional.empty());

        UsernameNotFoundException ex = assertThrows(UsernameNotFoundException.class,
                () -> customUserDetailsService.loadUserByUsername("inconnu@arepo.ma"));
        assertThat(ex.getMessage()).contains("inconnu@arepo.ma");
    }
}
