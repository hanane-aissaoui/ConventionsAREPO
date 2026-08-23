package com.arepo.serveur.exception;

<<<<<<< HEAD
/**
 * Levee quand une ressource demandee (par id) n'existe pas en base.
 * Interceptee par GlobalExceptionHandler pour renvoyer un 404 propre.
 */
=======

>>>>>>> e44b437 (ajout sidebar,programme,programme detail)
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
