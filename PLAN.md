# Plan de réalisation — démo front Lacroix-Falgarde

Objectif : une démo **cliquable de bout en bout** du parcours de réservation, fidèle au wireframe Balsamiq
[UserFlow](https://balsamiq.cloud/siqzvs5/p9fetpl/rE50F). Pas de vraie authentification.
La demande en cours de saisie vit en mémoire (`DemandeContext`) ; une fois envoyée, elle est enregistrée dans une base
**SQLite locale** (`server/reservations.db`), que lisent le suivi, le back-office et le planning.
Le catalogue (salles, matériel, pièces requises) reste dans `src/data/mock.js`, partagé par le front et le serveur.

**Règle d'or : le parcours principal doit fonctionner avant de peaufiner quoi que ce soit.**

## Stack

| Outil | Pourquoi |
| --- | --- |
| Vite + React 19 (JS) | Démarrage instantané, rechargement à chaud |
| Tailwind CSS v4 | Mise en forme directement dans le JSX, pas de fichier CSS à maintenir |
| React Router | Une URL par écran, le stepper est une simple suite de liens |
| Context React | Une seule demande en cours, partagée entre les étapes |
| SQLite (`node:sqlite`, intégré à Node ≥ 22.13) | Demandes, matériel réservé, pièces et messages persistants, sans dépendance à installer |
| API JSON dans Vite (`server/plugin.js`) | Servie sous `/api` par `npm run dev` et `npm run preview` : une seule commande à lancer |

Pas de librairie de composants ni de gestion de formulaires : les écrans sont simples, du HTML + Tailwind suffit.

## Ce qui est déjà en place

- Toutes les routes, le header, le stepper des 6 étapes et l'encart « Votre demande » (total calculé).
- Une page squelette par écran du wireframe, avec en commentaire la liste de ce qu'elle doit contenir.
- Le parcours est déjà navigable de l'accueil jusqu'au back-office.
- Les données fictives : salles, matériel, jours indisponibles, pièces, demandes côté mairie.

## Arborescence

```
src/
  App.jsx                  routes
  context/DemandeContext   état de la demande : useDemande() → { demande, update, reset }
  data/mock.js             catalogue : salles, matériel, options, profils, pièces requises
  data/api.js              appels à l'API (/api)
  data/calculs.js          calcul du total
  data/dates.js            dates et heures au format français
  hooks/useTitre.js        titre de l'onglet, page par page
  hooks/useChargement.js   chargement d'une ressource de l'API
  components/              Layout (header), Stepper, RecapDemande, Statut
  pages/
    Accueil, Recherche, Confirmation, Suivi
    reservation/           Salle, Materiel, Vous, Evenement, Pieces, Envoi
    admin/                 AdminLayout (menu), AdminDemandes, AdminPlanning
server/
  db.js                    schéma SQLite + jeu de départ (12 demandes, novembre-décembre 2026)
  demandes.js              règles : validations, créneaux, stock, contrôles automatiques, statuts
  api.js                   routes HTTP JSON
  plugin.js                branche l'API dans Vite
  reset.js                 npm run db:reset
```

## API (`/api`)

| Méthode | Route | Rôle |
| --- | --- | --- |
| GET | `/salles/:id/disponibilites` | Jours déjà pris pour une salle (toute demande non refusée) |
| GET | `/stock?date=AAAA-MM-JJ` | Matériel déjà réservé ce jour-là |
| GET | `/demandes[?email=…]` | Liste complète, ou les demandes d'un e-mail (suivi) |
| POST | `/demandes` | Envoi : revérifie salle, date libre, stock, nom, e-mail, buvette ; renvoie le numéro |
| GET | `/demandes/:numero` | Détail : matériel, pièces, messages, contrôles automatiques |
| PATCH | `/demandes/:numero` | Changer le statut (accord refusé si pièces ou buvette incomplètes) |
| POST | `/demandes/:numero/pieces` | Ajouter une pièce (le dossier complet repasse « À instruire ») |
| POST | `/demandes/:numero/messages` | Message de l'habitant ou de la mairie |
| GET | `/planning` | Réservations non refusées, pour le calendrier des salles |

## Écrans → routes

| # | Écran du wireframe | Route | Fichier |
| --- | --- | --- | --- |
| 1 | Accueil | `/` | `pages/Accueil.jsx` |
| 2 | Recherche + liste des salles | `/recherche` | `pages/Recherche.jsx` |
| 3 | Salle + calendrier | `/reservation/salle` | `reservation/Salle.jsx` |
| 4 | Matériel | `/reservation/materiel` | `reservation/Materiel.jsx` |
| 5 | Vous (identification) | `/reservation/vous` | `reservation/Vous.jsx` |
| 6 | Événement + question buvette | `/reservation/evenement` | `reservation/Evenement.jsx` |
| 7 | Pièces (variante avec ou sans buvette) | `/reservation/pieces` | `reservation/Pieces.jsx` |
| 8 | Envoi (récapitulatif) | `/reservation/envoi` | `reservation/Envoi.jsx` |
| 9 | Demande envoyée | `/confirmation` | `pages/Confirmation.jsx` |
| 10 | Suivi de la demande | `/mes-demandes` | `pages/Suivi.jsx` |
| 11 | Back-office mairie | `/admin` (`?dossier=RES-…` ouvre un dossier) | `admin/AdminDemandes.jsx` |
| 12 | Calendrier des salles (planning global) | `/admin/planning` | `admin/AdminPlanning.jsx` |

## Étapes de réalisation

Un prompt IA prêt à l'emploi pour chaque étape se trouve dans [PROMPTS.md](PROMPTS.md).

### Étape 0 — Composants de base (≈ 30 min, 1 personne)
Créer dans `src/components/ui/` : `Button` (variantes principale, secondaire, contour), `Input`, `Select`, `Checkbox`,
`Card`. Tous les écrans les réutilisent, donc à faire **en premier**.

### Étape 1 — Parcours principal (≈ 3 h, à répartir)
Chaque page lit et écrit la demande avec `const { demande, update } = useDemande()`.

| Lot | Écrans | Points d'attention |
| --- | --- | --- |
| A | Accueil, Recherche | La recherche filtre `salles` par `capacite >= participants`. « Voir » fait `update({ salleId })`. |
| B | Salle, Matériel | Calendrier = grille CSS de 7 colonnes faite à la main (pas de librairie), jours de `joursIndisponibles` grisés. Quantités bornées par le stock. |
| C | Vous, Événement | « Se connecter » pré-remplit un faux usager. La réponse buvette va dans `demande.evenement.buvette`. |
| D | Pièces, Envoi, Confirmation | Envoi des fichiers simulé (on garde le nom du fichier). Le bloc buvette s'affiche si `buvette === true`. Envoyer génère `RES-2026-0142`. |

Les lots sont indépendants : quatre personnes peuvent travailler en parallèle sans conflits, chacune sur ses fichiers.

### Étape 2 — Après l'envoi (≈ 1 h 30)
- **Suivi** : onglets, carte du dossier avec « pièce manquante », échanges avec la mairie (messages en mémoire), préférences e-mail / SMS.
- **Back-office** : menu latéral (seul « Demandes » est actif), tableau `demandesAdmin`, onglets de statut qui filtrent
  le tableau, panneau de détail au clic sur une ligne avec contrôles automatiques et boutons Accorder / Demander une pièce / Refuser
  (changent le statut en mémoire).

### Étape 3 — Finitions de démo (≈ 1 h)
- Responsive mobile : l'encart récapitulatif passe sous le formulaire (déjà prévu par `md:grid-cols`).
- États vides et validations minimales (bouton Continuer désactivé si la salle ou la date manque).
- Accessibilité de base : `label` sur chaque champ, focus visible, contrastes.
- Un **scénario de démo** écrit (Julien, Foyer rural, 21 novembre 2026, avec buvette) qu'on répète deux fois avant de présenter.

### Étape 4 — Persistance et planning
- **SQLite** : l'envoi enregistre la demande ; le calendrier grise les jours réellement pris, le matériel affiche
  le stock restant à la date, et le serveur refuse un créneau ou un stock déjà pris entre-temps.
- **Suivi** : lit la base (par e-mail si connecté, sinon le dernier dossier envoyé ou un numéro saisi) ;
  pièce ajoutée et messages enregistrés.
- **Back-office** : demandes et détail complet depuis la base, contrôles automatiques calculés (créneau, capacité, stock),
  réponses de la mairie, changement de statut avec message automatique au demandeur.
- **Calendrier des salles** : grille salles × jours du mois, couleur par état, clic → dossier ; liste du mois en dessous.

### Hors périmètre
Vraie authentification (l'API est ouverte, c'est une démo locale), envoi d'e-mails ou de SMS, téléversement réel
des fichiers (seul le nom est gardé), export Excel réel, écrans stock / salles / usagers côté mairie
(entrées de menu sans contenu).

## Conventions
- Textes de l'interface en français ; noms de fichiers et de composants en français, comme les écrans.
- Une branche par lot (`lot-a-accueil`, …), on fusionne dans `main` dès que la page fonctionne.
- Avant de pousser : `npm run lint` et `npm run build`.

## Définition de « terminé » pour la démo
Le scénario va de l'accueil jusqu'à la confirmation sans erreur, le total se met à jour, la variante buvette
fonctionne, le suivi et le back-office affichent le dossier, et tout reste lisible sur mobile.

## Scénario de démo

Parcours de Julien, habitant : Foyer rural, samedi 21 novembre 2026, 30 personnes, 5 tables et 8 bancs, avec buvette.
À répéter deux fois avant de présenter. Préparer deux petits fichiers sur le bureau (`identite.pdf`, `domicile.pdf`)
et un troisième pour la fin (`assurance.pdf`). Avant de commencer : `npm run db:reset` (remet les 12 demandes
de départ et efface celles des répétitions), puis recharger la page.

**Côté habitant**

1. **Accueil** (`/`) : cliquer **Réserver une salle**.
2. **Recherche** : la date (21/11/2026), les 30 participants et le profil Habitant sont déjà remplis ; le montrer,
   puis cliquer **Voir** sur la carte *Foyer rural*.
3. **Salle** : montrer les jours grisés, déjà réservés en base (7, 8, 14, 15, 28 et 29 novembre), et le 21 surligné en jaune.
   Cliquer **21**, puis **Continuer**.
4. **Matériel** : *Tables intérieures* → saisir **5** (ou cliquer cinq fois sur **+**) ; *Bancs* → saisir **8**.
   Faire remarquer « 12 dispo » sur les tables : 6 sont déjà prises ce jour-là par une autre demande.
   L'encart affiche « 5 tables intérieures, 8 bancs » et le total 250 €. Cliquer **Continuer**.
5. **Vous** : faire remarquer que **Continuer** est grisé avec la phrase « Renseignez votre nom et votre e-mail… ».
   Cliquer **Se connecter** (dans la page) : « Connecté en tant que Julien Particulier ». Cliquer **Continuer**.
6. **Événement** : *Type d'événement* → **Fête familiale** ; laisser 30 participants et 10 h – 23 h ;
   *Buvette ?* → **Oui**. Cliquer **Continuer**.
7. **Pièces** : *Pièce d'identité* → **Choisir un fichier** → `identite.pdf` ;
   *Justificatif de domicile* → **Choisir un fichier** → `domicile.pdf` ; laisser l'attestation d'assurance vide.
   Bloc *Buvette* : montrer que **Continuer** est grisé tant que ce n'est pas fait ; ouvrir **Consulter le formulaire (PDF)**,
   cocher **J'ai lu les conditions…**, signer dans le cadre. L'encart indique « Pièces : 2 sur 3 ».
   Cliquer **Continuer**.
8. **Envoi** : relire le récapitulatif (samedi 21 novembre 2026, de 10 h à 23 h · avec buvette · 2 sur 3),
   ouvrir **Info caution**, puis cliquer **Envoyer ma demande**.
9. **Confirmation** : « N° de dossier RES-2026-0142 ». Cliquer **Suivre ma demande**.
10. **Mes demandes** : montrer « Pièce manquante : attestation d'assurance » et le message automatique de la mairie.
    Écrire « Je vous l'envoie ce soir. » puis **Envoyer**. Cliquer **Voir côté mairie**.

**Côté mairie — fin A : refus**

11. **Back-office** : cliquer l'onglet **Pièces manquantes**, puis la ligne **RES-2026-0142 · Julien Particulier**.
12. Le détail montre les contrôles automatiques, l'attestation d'assurance « Manquante », le message de Julien
    et **Accorder (dossier incomplet)** grisé.
13. Cliquer **Refuser** : « Demande RES-2026-0142 refusée. » ; la ligne passe dans l'onglet **Refusées**,
    et le 21 novembre redevient libre pour le Foyer rural.

**Côté mairie — fin B : accord** (à la place des étapes 11 à 13)

11. Dans **Mes demandes**, cliquer **Ajouter la pièce** → `assurance.pdf` : le statut passe à « Instruction en cours ».
    Cliquer **Voir côté mairie**.
12. **Back-office** : la demande de Julien est dans l'onglet **À traiter** (pièces « Complet ») ; cliquer sa ligne.
13. Cliquer **Accorder** : « Demande RES-2026-0142 accordée. » ; la ligne passe dans l'onglet **Accordées**
    et un message de la mairie est ajouté aux échanges (visible dans **Mes demandes**).

**Planning global** (après l'une des deux fins)

14. Dans le menu du back-office, cliquer **Calendrier des salles** : novembre 2026 s'affiche, une ligne par salle.
    Montrer la légende et la case « JP » du Foyer rural le 21 (verte si accordée), puis cliquer dessus : le dossier de Julien s'ouvre.

Pour rejouer le scénario : `npm run db:reset`, puis recharger la page (F5).
