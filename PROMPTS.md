# Prompts IA — un par étape du plan

À coller tels quels dans Claude Code, lancé à la racine du dépôt. Chaque prompt se suffit à lui-même.
Ordre : **l'étape 0 d'abord**. Ensuite les lots A à D peuvent tourner en parallèle (une branche chacun), puis 2a, 2b et 3.

Si la personne a accès au MCP Balsamiq, le wireframe se consulte ici : https://balsamiq.cloud/siqzvs5/p9fetpl/rE50F

---

## Étape 0 — Composants de base

```text
Contexte : démo front React (Vite, React 19 en JS, Tailwind CSS v4, React Router) d'un site de réservation de salles
pour la mairie de Lacroix-Falgarde. Lis README.md, PLAN.md et src/components/ avant de commencer.

Tâche : crée les composants d'interface réutilisables dans src/components/ui/, un fichier par composant :
- Button.jsx : props variant = 'primary' (fond slate-900, texte blanc) | 'secondary' (fond primary) | 'outline'
  (bordure slate-300, fond blanc) ; props full (largeur 100 %) ; transmet ...props au <button> (type="button" par défaut).
  État disabled visible (opacité réduite, curseur interdit).
- Input.jsx : props label, hint, ...props. Rend <label> + <input> reliés par useId(). Gère type="text|email|tel|date|time|number".
- Textarea.jsx : même API que Input.
- Select.jsx : props label, options (tableau de chaînes ou de { value, label }), ...props.
- Checkbox.jsx et Radio.jsx : props label, ...props, label cliquable.
- Card.jsx : conteneur blanc, bordure slate-300, coins arrondis, padding 16 px ; props as (balise, 'div' par défaut) et className.

Contraintes :
- Tailwind uniquement, aucune nouvelle dépendance. Utilise les couleurs du thème (primary défini dans src/index.css).
- Focus clavier visible sur tous les éléments interactifs (ring primary).
- Style sobre, proche du wireframe : bordures fines, coins légèrement arrondis, texte 14 px.
- Remplace les boutons écrits en dur dans src/components/Layout.jsx et RecapDemande.jsx par <Button>.
- Ne touche pas aux pages.

Vérification : npm run lint et npm run build passent sans nouvel avertissement. Résume en fin de réponse l'API de chaque composant.
```

---

## Étape 1 — Lot A : Accueil et Recherche

```text
Contexte : démo front React de réservation de salles pour Lacroix-Falgarde. Lis PLAN.md, src/data/mock.js,
src/context/DemandeContext.jsx et src/components/ui/ (composants à réutiliser obligatoirement).
L'état de la demande se lit et s'écrit avec const { demande, update } = useDemande().

Tâche 1 — src/pages/Accueil.jsx (route /) :
- Bloc principal sur 2 colonnes : à gauche le titre « Réserver une salle ou du matériel », un sous-titre court,
  deux boutons « Réserver une salle » (→ /recherche, variant primary) et « Emprunter du matériel »
  (→ /reservation/materiel, variant outline), et un lien « Suivre ma demande » (→ /mes-demandes).
  À droite, une illustration (bloc gris avec une icône SVG inline, pas d'image externe).
- En dessous, 3 cartes avec icône SVG inline : « Disponibilités en temps réel », « Plus de PDF à imprimer »,
  « Réponse par e-mail ».

Tâche 2 — src/pages/Recherche.jsx (route /recherche) :
- Colonne gauche « Votre recherche » : Input date (valeur demande.date), Input nombre de participants
  (demande.participants), Select profil (liste profils de mock.js, valeur demande.profil). Chaque changement fait update().
  Bouton « Rechercher » (purement visuel : le filtrage est déjà en direct).
- Colonne droite : liste des salles de mock.js dont capacite >= participants. Chaque carte affiche le nom,
  « X pers. », le tarif, et un bouton « Voir » qui fait update({ salleId }) puis navigue vers /reservation/salle.
- Si aucune salle ne correspond : message « Aucune salle ne peut accueillir N personnes. »

Contraintes : responsive (une seule colonne sous md), aucune nouvelle dépendance, ne modifie que ces deux fichiers.
Vérification : npm run lint et npm run build passent ; à 30 participants on voit 5 salles, à 50 seulement le Foyer rural.
```

---

## Étape 1 — Lot B : Salle et Matériel

```text
Contexte : démo front React de réservation de salles pour Lacroix-Falgarde. Lis PLAN.md, src/data/mock.js,
src/context/DemandeContext.jsx, src/components/RecapDemande.jsx et src/components/ui/ (à réutiliser).
Les pages d'étape gardent leur structure actuelle : grille md:grid-cols-[1fr_280px], contenu à gauche, <RecapDemande /> à droite.

Tâche 1 — src/pages/reservation/Salle.jsx :
- Affiche la salle choisie (salles.find(s => s.id === demande.salleId)). Si aucune n'est choisie, prends le Foyer rural
  par défaut en faisant update({ salleId: 'foyer-rural' }) dans un useEffect.
- À gauche : nom de la salle, illustration (bloc gris), « Équipements : … », capacité, tarif.
- Calendrier du mois de novembre 2026, codé à la main (aucune librairie) : en-tête « Novembre 2026 » avec flèches
  précédent / suivant (changent de mois), grille de 7 colonnes L M M J V S D, mois qui commence au bon jour de la semaine.
  Jours de joursIndisponibles et jours passés : grisés et non cliquables. Jour sélectionné (demande.date) : fond jaune.
  Clic sur un jour libre → update({ date: 'AAAA-MM-JJ' }).
- Les dates sont des chaînes 'AAAA-MM-JJ' : construis-les sans passer par toISOString() (décalage de fuseau horaire).

Tâche 2 — src/pages/reservation/Materiel.jsx :
- Titre « Matériel disponible ». Une ligne par élément de materiel : « Tables intérieures (18 dispo) », prix par jour
  s'il est supérieur à 0, et un champ quantité avec boutons − et + (bornes 0 et stock). Écrit dans
  demande.materiel[id] via update({ materiel: { ...demande.materiel, [id]: n } }).
- Cases à cocher pour la liste options (vidéoprojecteur, enceinte) → demande.options (tableau d'ids).
- Le total de RecapDemande doit se mettre à jour (le barnum coûte 50 € par jour).

Contraintes : ne modifie que ces deux fichiers, aucune nouvelle dépendance, boutons et cellules accessibles au clavier
avec aria-label (« 21 novembre 2026, disponible »).
Vérification : npm run lint et npm run build ; le 7 et le 8 novembre ne sont pas cliquables ; 2 barnums ajoutent 100 € au total.
```

---

## Étape 1 — Lot C : Vous et Événement

```text
Contexte : démo front React de réservation de salles pour Lacroix-Falgarde. Lis PLAN.md, src/data/mock.js,
src/context/DemandeContext.jsx et src/components/ui/ (à réutiliser). Garde la structure des pages d'étape
(grille avec <RecapDemande /> à droite).

Tâche 1 — src/pages/reservation/Vous.jsx :
- Bouton « Se connecter » (variant outline) : connexion fictive qui remplit demande.demandeur avec
  { nom: 'Julien Particulier', email: 'julien@example.fr', telephone: '06 12 34 56 78' } et demande.profil = 'Habitant',
  puis affiche « Connecté en tant que Julien Particulier » à la place du bouton.
- Séparateur « Ou remplissez une seule fois » puis le formulaire : Select profil, Input « Nom et prénom »,
  Input e-mail et Input téléphone côte à côte. Champs contrôlés sur demande.demandeur.
- Le bouton Continuer de RecapDemande est désactivé tant que nom ou e-mail est vide. Ajoute pour cela une prop
  optionnelle disabled à RecapDemande (seule modification autorisée hors de tes deux pages).

Tâche 2 — src/pages/reservation/Evenement.jsx :
- Select type d'événement (Fête familiale, Anniversaire, Réunion, Assemblée générale, Spectacle, Autre),
  Input participants (demande.participants), Input heure de début et heure de fin (type time), Textarea description.
  Tout est écrit dans demande.evenement, sauf participants.
- Question « Buvette ? » avec deux boutons radio Oui / Non → demande.evenement.buvette (booléen).
  Sous la question, une phrase d'aide : « Avec buvette, des pièces supplémentaires vous seront demandées. »
- Si participants dépasse la capacité de la salle choisie : message d'alerte sous le champ.

Contraintes : aucune nouvelle dépendance ; mets à jour les objets imbriqués sans écraser les autres champs
(update({ evenement: { ...demande.evenement, buvette: true } })).
Vérification : npm run lint et npm run build ; le choix de la buvette est conservé quand on revient sur l'étape.
```

---

## Étape 1 — Lot D : Pièces, Envoi et Confirmation

```text
Contexte : démo front React de réservation de salles pour Lacroix-Falgarde. Lis PLAN.md, src/data/mock.js,
src/data/calculs.js, src/context/DemandeContext.jsx et src/components/ui/ (à réutiliser).

Tâche 1 — src/pages/reservation/Pieces.jsx :
- Checklist des piecesRequises de mock.js. Une pièce fournie a une coche verte et le nom du fichier.
- Pour chaque pièce manquante, un cadre en pointillés avec deux boutons : « Choisir un fichier » (<input type="file">
  caché, on garde seulement le nom du fichier) et « Prendre une photo » (même input avec accept="image/*" capture).
  Stocke dans demande.pieces un tableau { id, fichier }.
- Si demande.evenement.buvette est vrai, ajoute un bloc « Buvette » : case « J'ai lu les conditions d'acceptation
  de la buvette », lien « Consulter le formulaire » (href="#") et une zone de signature : un <canvas> sur lequel on
  dessine à la souris et au doigt (pointer events), avec un bouton « Effacer ». Stocke dans demande.buvette
  { conditions: bool, signee: bool }.
- Le récapitulatif de droite affiche « Pièces : X sur 3 ».

Tâche 2 — src/pages/reservation/Envoi.jsx :
- Tableau récapitulatif en 2 colonnes (libellé / valeur) : Salle, Date, Matériel, Demandeur, Événement, Pièces (X sur 3).
- À droite, à la place de RecapDemande : encart « Montant » (salle, matériel, total calculé avec calculerTotal) et
  lien « Info caution » qui ouvre une petite explication (caution de 1 500 €, non encaissée).
- Bouton « Envoyer ma demande » : update({ numeroDossier: 'RES-2026-0142' }) puis navigation vers /confirmation.

Tâche 3 — src/pages/Confirmation.jsx :
- Centré : icône de validation (SVG inline), « Demande envoyée », « N° de dossier RES-2026-0142 »,
  phrase « Vous recevrez la réponse de la mairie par e-mail. », bouton « Suivre ma demande » → /mes-demandes.
- Si demande.numeroDossier est vide (accès direct), redirige vers /.

Contraintes : ne modifie que ces trois fichiers (plus RecapDemande.jsx seulement pour afficher la ligne Pièces),
aucune nouvelle dépendance.
Vérification : npm run lint et npm run build ; sans buvette, pas de bloc signature ; avec buvette, il apparaît.
```

---

## Étape 2a — Suivi de la demande

```text
Contexte : démo front React de réservation de salles pour Lacroix-Falgarde. Lis PLAN.md, src/data/mock.js,
src/context/DemandeContext.jsx et src/components/ui/ (à réutiliser).

Tâche — src/pages/Suivi.jsx (route /mes-demandes) :
- Colonne gauche : onglets « En cours (1) » et « Passées » (Passées affiche « Aucune demande passée »).
  Carte du dossier : numéro (demande.numeroDossier ou 'RES-2026-0142' par défaut), titre « Foyer rural sam. 21 nov. 2026 »
  (construit à partir de la demande, ou ces valeurs par défaut si elle est vide), statut « Instruction en cours ».
  Si une pièce manque : ligne d'alerte « Pièce manquante : attestation d'assurance » et bouton « Ajouter la pièce »
  qui simule l'envoi (input file) ; l'alerte disparaît alors et le statut devient « Dossier complet ».
- Colonne droite « Échanges avec la mairie » : fil de messages en mémoire (useState) avec un message initial de la
  mairie, un Input et un bouton « OK » pour en ajouter. En dessous, « Me prévenir de chaque étape par » : cases E-mail
  (cochée) et SMS.

Contraintes : ne modifie que ce fichier, aucune nouvelle dépendance, la page doit marcher même si on y arrive
directement sans avoir fait le parcours.
Vérification : npm run lint et npm run build ; ajouter un message l'affiche dans le fil.
```

---

## Étape 2b — Back-office mairie

```text
Contexte : démo front React de réservation de salles pour Lacroix-Falgarde. Lis PLAN.md, src/data/mock.js et
src/components/ui/ (à réutiliser). Cette page est la vue des agents de la mairie.

Tâche — src/pages/admin/AdminDemandes.jsx (route /admin) :
- Mise en page en 3 zones : menu latéral (Demandes actif ; Calendrier des salles, Stock de matériel, Salles et tarifs,
  Usagers et associations sont visibles mais inactifs), zone centrale, panneau de détail à droite.
- Zone centrale : titre « Demandes de réservation », Input de recherche (filtre sur demandeur et objet), bouton
  « Exporter vers Excel » (affiche un message « Export simulé »), onglets À traiter / Pièces manquantes / Accordées /
  Refusées / Toutes qui filtrent sur le statut, puis le tableau de demandesAdmin (N°, Demandeur, Salle ou matériel,
  Date, Pièces, Statut avec un badge coloré).
- Clic sur une ligne → panneau de détail : « Julien, Foyer rural », contrôles automatiques avec coches (« Créneau
  verrouillé depuis l'envoi », « 30 participants pour 200 places », « Matériel réservé dans le stock du 21 nov. »),
  pièces (« 2/3 Assurance »), « Location 250 € · Caution 1 500 € », et trois boutons :
  « Accorder » (désactivé si pièces incomplètes, libellé « Accorder (dossier incomplet) »), « Demander une pièce », « Refuser ».
  Chaque action change le statut de la ligne (copie des demandes dans un useState) et affiche une confirmation.

Contraintes : ne modifie que ce fichier, aucune nouvelle dépendance ; sous lg, le panneau de détail passe sous le tableau.
Vérification : npm run lint et npm run build ; refuser une demande la fait passer dans l'onglet Refusées.
```

---

## Étape 3 — Finitions de démo

```text
Contexte : démo front React de réservation de salles pour Lacroix-Falgarde. Toutes les pages sont construites.
Lis PLAN.md puis parcours tous les fichiers de src/.

Tâche : rends la démo solide pour une présentation, sans ajouter de fonctionnalité.
1. Responsive : vérifie chaque page à 375 px de large. Aucun défilement horizontal ; le stepper reste lisible
   (défilement horizontal interne ou libellés raccourcis) ; l'encart récapitulatif passe sous le formulaire.
2. Validations minimales : Continuer désactivé si salle ou date manque (étape Salle) et si nom ou e-mail manque (étape Vous),
   avec une phrase qui dit pourquoi.
3. Accessibilité : chaque champ a un label, focus visible partout, contrastes AA, attribut aria-current sur l'étape active
   du stepper, titres h1 et h2 dans l'ordre, title de l'onglet mis à jour sur chaque page.
4. Cohérence : mêmes espacements, tailles de titre et libellés de bouton sur toutes les pages ; dates au format français.
5. Ajoute en bas de PLAN.md une section « Scénario de démo » : la liste des clics pour le parcours de Julien
   (Foyer rural, samedi 21 novembre 2026, 30 personnes, 5 tables et 8 bancs, avec buvette) jusqu'au refus ou à l'accord
   dans le back-office.

Contraintes : aucune nouvelle dépendance, ne change pas l'API des composants ui/ ni la forme de l'état dans DemandeContext.
Vérification : npm run lint et npm run build sans avertissement ; liste en fin de réponse ce que tu as modifié, page par page.
```
