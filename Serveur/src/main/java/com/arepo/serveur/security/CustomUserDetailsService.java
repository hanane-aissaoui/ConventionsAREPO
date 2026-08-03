package com.arepo.serveur.security;

import com.arepo.serveur.model.Compte;
import com.arepo.serveur.repository.CompteRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final CompteRepository compteRepository;

    public CustomUserDetailsService(CompteRepository compteRepository) {
        this.compteRepository = compteRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Compte compte = compteRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Aucun compte trouvé pour l'email : " + email));
        return new CompteUserDetails(compte);
    }
}