package com.arepo.serveur.controller;

import com.arepo.serveur.config.SecurityConfig;
import com.arepo.serveur.exception.RestAccessDeniedHandler;
import com.arepo.serveur.exception.RestAuthenticationEntryPoint;
import com.arepo.serveur.model.Agent;
import com.arepo.serveur.model.Compte;
import com.arepo.serveur.model.Enums.Role;
import com.arepo.serveur.security.CompteUserDetails;
import com.arepo.serveur.security.CustomUserDetailsService;
import com.arepo.serveur.security.JwtService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, RestAuthenticationEntryPoint.class, RestAccessDeniedHandler.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // AuthController needs these two
    @MockitoBean
    private AuthenticationManager authenticationManager;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private DaoAuthenticationProvider authenticationProvider;

    private CompteUserDetails compteUserDetails(Role role) {
        Agent agent = new Agent();
        agent.setNom("Alami");
        agent.setPrenom("Sara");
        agent.setGrade("Ingenieur");
        agent.setCin("F123456");
        agent.setTelephone("0600000000");

        Compte compte = new Compte();
        compte.setEmail("sara@arepo.ma");
        compte.setRole(role);
        compte.setStatus(true);
        compte.setAgent(agent);
        return new CompteUserDetails(compte);
    }

    private static final String LOGIN_JSON = """
            { "email": "sara@arepo.ma", "motDePasse": "secret" }
            """;

    // =========================================================
    //  POST /api/auth/login
    // =========================================================

    @Test
    void login_identifiantsCorrects_retourneLeToken() throws Exception {
        CompteUserDetails details = compteUserDetails(Role.AGENT);
        Authentication auth = new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities());
        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(jwtService.generateToken(details)).thenReturn("jwt-123");

        // No @WithMockUser: /api/auth/** is public (permitAll)
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(LOGIN_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-123"))
                .andExpect(jsonPath("$.email").value("sara@arepo.ma"));

        // Check that email + password from the JSON were given to Spring Security
        ArgumentCaptor<Authentication> captor = ArgumentCaptor.forClass(Authentication.class);
        verify(authenticationManager).authenticate(captor.capture());
        assertThat(captor.getValue().getPrincipal()).isEqualTo("sara@arepo.ma");
        assertThat(captor.getValue().getCredentials()).isEqualTo("secret");
    }

    @Test
    void login_mauvaisMotDePasse_retourne401() throws Exception {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("bad"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(LOGIN_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Email ou mot de passe incorrect"));

        verify(jwtService, never()).generateToken(any());
    }

    @Test
    void login_compteDesactive_retourne401AvecMessageClair() throws Exception {
        // status=false -> Spring Security throws DisabledException (not BadCredentialsException)
        when(authenticationManager.authenticate(any())).thenThrow(new DisabledException("disabled"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(LOGIN_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Ce compte est désactivé. Contactez l'administrateur."));

        verify(jwtService, never()).generateToken(any());
    }

    // =========================================================
    //  GET /api/auth/me
    // =========================================================

    @Test
    void me_utilisateurConnecte_retourneSonProfilEtSesPermissions() throws Exception {
        mockMvc.perform(get("/api/auth/me").with(user(compteUserDetails(Role.AGENT))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("Alami"))
                .andExpect(jsonPath("$.prenom").value("Sara"))
                .andExpect(jsonPath("$.email").value("sara@arepo.ma"))
                .andExpect(jsonPath("$.cin").value("F123456"))
                .andExpect(jsonPath("$.role").value("AGENT"))
                .andExpect(jsonPath("$.permissions", hasItem("PROJET_VIEW")))
                .andExpect(jsonPath("$.permissions", not(hasItem("PROJET_DELETE"))));
    }

    @Test
    void me_sansEtreConnecte_retourne401() throws Exception {
        // Should be 401 (RestAuthenticationEntryPoint), like every other protected endpoint
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_avecVraiHeaderBearer_passeParLeFiltreJwt() throws Exception {
        // End-to-end inside the security chain: the REAL JwtAuthenticationFilter reads the header
        CompteUserDetails details = compteUserDetails(Role.ADMIN);
        when(jwtService.extractUsername("jwt-abc")).thenReturn("sara@arepo.ma");
        when(customUserDetailsService.loadUserByUsername("sara@arepo.ma")).thenReturn(details);
        when(jwtService.isTokenValid("jwt-abc", details)).thenReturn(true);

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer jwt-abc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.permissions", hasItem("TERRITOIRE_MANAGE")));
    }
}
