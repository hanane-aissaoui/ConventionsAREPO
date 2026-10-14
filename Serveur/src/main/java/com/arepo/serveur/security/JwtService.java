package com.arepo.serveur.security;

import com.arepo.serveur.model.Enums.Permission;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long expirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }



    public String generateToken(UserDetails userDetails) {
        Date maintenant = new Date();
        Date expiration = new Date(maintenant.getTime() + expirationMs);

        var builder = Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(maintenant)
                .expiration(expiration);


        if (userDetails instanceof CompteUserDetails compteUserDetails) {
            var role = compteUserDetails.getCompte().getRole();
            List<String> permissions = RolePermissions.forRole(role).stream()
                    .map(Permission::name)
                    .toList();

            builder.claim("role", role.name())
                    .claim("permissions", permissions);
        }

        return builder.signWith(getSigningKey()).compact();
    }



    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        Date expiration = extractClaim(token, Claims::getExpiration);
        return expiration.before(new Date());
    }
}