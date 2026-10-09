package com.arepo.serveur.security;

import com.arepo.serveur.model.Compte;
import com.arepo.serveur.model.Enums.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

// Here we use REAL tokens (no mocks): signing and reading them is exactly what we want to test.
class JwtServiceTest {

    // At least 32 characters (256 bits) for HMAC-SHA256
    private static final String SECRET = "UnSecretDeTestAssezLongPourHmacSha256!!";
    private static final long UNE_HEURE = 3_600_000L;

    private JwtService jwtService;

    // @Value fields are normally filled by Spring from application.properties.
    // Without Spring, we set them ourselves with ReflectionTestUtils.
    private JwtService jwtService(String secret, long expirationMs) {
        JwtService service = new JwtService();
        ReflectionTestUtils.setField(service, "secretKey", secret);
        ReflectionTestUtils.setField(service, "expirationMs", expirationMs);
        return service;
    }

    @BeforeEach
    void setUp() {
        jwtService = jwtService(SECRET, UNE_HEURE);
    }

    private CompteUserDetails compteUserDetails(String email, Role role) {
        Compte compte = new Compte();
        compte.setEmail(email);
        compte.setRole(role);
        compte.setStatus(true);
        return new CompteUserDetails(compte);
    }

    // =========================================================
    //  generateToken + extract
    // =========================================================

    @Test
    void generateToken_contientLEmailCommeSubject() {
        String token = jwtService.generateToken(compteUserDetails("agent@arepo.ma", Role.AGENT));

        assertThat(jwtService.extractUsername(token)).isEqualTo("agent@arepo.ma");
    }

    @Test
    void generateToken_contientLeRoleEtLesPermissions() {
        String token = jwtService.generateToken(compteUserDetails("agent@arepo.ma", Role.AGENT));

        String role = jwtService.extractClaim(token, claims -> claims.get("role", String.class));
        @SuppressWarnings("unchecked")
        List<String> permissions = jwtService.extractClaim(token, claims -> claims.get("permissions", List.class));

        assertThat(role).isEqualTo("AGENT");
        assertThat(permissions).contains("PROJET_VIEW", "CONVENTION_CREATE").doesNotContain("PROJET_DELETE");
    }

    @Test
    void generateToken_expireApresLaDureeConfiguree() {
        String token = jwtService.generateToken(compteUserDetails("agent@arepo.ma", Role.AGENT));

        long issuedAt = jwtService.extractClaim(token, Claims::getIssuedAt).getTime();
        long expiration = jwtService.extractClaim(token, Claims::getExpiration).getTime();

        assertThat(expiration - issuedAt).isEqualTo(UNE_HEURE);
    }

    @Test
    void generateToken_userDetailsGenerique_pasDeClaimRole() {
        // A UserDetails that is NOT a CompteUserDetails -> no role/permissions claims
        UserDetails user = User.withUsername("x@arepo.ma").password("p").build();

        String token = jwtService.generateToken(user);

        assertThat(jwtService.extractUsername(token)).isEqualTo("x@arepo.ma");
        Object role = jwtService.extractClaim(token, claims -> claims.get("role"));
        assertThat(role).isNull();
    }

    // =========================================================
    //  isTokenValid
    // =========================================================

    @Test
    void isTokenValid_bonUtilisateur_retourneTrue() {
        CompteUserDetails user = compteUserDetails("agent@arepo.ma", Role.AGENT);
        String token = jwtService.generateToken(user);

        assertThat(jwtService.isTokenValid(token, user)).isTrue();
    }

    @Test
    void isTokenValid_autreUtilisateur_retourneFalse() {
        String token = jwtService.generateToken(compteUserDetails("agent@arepo.ma", Role.AGENT));

        assertThat(jwtService.isTokenValid(token, compteUserDetails("autre@arepo.ma", Role.AGENT))).isFalse();
    }

    @Test
    void tokenExpire_lanceExpiredJwtException() {
        // Negative duration -> the token is already expired when created
        JwtService serviceExpire = jwtService(SECRET, -1000);
        CompteUserDetails user = compteUserDetails("agent@arepo.ma", Role.AGENT);
        String token = serviceExpire.generateToken(user);

        // Note: isTokenValid does not return false here, it THROWS.
        // JwtAuthenticationFilter catches JwtException, so the request ends as 401.
        assertThrows(ExpiredJwtException.class, () -> jwtService.isTokenValid(token, user));
    }

    // =========================================================
    //  Falsified tokens
    // =========================================================

    @Test
    void tokenSigneAvecUnAutreSecret_estRejete() {
        JwtService pirate = jwtService("UnAutreSecretCompletementDifferent!!!!!", UNE_HEURE);
        String tokenPirate = pirate.generateToken(compteUserDetails("admin@arepo.ma", Role.ADMIN));

        assertThrows(JwtException.class, () -> jwtService.extractUsername(tokenPirate));
    }

    @Test
    void tokenAvecPayloadModifie_estRejete() {
        // A token is "header.payload.signature". An attacker keeps the agent's signature
        // but puts the payload of another (admin) token: the signature no longer matches.
        String[] agent = jwtService.generateToken(compteUserDetails("agent@arepo.ma", Role.AGENT)).split("\\.");
        String[] admin = jwtService.generateToken(compteUserDetails("admin@arepo.ma", Role.ADMIN)).split("\\.");
        String falsifie = agent[0] + "." + admin[1] + "." + agent[2];

        assertThrows(JwtException.class, () -> jwtService.extractUsername(falsifie));
    }

    @Test
    void tokenMalForme_estRejete() {
        assertThrows(JwtException.class, () -> jwtService.extractUsername("pas.un.token"));
    }
}
