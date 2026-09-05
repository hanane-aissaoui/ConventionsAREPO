# ConventionsAREPO

Web application for managing the development programmes, territorialized projects,
partnership conventions and public contracts of the **Région de l'Oriental** (Morocco),
built for the *Agence Régionale d'Exécution des Projets de l'Oriental* (AREPO).

It replaces the scattered spreadsheet-based tracking with a single, consistent database:
a hierarchical territorial reference (region → prefecture/province → commune), full
management of programmes and projects, partner conventions (framework and project-specific),
contracts per project, and a consolidated steering dashboard.

**English** | [Français](#français)

---

## Overview

The system is split into two applications that communicate over a REST API:

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, Redux Toolkit, React Router 7, Axios, Recharts, Tailwind CSS |
| Backend | Java 25, Spring Boot 4.1 (Web MVC, Data JPA / Hibernate, Security, Bean Validation) |
| Authentication | JSON Web Token (jjwt 0.12.6) + BCrypt password hashing |
| Database | PostgreSQL (schema managed by Hibernate) |

### Main features

- **Authentication & roles** — stateless JWT auth; two roles (`ADMIN`, `AGENT`) refined
  into per-module permissions, checked on the server on every request.
- **Territorial reference** — three-level tree (region / prefecture-province / commune),
  case-insensitive duplicate detection, cascade delete of descendants.
- **Programmes** — CRUD with server-side pagination and search; detail view groups the
  programme's projects by prefecture and lists its framework conventions.
- **Projects** — CRUD with multi-criteria search (project name, parent programme,
  prefecture); status picked from a fixed list; detail view computes the average physical
  and financial progress from the project's contracts.
- **Partners & conventions** — partner directory; a *framework* convention links a partner
  to a programme, a *specific* convention links a partner to a project, both carrying the
  contributed amount, released amount, state and participation date.
- **Contracts (marchés)** — per project: action type, contractor, engaged amount,
  estimate, physical and financial progress, period.
- **Dashboard** — six key indicators and two charts (contribution per partner, projects
  by status).
- **Centralized error handling** — clean HTTP responses (404, 409, 400, 403); unexpected
  errors are logged server-side and never leak internal details to the client.

## Project structure

```
ConventionsAREPO/
├── Client/     React + Vite frontend
└── Serveur/    Spring Boot backend (REST API)
```

## Prerequisites

- JDK 25
- Node.js 20.19+ (or 22.12+)
- PostgreSQL 14+

## Getting started

### Backend

1. Create the database:

   ```sql
   CREATE DATABASE conventions_arepo;
   ```

2. Create `Serveur/src/main/resources/application.properties` (this file is git-ignored
   because it holds credentials):

   ```properties
   server.port=8081

   spring.datasource.url=jdbc:postgresql://localhost:5432/conventions_arepo
   spring.datasource.username=your_db_user
   spring.datasource.password=your_db_password

   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true

   jwt.secret=replace_with_a_long_random_secret_key
   jwt.expiration=3600000
   ```

3. Run the API:

   ```bash
   cd Serveur
   ./mvnw spring-boot:run
   ```

   The API starts on `http://localhost:8081`. Hibernate creates and updates the schema
   automatically from the JPA entities.

### Frontend

```bash
cd Client
npm install
npm run dev
```

The development server runs on `http://localhost:5173` and calls the API on port 8081.

## Build

```bash
# Backend — produces a WAR in Serveur/target/
cd Serveur && ./mvnw clean package

# Frontend — produces static files in Client/dist/
cd Client && npm run build
```

## API

All routes are prefixed with `/api`. Every route except `POST /api/auth/login` requires a
valid `Authorization: Bearer <token>` header.

| Endpoint | Description |
|---|---|
| `POST /api/auth/login` | Authenticate, returns a JWT |
| `GET /api/auth/me` | Current user's profile |
| `GET /api/territoire/hierarchie` | Full territorial tree |
| `/api/programmes` | Programmes (list with `page`, `size`, search) |
| `/api/projets` | Projects (list with search, detail, CRUD) |
| `/api/partenaires` | Partners |
| `/api/conventions-cadre`, `/api/conventions-specifiques` | Conventions |
| `/api/marches` | Contracts |

## Authors

- **Hanane Aissaoui**
- **Maryam Chtioui**

End-of-year internship project (PFA) — École Nationale des Sciences Appliquées d'Oujda
(ENSAO), academic year 2025–2026, carried out at AREPO.

---

## Français

Application web de gestion des programmes de développement, des projets territorialisés,
des conventions de partenariat et des marchés de la **Région de l'Oriental**, réalisée
pour l'*Agence Régionale d'Exécution des Projets de l'Oriental* (AREPO).

Elle remplace le suivi éclaté par fichiers bureautiques par une base de données unique et
cohérente : un référentiel territorial hiérarchique (région → préfecture/province →
commune), la gestion complète des programmes et des projets, les conventions de partenaires
(cadre et spécifiques), les marchés par projet, et un tableau de bord de pilotage
consolidé.

[English](#conventionsarepo) | **Français**

### Présentation

Le système est découpé en deux applications qui communiquent via une API REST :

| Couche | Technologie |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, Redux Toolkit, React Router 7, Axios, Recharts, Tailwind CSS |
| Backend | Java 25, Spring Boot 4.1 (Web MVC, Data JPA / Hibernate, Security, Bean Validation) |
| Authentification | JSON Web Token (jjwt 0.12.6) + hachage BCrypt |
| Base de données | PostgreSQL (schéma géré par Hibernate) |

### Principales fonctionnalités

- **Authentification et rôles** — authentification JWT sans état ; deux rôles (`ADMIN`,
  `AGENT`) déclinés en permissions par module, vérifiées côté serveur à chaque requête.
- **Référentiel territorial** — arborescence à trois niveaux (région / préfecture-province
  / commune), détection des doublons insensible à la casse, suppression en cascade des
  descendants.
- **Programmes** — CRUD avec pagination et recherche côté serveur ; la fiche regroupe les
  projets du programme par préfecture et liste ses conventions cadre.
- **Projets** — CRUD avec recherche multi-critères (nom du projet, programme parent,
  préfecture) ; statut choisi dans une liste fixe ; la fiche calcule l'avancement physique
  et financier moyen à partir des marchés du projet.
- **Partenaires et conventions** — annuaire des partenaires ; une convention *cadre* relie
  un partenaire à un programme, une convention *spécifique* relie un partenaire à un
  projet, toutes deux portant le montant contribué, le montant débloqué, l'état et la date
  de participation.
- **Marchés** — par projet : type d'action, attributaire, montant engagé, estimation,
  avancement physique et financier, période.
- **Tableau de bord** — six indicateurs clés et deux graphiques (contribution par
  partenaire, répartition des projets par statut).
- **Gestion centralisée des erreurs** — réponses HTTP propres (404, 409, 400, 403) ; les
  erreurs imprévues sont journalisées côté serveur et n'exposent jamais de détail interne
  au client.

### Structure du projet

```
ConventionsAREPO/
├── Client/     Frontend React + Vite
└── Serveur/    Backend Spring Boot (API REST)
```

### Prérequis

- JDK 25
- Node.js 20.19+ (ou 22.12+)
- PostgreSQL 14+

### Démarrage

#### Backend

1. Créer la base de données :

   ```sql
   CREATE DATABASE conventions_arepo;
   ```

2. Créer le fichier `Serveur/src/main/resources/application.properties` (ignoré par Git
   car il contient des identifiants) :

   ```properties
   server.port=8081

   spring.datasource.url=jdbc:postgresql://localhost:5432/conventions_arepo
   spring.datasource.username=votre_utilisateur
   spring.datasource.password=votre_mot_de_passe

   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true

   jwt.secret=remplacer_par_une_cle_secrete_longue_et_aleatoire
   jwt.expiration=3600000
   ```

3. Lancer l'API :

   ```bash
   cd Serveur
   ./mvnw spring-boot:run
   ```

   L'API démarre sur `http://localhost:8081`. Hibernate crée et met à jour le schéma
   automatiquement à partir des entités JPA.

#### Frontend

```bash
cd Client
npm install
npm run dev
```

Le serveur de développement tourne sur `http://localhost:5173` et appelle l'API sur le
port 8081.

### Compilation

```bash
# Backend — produit un WAR dans Serveur/target/
cd Serveur && ./mvnw clean package

# Frontend — produit des fichiers statiques dans Client/dist/
cd Client && npm run build
```

### API

Toutes les routes sont préfixées par `/api`. Toute route autre que
`POST /api/auth/login` exige un en-tête `Authorization: Bearer <token>` valide.

| Endpoint | Description |
|---|---|
| `POST /api/auth/login` | Authentification, renvoie un JWT |
| `GET /api/auth/me` | Profil de l'utilisateur courant |
| `GET /api/territoire/hierarchie` | Arbre territorial complet |
| `/api/programmes` | Programmes (liste avec `page`, `size`, recherche) |
| `/api/projets` | Projets (liste avec recherche, fiche, CRUD) |
| `/api/partenaires` | Partenaires |
| `/api/conventions-cadre`, `/api/conventions-specifiques` | Conventions |
| `/api/marches` | Marchés |

### Auteurs

- **Hanane Aissaoui**
- **Maryam Chtioui**

Projet de stage de fin d'année (PFA) — École Nationale des Sciences Appliquées d'Oujda
(ENSAO), année universitaire 2025–2026, réalisé au sein de l'AREPO.
