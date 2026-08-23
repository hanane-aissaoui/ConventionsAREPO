package com.arepo.serveur.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Sans ce bean, Spring Security renvoie 403 pour TOUT echec (token absent,
 * invalide, OU role insuffisant), ce qui rend les deux cas indistinguables
 * cote frontend. Ici : 401 = "pas authentifie / token invalide" (bonne
 * pratique HTTP). Voir aussi RestAccessDeniedHandler pour le vrai 403
 * ("authentifie, mais role insuffisant").
 */
@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("text/plain;charset=UTF-8");
        response.getWriter().write("Authentification requise ou token invalide.");
    }
}
