package com.arepo.serveur.controller;

import com.arepo.serveur.dto.AuthResponse;
import com.arepo.serveur.dto.LoginRequest;
import com.arepo.serveur.dto.ProfileDto;
import com.arepo.serveur.model.Agent;
import com.arepo.serveur.model.Compte;
import com.arepo.serveur.model.Enums;
import com.arepo.serveur.security.CompteUserDetails;
import com.arepo.serveur.security.JwtService;
import com.arepo.serveur.security.RolePermissions;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getMotDePasse())
            );

            CompteUserDetails userDetails = (CompteUserDetails) authentication.getPrincipal();
            String token = jwtService.generateToken(userDetails);

            return ResponseEntity.ok(new AuthResponse(token, userDetails.getUsername()));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Email ou mot de passe incorrect");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        CompteUserDetails userDetails = (CompteUserDetails) authentication.getPrincipal();
        Compte compte = userDetails.getCompte();
        Agent agent = compte.getAgent();
        List<String> permissions = RolePermissions.forRole(compte.getRole())
                .stream()
                .map(Enums.Permission::name)
                .toList();
        ProfileDto profile = new ProfileDto(
                agent.getNom(),
                agent.getPrenom(),
                compte.getEmail(),
                agent.getGrade(),
                agent.getCin(),
                agent.getTelephone(),
                compte.getRole().name(),
                permissions
        );

        return ResponseEntity.ok(profile);
    }
}