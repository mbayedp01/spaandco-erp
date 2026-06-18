# ZenSpa ERP — Démo Frontend

ERP de gestion de spa & bien-être. **Version démo frontend** avec données statiques (la base de données Supabase sera branchée plus tard, en ligne).

## Stack

- Next.js 14 (App Router) · TypeScript · Tailwind CSS · Recharts · lucide-react

## Démarrer en local

```bash
npm install
npm run dev        # http://localhost:3000
```

**Connexion de démo :** identifiant `Admin` · mot de passe `Admin123`

## Pages

- `/login` — authentification de vérification
- `/dashboard` — KPIs, graphiques CA/dépenses, prestations populaires, RDV du jour
- `/clients` — liste clients (fidélité, VIP)
- `/appointments` — rendez-vous du jour
- `/services` — catalogue des prestations

Les modules Stocks, Caisse, Comptabilité, Marketing, Rapports sont visibles dans la sidebar (marqués « bientôt »).

## Déployer en ligne (Vercel)

**Option A — CLI (le plus rapide) :**

```bash
npm i -g vercel        # une seule fois
vercel login           # connexion via navigateur
vercel --prod          # déploie et renvoie l'URL publique
```

**Option B — via GitHub :**

1. Pousser ce dépôt sur GitHub
2. Sur [vercel.com](https://vercel.com) → *Add New Project* → importer le repo
3. Vercel détecte Next.js automatiquement → *Deploy*

Aucune variable d'environnement n'est requise (données statiques).

## Données statiques

Tout est dans [`src/lib/mock-data.ts`](src/lib/mock-data.ts). Quand la base Supabase sera en ligne, ces appels seront remplacés par des requêtes réelles.
