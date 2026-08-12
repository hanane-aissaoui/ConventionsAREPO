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



    private Enums() {}
}