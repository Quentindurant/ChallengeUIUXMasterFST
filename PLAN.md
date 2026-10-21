# Plan de réalisation — démo front Lacroix-Falgarde

Objectif : une démo **cliquable de bout en bout** du parcours de réservation, fidèle au wireframe Balsamiq
[UserFlow](https://balsamiq.cloud/siqzvs5/p9fetpl/rE50F). Front uniquement : pas d'API, pas de base de données,
pas de vraie authentification. Tout vient de `src/data/mock.js` et vit en mémoire (`DemandeContext`).

**Règle d'or : le parcours principal doit fonctionner avant de peaufiner quoi que ce soit.**

## Stack

| Outil | Pourquoi |
| --- | --- |
| Vite + React 19 (JS) | Démarrage instantané, rechargement à chaud |
| Tailwind CSS v4 | Mise en forme directement dans le JSX, pas de fichier CSS à maintenir |
| React Router | Une URL par écran, le stepper est une simple suite de liens |
| Context React | Une seule demande en cours, partagée entre les étapes |

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
  data/mock.js             données fictives
  data/calculs.js          calcul du total
  data/dates.js            dates et heures au format français
  hooks/useTitre.js        titre de l'onglet, page par page
  components/              Layout (header), Stepper, RecapDemande
  pages/
    Accueil, Recherche, Confirmation, Suivi
    reservation/           Salle, Materiel, Vous, Evenement, Pieces, Envoi
    admin/AdminDemandes    back-office mairie
```

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
| 11 | Back-office mairie | `/admin` | `admin/AdminDemandes.jsx` |

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

### Hors périmètre
Vraie authentification, persistance, envoi d'e-mails ou de SMS, export Excel réel, calendrier et stock côté mairie
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
et un troisième pour la fin (`assurance.pdf`). Recharger la page avant de commencer : tout est en mémoire.

**Côté habitant**

1. **Accueil** (`/`) : cliquer **Réserver une salle**.
2. **Recherche** : la date (21/11/2026), les 30 participants et le profil Habitant sont déjà remplis ; le montrer,
   puis cliquer **Voir** sur la carte *Foyer rural*.
3. **Salle** : montrer les jours grisés (7, 8, 14, 15, 28 et 29 novembre) et le 21 surligné en jaune.
   Cliquer **21**, puis **Continuer**.
4. **Matériel** : *Tables intérieures* → saisir **5** (ou cliquer cinq fois sur **+**) ; *Bancs* → saisir **8**.
   L'encart affiche « 5 tables intérieures, 8 bancs » et le total 250 €. Cliquer **Continuer**.
5. **Vous** : faire remarquer que **Continuer** est grisé avec la phrase « Renseignez votre nom et votre e-mail… ».
   Cliquer **Se connecter** (dans la page) : « Connecté en tant que Julien Particulier ». Cliquer **Continuer**.
6. **Événement** : *Type d'événement* → **Fête familiale** ; laisser 30 participants et 10 h – 23 h ;
   *Buvette ?* → **Oui**. Cliquer **Continuer**.
7. **Pièces** : *Pièce d'identité* → **Choisir un fichier** → `identite.pdf` ;
   *Justificatif de domicile* → **Choisir un fichier** → `domicile.pdf` ; laisser l'attestation d'assurance vide.
   Bloc *Buvette* : cocher **J'ai lu les conditions…**, signer dans le cadre. L'encart indique « Pièces : 2 sur 3 ».
   Cliquer **Continuer**.
8. **Envoi** : relire le récapitulatif (samedi 21 novembre 2026, de 10 h à 23 h · avec buvette · 2 sur 3),
   ouvrir **Info caution**, puis cliquer **Envoyer ma demande**.
9. **Confirmation** : « N° de dossier RES-2026-0142 ». Cliquer **Suivre ma demande**.
10. **Mes demandes** : montrer « Pièce manquante : attestation d'assurance » et le message de la mairie.
    Écrire « Je vous l'envoie ce soir. » puis **Envoyer**. Cliquer **Voir côté mairie**.

**Côté mairie — fin A : refus**

11. **Back-office** : cliquer l'onglet **Pièces manquantes**, puis la ligne **Julien (particulier)**.
12. Le détail montre les contrôles automatiques, « 2/3 Attestation d'assurance » et **Accorder (dossier incomplet)** grisé.
13. Cliquer **Refuser** : « Demande n° 1 refusée. » ; la ligne apparaît dans l'onglet **Refusées**.

**Côté mairie — fin B : accord** (à la place des étapes 11 à 13)

11. Dans **Mes demandes**, cliquer **Ajouter la pièce** → `assurance.pdf` : le statut passe à « Dossier complet ».
    Cliquer **Voir côté mairie**.
12. **Back-office** : la demande de Julien est dans l'onglet **À traiter** (pièces « Complet ») ; cliquer sa ligne.
13. Cliquer **Accorder** : « Demande n° 1 accordée. » ; la ligne apparaît dans l'onglet **Accordées**.

Pour rejouer le scénario, recharger la page (F5) : la demande repart de zéro.
