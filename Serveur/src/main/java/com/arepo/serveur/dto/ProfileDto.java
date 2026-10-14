package com.arepo.serveur.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDto {
    String nom;
    String prenom;
    String email;
    String grade;
    String cin;
    String telephone;
    String role;
    List<String> permissions;
}