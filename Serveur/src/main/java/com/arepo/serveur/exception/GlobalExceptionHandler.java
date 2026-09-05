package com.arepo.serveur.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Centralise la conversion des exceptions "metier" en reponses HTTP
 * propres, plutot que de laisser Spring renvoyer une stack trace brute
 * (500) a chaque erreur previsible.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<String> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<String> handleDuplicate(DuplicateResourceException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    // Ex: essayer de supprimer un Programme encore lie a des Projets, ou
    // un Partenaire encore lie a des Conventions -> violation de cle
    // etrangere en base. Sans ce handler, Spring renverrait un 500 brut.
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<String> handleDataIntegrity(DataIntegrityViolationException ex) {
        log.warn("Violation d'integrite des donnees : {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Impossible d'effectuer cette action : cet element est encore utilise ailleurs.");
    }

    // 403 : role insuffisant. Quand le refus vient de la securite de
    // methode (@PreAuthorize), l'AccessDeniedException est levee pendant
    // l'appel du controleur et remonte ici AVANT d'atteindre le
    // RestAccessDeniedHandler de Spring Security. Sans ce handler, elle
    // tomberait dans le filet "Exception" ci-dessous et renverrait un 500.
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<String> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Vous n'avez pas les droits necessaires pour cette action.");
    }

    // Filet de securite final : toute erreur non prevue ci-dessus tombe
    // ici. On journalise la vraie erreur cote serveur (pour deboguer),
    // mais on renvoie un message generique au client, sans jamais exposer
    // de details internes (stack trace, noms de classes, requetes SQL...).
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleUnexpected(Exception ex) {
        log.error("Erreur interne non geree", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Une erreur interne est survenue. Merci de reessayer.");
    }
}
