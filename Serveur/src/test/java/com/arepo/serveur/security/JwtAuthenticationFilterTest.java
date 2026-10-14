package com.arepo.serveur.security;

import com.arepo.serveur.model.Compte;
import com.arepo.serveur.model.Enums.Role;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private CustomUserDetailsService userDetailsService;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter filter;

    private final MockHttpServletRequest request = new MockHttpServletRequest();
    private final MockHttpServletResponse response = new MockHttpServletResponse();

    // SecurityContextHolder is static (shared): clean it so tests don't affect each other
    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    private CompteUserDetails agent() {
        Compte compte = new Compte();
        compte.setEmail("agent@arepo.ma");
        compte.setRole(Role.AGENT);
        compte.setStatus(true);
        return new CompteUserDetails(compte);
    }

    private Authentication authenticationCourante() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    @Test
    void sansHeader_laissePasserSansAuthentifier() throws Exception {
        filter.doFilterInternal(request, response, filterChain);

        assertThat(authenticationCourante()).isNull();
        verify(filterChain).doFilter(request, response); // the request continues
        verifyNoInteractions(jwtService, userDetailsService);
    }

    @Test
    void headerSansBearer_estIgnore() throws Exception {
        request.addHeader("Authorization", "Basic dXNlcjpwYXNz");

        filter.doFilterInternal(request, response, filterChain);

        assertThat(authenticationCourante()).isNull();
        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(jwtService);
    }

    @Test
    void tokenValide_authentifieLUtilisateurAvecSesPermissions() throws Exception {
        CompteUserDetails agent = agent();
        request.addHeader("Authorization", "Bearer token-valide");
        when(jwtService.extractUsername("token-valide")).thenReturn("agent@arepo.ma");
        when(userDetailsService.loadUserByUsername("agent@arepo.ma")).thenReturn(agent);
        when(jwtService.isTokenValid("token-valide", agent)).thenReturn(true);

        filter.doFilterInternal(request, response, filterChain);

        Authentication auth = authenticationCourante();
        assertThat(auth).isNotNull();
        assertThat(auth.getPrincipal()).isSameAs(agent);
        assertThat(auth.getAuthorities()).extracting(GrantedAuthority::getAuthority)
                .contains("ROLE_AGENT", "PROJET_VIEW");
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void tokenInvalidePourCetUtilisateur_nAuthentifiePas() throws Exception {
        CompteUserDetails agent = agent();
        request.addHeader("Authorization", "Bearer token");
        when(jwtService.extractUsername("token")).thenReturn("agent@arepo.ma");
        when(userDetailsService.loadUserByUsername("agent@arepo.ma")).thenReturn(agent);
        when(jwtService.isTokenValid("token", agent)).thenReturn(false);

        filter.doFilterInternal(request, response, filterChain);

        assertThat(authenticationCourante()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void tokenMalForme_pasDeCrashEtPasDAuthentification() throws Exception {
        request.addHeader("Authorization", "Bearer n-importe-quoi");
        when(jwtService.extractUsername("n-importe-quoi")).thenThrow(new MalformedJwtException("bad"));

        filter.doFilterInternal(request, response, filterChain);

        assertThat(authenticationCourante()).isNull();
        verify(filterChain).doFilter(request, response); // still continues -> 401 later
        verifyNoInteractions(userDetailsService);
    }

    @Test
    void tokenExpire_pasDeCrashEtPasDAuthentification() throws Exception {
        CompteUserDetails agent = agent();
        request.addHeader("Authorization", "Bearer expire");
        when(jwtService.extractUsername("expire")).thenReturn("agent@arepo.ma");
        when(userDetailsService.loadUserByUsername("agent@arepo.ma")).thenReturn(agent);
        // That's what the real JwtService does with an expired token (see JwtServiceTest)
        when(jwtService.isTokenValid("expire", agent))
                .thenThrow(new ExpiredJwtException(null, null, "expired"));

        filter.doFilterInternal(request, response, filterChain);

        assertThat(authenticationCourante()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void dejaAuthentifie_neRechargePasLUtilisateur() throws Exception {
        // Someone is already in the SecurityContext for this request
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "deja", null, List.of()));
        request.addHeader("Authorization", "Bearer token");
        when(jwtService.extractUsername("token")).thenReturn("agent@arepo.ma");

        filter.doFilterInternal(request, response, filterChain);

        verify(userDetailsService, never()).loadUserByUsername(any());
        assertThat(authenticationCourante().getPrincipal()).isEqualTo("deja");
    }
}
