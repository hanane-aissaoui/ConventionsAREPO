package com.arepo.serveur.exception;

/**
 * Levee quand une ressource demandee (par id) n'existe pas en base.
 * Interceptee par GlobalExceptionHandler pour renvoyer un 404 propre.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
