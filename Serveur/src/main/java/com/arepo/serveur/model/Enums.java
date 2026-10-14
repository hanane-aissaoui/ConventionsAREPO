package com.arepo.serveur.model;

public class Enums {

    public enum StatusAgent {
        ACTIF,
        DEMISSIONNAIRE,
        EN_CONGE
    }


    public enum Role {
        ADMIN,
        AGENT
    }
    public enum TypeAction {
        TRAVAUX,
        ETUDES,
        EQUIPEMENT,
        SUIVI_CONTROLE,
        AUTRE
    }


    public enum Permission {
        // Programmes
        PROGRAMME_VIEW,
        PROGRAMME_CREATE,
        PROGRAMME_EDIT,
        PROGRAMME_DELETE,

        // Projets
        PROJET_VIEW,
        PROJET_CREATE,
        PROJET_EDIT,
        PROJET_DELETE,

        // Conventions
        CONVENTION_VIEW,
        CONVENTION_CREATE,
        CONVENTION_EDIT,
        CONVENTION_DELETE,

        // Partenaires
        PARTENAIRE_VIEW,
        PARTENAIRE_MANAGE,

        // Territoire
        TERRITOIRE_VIEW,
        TERRITOIRE_MANAGE,

        // Agents / Comptes
        AGENT_VIEW,
        AGENT_MANAGE
    }

    private Enums() {}
}