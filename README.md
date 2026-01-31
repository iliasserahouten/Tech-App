# 📚 Tech-App – Gestion des emprunts de livres scolaires

## 🧠 Contexte du projet

Ce projet technique a pour objectif de **dématérialiser la gestion des emprunts et des restitutions de livres** dans les classes d’écoles primaires.

Aujourd’hui, ces processus sont souvent réalisés manuellement, ce qui engendre une perte de temps pour les enseignants. L’application **Tech-App** vise à simplifier, automatiser et fiabiliser cette gestion grâce à une solution web moderne.

---

## 🎯 Objectifs principaux

* Réduire le temps consacré à la gestion des livres
* Centraliser les informations (écoles, classes, élèves, livres)
* Faciliter les emprunts et retours via QR Code
* Offrir une vue claire de l’état des livres (disponibles / empruntés)

---

## 👤 Utilisateurs cibles

* Enseignants du primaire
* Intervenants dans une ou plusieurs écoles
* Enseignants ayant plusieurs classes selon les jours

---

## ⚙️ Fonctionnalités

### 🏫 Gestion du référentiel scolaire

* Création et gestion d’écoles
* Association d’une ou plusieurs classes à une école
* Association des classes à des jours de la semaine
* Gestion des élèves par classe (nom, prénom)
* Sélection automatique de la classe par défaut selon le jour

---

### 📘 Gestion des livres

* Création de fiches livres :

  * Titre
  * Univers
  * Éditeur
* Association d’un livre à une classe
* Génération d’un **QRCode unique** par livre
* Export PDF pour impression des QR Codes

---

### 🔁 Gestion des emprunts et retours

* Emprunt via scan du QR Code depuis un smartphone
* Sélection de l’élève emprunteur
* Définition d’une date de retour
* Notification en cas de retard
* Retour automatique via scan du QR Code
* Historique des emprunts par livre
* Réservation anticipée d’un livre déjà emprunté

---

### 📊 Suivi et consultation

* Vue globale des livres
* Statut : disponible / emprunté
* Filtres :

  * Par école
  * Par classe
  * Par élève

---

## 🛠️ Stack technique

### Frontend

* React
* Vite
* TypeScript

### Backend

* Node.js
* Express
* TypeScript

### Base de données

* SQL (PostgreSQL)

### Autres outils

* Git & GitHub
* QR Code generator
* PDF generation

---

## 📂 Architecture du projet

```text
Tech-App/
 ├─ Backend/
 │   ├─ src/
 │   │   ├─ app.ts
 │   │   ├─ server.ts
 │   │   ├─ routes/
 │   │   ├─ controllers/
 │   │   ├─ services/
 │   │   └─ models/
 │   └─ package.json
 │
 ├─ frontend/
 │   ├─ src/
 │   ├─ public/
 │   └─ package.json
 │
 └─ README.md
```

---

## 🗺️ Feuille de route (Roadmap)

### Phase 1 – Conception

*

### Phase 2 – Mise en place technique

*

### Phase 3 – Fonctionnalités cœur

*

### Phase 4 – Emprunts & retours

*

### Phase 5 – Finalisation

*

---

## 🚀 Déploiement

L’application sera déployée sur un hébergement gratuit afin de fournir un projet complet et accessible.

---

## 📬 Contact

Pour toute question ou difficulté rencontrée au cours du développement, un point d’avancement pourra être organisé.

---

## 📝 Licence

Projet réalisé dans un cadre pédagogique.
