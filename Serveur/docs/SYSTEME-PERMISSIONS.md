# Système de permissions — migration du « codé en dur » vers une table en base

> But de ce document : décrire le système d'autorisation **actuel** (rôles et
> permissions figés dans le code Java) puis la **cible** (mapping rôle → permissions
> stocké en base de données), avec le schéma, les entités, les points d'intégration
> à modifier et une checklist d'implémentation.

---

## 1. État actuel (tout est codé en dur)

### 1.1 Où c'est défini

| Élément | Fichier | Rôle |
|---|---|---|
| Enum des rôles | [`model/Enums.java`](../src/main/java/com/arepo/serveur/model/Enums.java) → `Role` | `ADMIN`, `AGENT` |
| Enum des permissions | [`model/Enums.java`](../src/main/java/com/arepo/serveur/model/Enums.java) → `Permission` | ~18 codes (`PROGRAMME_VIEW`, `PROJET_CREATE`, …) |
| Mapping rôle → permissions | [`security/RolePermissions.java`](../src/main/java/com/arepo/serveur/security/RolePermissions.java) | `EnumMap<Role, Set<Permission>>` rempli dans un bloc `static` |
| Rôle stocké sur le compte | [`model/Compte.java`](../src/main/java/com/arepo/serveur/model/Compte.java) → colonne `role` (`@Enumerated(STRING)`) | un seul rôle par compte |

### 1.2 Comment c'est consommé

```
Login (AuthController.login)
  └─ CustomUserDetailsService.loadUserByUsername
       └─ new CompteUserDetails(compte)
            └─ getAuthorities() : "ROLE_ADMIN" + RolePermissions.forRole(role) → SimpleGrantedAuthority par permission
  └─ JwtService.generateToken(userDetails)
       └─ claim "role"  = ADMIN
       └─ claim "permissions" = ["PROGRAMME_VIEW", ...]   (recalculé via RolePermissions.forRole)

Requête protégée
  └─ JwtAuthenticationFilter → Authentication avec les authorities
  └─ @PreAuthorize("hasAuthority('PROGRAMME_CREATE')") sur les controllers
       (ex. ProgrammeController, PartenaireController, TerritoireController)

GET /api/auth/me
  └─ ProfileDto { role, permissions[] }  (encore RolePermissions.forRole)

Frontend (Client)
  └─ utils/auth.ts : getPermissions() lit le claim "permissions" du JWT
  └─ hasPermission("PROGRAMME_CREATE") → affiche/masque les boutons
     (ex. ProgrammesScreen.tsx)
```

### 1.3 Limites

- Changer les droits d'un rôle = **modifier `RolePermissions.java` + recompiler + redéployer**.
- Impossible de créer un nouveau rôle sans toucher au code.
- Aucune interface d'administration possible.
- Le mapping n'est pas auditable (pas d'historique, pas de « qui a changé quoi »).

---

## 2. Cible : le mapping rôle → permissions vit en base

On garde exactement le **même comportement runtime** (authorities Spring, claims JWT,
`@PreAuthorize`, `hasPermission` côté client). On déplace uniquement **la source de
vérité** : au lieu du bloc `static` de `RolePermissions.java`, on lit une table
`role_permission`.

Deux niveaux d'ambition (choisir selon le besoin) :

| Niveau | Ce qui devient dynamique | Ce qui reste figé |
|---|---|---|
| **A – minimal (recommandé pour démarrer)** | le mapping rôle → permissions (`role_permission`) | la liste des rôles (`Role` reste un enum), la liste des permissions (catalogue en base mais alimenté depuis l'enum) |
| **B – complet** | rôles **et** permissions **et** mapping, tous administrables via une UI | rien |

Le reste de ce document décrit le **niveau A**, avec les notes « pour le niveau B ».

---

## 3. Schéma de base de données

### 3.1 Tables

```sql
-- Catalogue des permissions (1 ligne par code)
CREATE TABLE permission (
    id_permission  SERIAL PRIMARY KEY,
    code           VARCHAR(64)  NOT NULL UNIQUE,   -- ex. 'PROGRAMME_CREATE'
    libelle        VARCHAR(150) NOT NULL,          -- ex. 'Créer un programme'
    module         VARCHAR(50)                     -- ex. 'PROGRAMME' (pour regrouper dans l'UI)
);

-- Catalogue des rôles
CREATE TABLE role (
    id_role   SERIAL PRIMARY KEY,
    code      VARCHAR(32)  NOT NULL UNIQUE,        -- ex. 'ADMIN', 'AGENT'
    libelle   VARCHAR(150) NOT NULL
);

-- LE mapping qui est aujourd'hui dans RolePermissions.java
CREATE TABLE role_permission (
    id_role        INTEGER NOT NULL REFERENCES role(id_role)             ON DELETE CASCADE,
    id_permission  INTEGER NOT NULL REFERENCES permission(id_permission) ON DELETE CASCADE,
    PRIMARY KEY (id_role, id_permission)
);
```

### 3.2 Lien avec `compte`

- **Niveau A** : on ne touche pas à `compte`. La colonne `role` (enum texte
  `ADMIN` / `AGENT`) sert de clé de jointure logique vers `role.code`.
- **Niveau B** : remplacer la colonne `role` texte par `id_role INTEGER REFERENCES role(id_role)`.
- **Option (les deux niveaux)** : table `compte_permission (id_compte, id_permission, accorde BOOLEAN)`
  pour des dérogations individuelles (ajouter/retirer une permission à **un** utilisateur).
  Résolution finale = `permissions(rôle) ∪ accordées(compte) \ retirées(compte)`.

### 3.3 Gestion des migrations

Aujourd'hui : `spring.jpa.hibernate.ddl-auto=update` et **aucun outil de migration**.

Pour livrer ces tables proprement, introduire **Flyway** :

```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
</dependency>
```

```properties
# application.properties
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
spring.jpa.hibernate.ddl-auto=validate   # on arrête de laisser Hibernate créer le schéma
```

Fichiers :

```
src/main/resources/db/migration/
  V1__baseline.sql               -- schéma existant (généré depuis la base actuelle)
  V2__permissions_tables.sql     -- les 3 tables ci-dessus
  V3__permissions_seed.sql       -- données initiales (voir §6)
```

> Si Flyway n'est pas retenu, on peut garder `ddl-auto=update` et faire créer les
> tables par les entités JPA, puis insérer le seed via un `CommandLineRunner`
> exécuté au démarrage (idempotent). C'est moins propre mais plus rapide.

---

## 4. Entités JPA (niveau A)

```java
// model/Permission.java
@Entity @Table(name = "permission")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Permission {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_permission")
    private Integer id;

    @Column(nullable = false, unique = true, length = 64)
    private String code;

    @Column(nullable = false, length = 150)
    private String libelle;

    @Column(length = 50)
    private String module;
}
```

```java
// model/Role.java   (entité — l'enum Enums.Role peut être conservé en parallèle le temps de la bascule)
@Entity @Table(name = "role")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Role {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_role")
    private Integer id;

    @Column(nullable = false, unique = true, length = 32)
    private String code;

    @Column(nullable = false, length = 150)
    private String libelle;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "role_permission",
        joinColumns = @JoinColumn(name = "id_role"),
        inverseJoinColumns = @JoinColumn(name = "id_permission"))
    private Set<Permission> permissions = new HashSet<>();
}
```

---

## 5. Repositories + service (le remplaçant de `RolePermissions`)

```java
// repository/RoleRepository.java
public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByCode(String code);
}
```

```java
// repository/PermissionRepository.java
public interface PermissionRepository extends JpaRepository<Permission, Integer> {
    Optional<Permission> findByCode(String code);
}
```

```java
// security/PermissionResolver.java
// Remplace RolePermissions.forRole(...). C'est un bean Spring (contrairement à
// l'ancienne classe utilitaire statique) : il peut donc injecter les repositories
// et poser un cache.
@Service
public class PermissionResolver {

    private final RoleRepository roleRepository;

    public PermissionResolver(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    /** Codes de permissions accordés au rôle passé (ex. "ADMIN"). */
    @Cacheable("permissionsByRole")
    public Set<String> permissionsForRole(String roleCode) {
        return roleRepository.findByCode(roleCode)
                .map(r -> r.getPermissions().stream()
                        .map(Permission::getCode)
                        .collect(Collectors.toUnmodifiableSet()))
                .orElse(Set.of());
    }

    /** À appeler après toute modification d'un rôle depuis l'UI d'admin. */
    @CacheEvict(value = "permissionsByRole", allEntries = true)
    public void invalidateCache() { }
}
```

Activer le cache : `@EnableCaching` sur une classe de config (cache mémoire simple
suffisant ici, `ConcurrentMapCacheManager` par défaut).

---

## 6. Migration des données : reproduire l'existant

Le seed **doit produire exactement le mapping actuel** de `RolePermissions.java`,
sinon des droits changent au déploiement.

`V3__permissions_seed.sql` :

```sql
-- 1. Catalogue des permissions (recopie de Enums.Permission)
INSERT INTO permission (code, libelle, module) VALUES
 ('PROGRAMME_VIEW',    'Consulter les programmes',        'PROGRAMME'),
 ('PROGRAMME_CREATE',  'Créer un programme',              'PROGRAMME'),
 ('PROGRAMME_EDIT',    'Modifier un programme',           'PROGRAMME'),
 ('PROGRAMME_DELETE',  'Supprimer un programme',          'PROGRAMME'),
 ('PROJET_VIEW',       'Consulter les projets',           'PROJET'),
 ('PROJET_CREATE',     'Créer un projet',                 'PROJET'),
 ('PROJET_EDIT',       'Modifier un projet',              'PROJET'),
 ('PROJET_DELETE',     'Supprimer un projet',             'PROJET'),
 ('CONVENTION_VIEW',   'Consulter les conventions',       'CONVENTION'),
 ('CONVENTION_CREATE', 'Créer une convention',            'CONVENTION'),
 ('CONVENTION_EDIT',   'Modifier une convention',         'CONVENTION'),
 ('CONVENTION_DELETE', 'Supprimer une convention',        'CONVENTION'),
 ('PARTENAIRE_VIEW',   'Consulter les partenaires',       'PARTENAIRE'),
 ('PARTENAIRE_MANAGE', 'Gérer les partenaires',           'PARTENAIRE'),
 ('TERRITOIRE_VIEW',   'Consulter le territoire',         'TERRITOIRE'),
 ('TERRITOIRE_MANAGE', 'Gérer le territoire',             'TERRITOIRE'),
 ('AGENT_VIEW',        'Consulter les agents/comptes',    'AGENT'),
 ('AGENT_MANAGE',      'Gérer les agents/comptes',        'AGENT');

-- 2. Rôles (recopie de Enums.Role)
INSERT INTO role (code, libelle) VALUES
 ('ADMIN', 'Administrateur'),
 ('AGENT', 'Agent');

-- 3. Mapping ADMIN = toutes les permissions
INSERT INTO role_permission (id_role, id_permission)
SELECT r.id_role, p.id_permission
FROM role r CROSS JOIN permission p
WHERE r.code = 'ADMIN';

-- 4. Mapping AGENT = sous-ensemble (identique à RolePermissions.java aujourd'hui)
INSERT INTO role_permission (id_role, id_permission)
SELECT r.id_role, p.id_permission
FROM role r JOIN permission p ON p.code IN (
    'PROGRAMME_VIEW','PROGRAMME_EDIT',
    'PROJET_VIEW','PROJET_CREATE','PROJET_EDIT',
    'CONVENTION_VIEW','CONVENTION_CREATE','CONVENTION_EDIT',
    'PARTENAIRE_VIEW',
    'TERRITOIRE_VIEW'
)
WHERE r.code = 'AGENT';
```

> ⚠️ Vérifier ce sous-ensemble AGENT dans `RolePermissions.java` au moment de la
> migration : c'est la référence, ce document peut avoir divergé.

---

## 7. Points d'intégration à modifier

| Fichier | Aujourd'hui | Après |
|---|---|---|
| [`security/RolePermissions.java`](../src/main/java/com/arepo/serveur/security/RolePermissions.java) | `EnumMap` statique | **supprimé** (ou conservé en fallback le temps de la bascule) |
| [`security/CompteUserDetails.java`](../src/main/java/com/arepo/serveur/security/CompteUserDetails.java) | `getAuthorities()` appelle `RolePermissions.forRole` | reçoit les codes de permissions **dans son constructeur** (voir ci-dessous) |
| [`security/CustomUserDetailsService.java`](../src/main/java/com/arepo/serveur/security/CustomUserDetailsService.java) | `new CompteUserDetails(compte)` | injecte `PermissionResolver`, résout les permissions et les passe : `new CompteUserDetails(compte, resolver.permissionsForRole(compte.getRole().name()))` |
| [`security/JwtService.java`](../src/main/java/com/arepo/serveur/security/JwtService.java) | recalcule via `RolePermissions.forRole` | lit `compteUserDetails.getPermissionCodes()` (déjà résolues) |
| [`controller/AuthController.java`](../src/main/java/com/arepo/serveur/controller/AuthController.java) `/me` | `RolePermissions.forRole` | `permissionResolver.permissionsForRole(role)` |
| Controllers (`@PreAuthorize("hasAuthority('X')")`) | — | **inchangés** : les authorities portent toujours le même code |
| Client `utils/auth.ts`, écrans | — | **inchangés** : le claim `permissions` du JWT garde le même format |

`CompteUserDetails` — devient un simple porteur de données, plus aucune logique métier :

```java
public class CompteUserDetails implements UserDetails {
    private final Compte compte;
    private final Set<String> permissionCodes;   // résolues en amont

    public CompteUserDetails(Compte compte, Set<String> permissionCodes) {
        this.compte = compte;
        this.permissionCodes = permissionCodes;
    }

    public Set<String> getPermissionCodes() { return permissionCodes; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Stream.concat(
                    Stream.of("ROLE_" + compte.getRole().name()),
                    permissionCodes.stream())
                .map(SimpleGrantedAuthority::new)
                .toList();
    }
    // ... reste inchangé
}
```

> Pourquoi résoudre dans `CustomUserDetailsService` et pas dans `CompteUserDetails` ?
> `CompteUserDetails` est instancié avec `new`, ce n'est pas un bean : il ne peut pas
> injecter de repository. `CustomUserDetailsService`, lui, est un `@Service`.

---

## 8. Points d'attention

- **JWT figé** : les permissions sont copiées dans le token à la connexion. Si un
  admin change les droits d'un rôle, les utilisateurs déjà connectés gardent leurs
  anciennes permissions jusqu'à expiration (`jwt.expiration=3600000` = 1 h) ou
  reconnexion. Acceptable ici ; sinon raccourcir l'expiration ou revérifier en base
  à chaque requête (plus coûteux).
- **Cache** : `PermissionResolver` met en cache par rôle. Toute écriture depuis
  l'UI d'admin **doit** appeler `invalidateCache()`.
- **Cohérence enum / base** : tant que `@PreAuthorize` utilise des chaînes en dur
  (`'PROGRAMME_CREATE'`), garder l'enum `Permission` comme liste de référence et
  vérifier au démarrage que chaque valeur de l'enum existe en base (log d'alerte
  sinon).
- **Rôle inconnu** : si `role.code` du compte n'a aucune ligne dans `role`,
  `permissionsForRole` renvoie `Set.of()` → l'utilisateur n'a que `ROLE_xxx` et
  aucune permission. Prévoir un log.
- **Suppression d'un rôle utilisé** : interdire côté service si des comptes le
  portent encore.

---

## 9. Checklist d'implémentation

- [ ] Ajouter Flyway + `V1__baseline.sql` (dump du schéma actuel), passer `ddl-auto` à `validate`
- [ ] `V2__permissions_tables.sql` : tables `permission`, `role`, `role_permission`
- [ ] `V3__permissions_seed.sql` : seed **conforme à `RolePermissions.java`**
- [ ] Entités `Permission`, `Role` + repositories
- [ ] `PermissionResolver` (`@Service` + `@Cacheable`) + `@EnableCaching`
- [ ] `CompteUserDetails` : constructeur avec `Set<String> permissionCodes`
- [ ] `CustomUserDetailsService` : injecter le resolver, résoudre, passer au constructeur
- [ ] `JwtService` : lire `getPermissionCodes()` au lieu de `RolePermissions.forRole`
- [ ] `AuthController#me` : idem via `PermissionResolver`
- [ ] Supprimer `RolePermissions.java` (ou le garder en fallback temporaire)
- [ ] Test : login ADMIN → JWT contient les 18 permissions ; login AGENT → les 10 attendues
- [ ] Test : `@PreAuthorize` renvoie toujours 403 quand la permission manque
- [ ] Vérifier que le Client (`hasPermission`) fonctionne sans modification
- [ ] (Niveau B) endpoints d'admin `GET/PUT /api/roles/{code}/permissions` + `invalidateCache()`
- [ ] (Niveau B) écran d'administration des rôles côté Client

---

## 10. Pour aller plus loin (niveau B)

- Colonne `compte.id_role` (FK) à la place de l'enum texte.
- Table `compte_permission` pour les dérogations par utilisateur.
- Endpoints REST d'administration :
  - `GET  /api/permissions` — catalogue (pour cocher dans l'UI)
  - `GET  /api/roles` / `POST /api/roles` / `PUT /api/roles/{id}`
  - `PUT  /api/roles/{id}/permissions` — remplace la liste, puis `invalidateCache()`
- Traçabilité : colonnes `date_modif`, `modifie_par` sur `role_permission`, ou table
  d'audit dédiée.
