# ChallengeUIUXMasterFST

Démo front du parcours de réservation de salles et de matériel de Lacroix-Falgarde
(wireframe : [Balsamiq UserFlow](https://balsamiq.cloud/siqzvs5/p9fetpl/rE50F)).

## Démarrer

Node 22.13 ou plus récent (SQLite est intégré à Node, rien à installer en plus).

```bash
npm install
npm run dev        # http://localhost:5173 : le site et l'API /api
npm run db:reset   # remet la base de démo dans son état de départ
```

Autres commandes : `npm run build`, `npm run preview`, `npm run lint`.

Stack : Vite, React 19, Tailwind CSS v4, React Router, SQLite (`node:sqlite`).
La base `server/reservations.db` est créée et remplie au premier appel de l'API ; elle n'est pas versionnée.
Node affiche « ExperimentalWarning: SQLite is an experimental feature » au démarrage : c'est normal.

Le plan de réalisation est dans [PLAN.md](PLAN.md).
