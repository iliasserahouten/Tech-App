# Ma Bibliothèque

Application web de gestion des emprunts de livres scolaires.

## Stack technique

- **Frontend** : React + Vite + TypeScript
- **Backend** : Node.js + Express + TypeScript
- **Base de données** : PostgreSQL + Prisma ORM
- **Authentification** : JWT

## Démo en ligne

- **Application** : https://ma-bibliotheque-lyart.vercel.app
- **API** : https://ma-bibliotheque-backend.onrender.com

## Compte de démonstration

- **Email** : demo@bibliotheque.fr
- **Mot de passe** : demo1234

## Installation locale

### Prérequis
- Node.js >= 20
- Docker (pour PostgreSQL)

### Backend
```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

## Variables d'environnement

### Backend (.env)
DATABASE_URL="postgresql://postgres:password@localhost:5432/school_library"
DIRECT_URL="postgresql://postgres:password@localhost:5432/school_library"
JWT_SECRET="votre-secret"
JWT_EXPIRES_IN="1h"
PORT="3000"

### Frontend (.env.local)
VITE_API_URL="http://localhost:3000/api"

## Fonctionnalités

- Gestion des écoles, classes et élèves
- Catalogue de livres avec génération de QR codes
- Scanner QR code pour emprunts et retours
- Tableau de bord avec statistiques
- Historique des opérations
- Interface responsive mobile/desktop