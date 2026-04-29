# Documentation API - Gestion d'École Primaire

## 📋 Vue d'ensemble

Ceci est une API complète pour la gestion d'une école primaire, construite avec **Express.js** et **MySQL**.

## 🏗️ Architecture Modulaire

### Modules Implémentés

#### 1. **Authentification** (`/api/auth`)
- Enregistrement d'utilisateurs (admins, enseignants, parents, etc.)
- Connexion avec JWT
- Gestion des tokens d'authentification

#### 2. **Gestion des Élèves** (`/api/eleves`)
- Création, lecture, mise à jour et suppression d'élèves
- Filtrage par classe, statut actif
- Association avec parents et salles

#### 3. **Gestion des Enseignants** (`/api/enseignants`)
- Gestion des profils enseignants
- Association aux courses/matières
- Suivi des performances

#### 4. **Gestion des Parents** (`/api/parents`)
- Création et gestion des profils de parents
- Association aux élèves
- Communications et suivi des paiements

#### 5. **Gestion des Cycles** (`/api/cycles`)
- Création des cycles (préscolaire, primaire 1, primaire 2, etc.)
- Description et organisation

#### 6. **Gestion des Classes** (`/api/classes`)
- Création et gestion des classes
- Association aux cycles
- Organisation des groupes d'élèves

#### 7. **Gestion des Cours (Matières)** (`/api/cours`) ✨ NOUVEAU
- Création et gestion des cours/matières
- Association aux classes
- Gestion des coefficients et notes
- Récupération des cours par classe

#### 8. **Gestion des Salles** (`/api/salles`) ✨ NOUVEAU
- Création et entretien des salles de classe
- Gestion des positions et surface
- Association aux classes

#### 9. **Gestion des Titulaires** (`/api/titulaires`) ✨ NOUVEAU
- Attribution de titulaires aux salles
- Gestion des responsables de classe
- Suivi des titulaires actifs

#### 10. **Gestion des Années Académiques** (`/api/annees`) ✨ NOUVEAU
- Création des années scolaires
- Gestion des périodes académiques

#### 11. **Gestion des Trimestres** (`/api/trimestres`) ✨ NOUVEAU
- Création des trimestres
- Association aux années académiques
- Gestion des périodes

#### 12. **Gestion des Sessions** (`/api/sessions`) ✨ NOUVEAU
- Création de sessions d'évaluation
- Association aux trimestres
- Gestion par enseignant

#### 13. **Emploi de Temps** (`/api/emplois`) ✨ NOUVEAU
- Création et gestion de l'emploi de temps
- Organisation par classe et jour
- Gestion des heures de cours

#### 14. **Évaluations et Notes** (`/api/evaluations`) ✨ NOUVEAU
- Enregistrement des notes des élèves
- Gestion des appréciations
- Calcul des moyennes
- Notes groupées par résultat de test
- Récupération des évaluations par élève, session, cours

#### 15. **Paiements** (`/api/paiements`) ✨ NOUVEAU
- Enregistrement des paiements de scolarité
- Gestion des modes de paiement
- Suivi des paiements par élève
- Calcul du total payé

#### 16. **Scolarités** (`/api/scolarites`) ✨ NOUVEAU
- Gestion des frais de scolarité par cycle
- Frais d'inscription et pension
- Gestion des tranches de paiement

#### 17. **Salaires** (`/api/salaires`) ✨ NOUVEAU
- Enregistrement des salaires des enseignants et staff
- Gestion par mois et année
- Calcul des totaux annuels

#### 18. **Notifications** (`/api/notifications`) ✨ NOUVEAU
- Envoi de messages aux parents
- Gestion des communications
- Messages individuels ou globaux
- Validation et suivi des notifications

#### 19. **Bulletins PDF** (`/api/bulletins`) ✨ NOUVEAU
- Génération de bulletins scolaires en PDF
- Affichage des notes et moyennes
- Téléchargement et archivage
- Formatage professionnel

#### 20. **Gestion Administrative** (`/api/admin`) ✨ NOUVEAU
- Tableau de bord avec statistiques
- Rapports sur les scolarités
- Rapports de présence
- Rapports sur les paiements
- Rapports sur les salaires
- Accès réservé aux administrateurs

## 📊 Endpoints Principaux

### Authentification
```
POST   /api/auth/register
POST   /api/auth/login
```

### Ressources (CRUD complet)
```
GET    /api/{resource}
GET    /api/{resource}/:id
POST   /api/{resource}
PUT    /api/{resource}/:id
DELETE /api/{resource}/:id
```

### Spécialisés
```
GET    /api/evaluations/eleve/:matricule
GET    /api/evaluations/moyenne/:matricule/:idCours/:idSession
GET    /api/paiements/eleve/:matricule/:idAca
GET    /api/paiements/total/:matricule/:idAca
GET    /api/bulletins/download/:matricule/:idSession
POST   /api/bulletins/generate/:matricule/:idSession
GET    /api/admin/dashboard
GET    /api/admin/rapports/paiements
GET    /api/admin/rapports/salaires
```

## 🔐 Contrôle d'Accès

Les rôles et permissions sont définis comme suit:

### Admins
- **0**: Root Admin (accès total)
- **1**: Admin général
- **2**: Fondateur/Directeur
- **3**: Directeur académique

### Personnes
- **1**: Enseignant
- **2**: Administratif/Scolarité
- **3**: Scolarité
- **4**: Parent
- **5**: Autres

## 📦 Installation & Configuration

### Dépendances
```bash
npm install
```

Packages principaux:
- `express`: Framework web
- `mysql2`: Connecteur MySQL
- `express-validator`: Validation des données
- `jsonwebtoken`: Gestion des tokens JWT
- `bcryptjs`: Hachage des mots de passe
- `pdfkit`: Génération de PDFs
- `multer`: Gestion des uploads
- `cors`: Cross-Origin Resource Sharing
- `jest`: Tests (optionnel)

### Variables d'Environnement (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=school_db
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000
```

### Base de Données
```bash
# Importer le schéma
mysql -u root < school_fixed.sql
mysql -u root < salaire.sql
```

### Démarrage
```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## 🛠️ Structure des Fichiers

```
src/
├── controllers/      # Logique métier
├── models/          # Accès aux données
├── routes/          # Définition des endpoints
├── middleware/      # Authentification, validation
├── utils/           # Fonctions utilitaires
├── config/          # Configuration DB
└── index.js         # Point d'entrée
```

## 📝 Notes de Développement

### Créée les tables manquantes
```sql
-- Table Salaire (créée dans salaire.sql)
CREATE TABLE `Salaire` (
  `idSalaire` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `montant` float UNSIGNED NOT NULL DEFAULT 0,
  `mois` int UNSIGNED NOT NULL DEFAULT 1,
  ...
);
```

### Points d'Extension Futurs
- Système de notifications par email/SMS
- Export de données en Excel
- Intégration de paiement en ligne
- Application mobile native
- Système de chat temps réel
- Gestion de bibliothèque
- Gestion de ressources
- Backup automatique de DB

## ✅ Checklist Complétude

- [x] Authentification & Autorisation
- [x] Gestion des Élèves
- [x] Gestion des Enseignants
- [x] Gestion des Parents
- [x] Gestion des Cycles et Classes
- [x] Gestion des Cours/Matières
- [x] Gestion des Salles et Titulaires
- [x] Années Académiques/Trimestres/Sessions
- [x] Emploi de Temps
- [x] Évaluations et Notes
- [x] Paiements et Scolarités
- [x] Salaires
- [x] Notifications
- [x] Bulletins PDF
- [x] Gestion Administrative

## 🚀 Déploiement

### Heroku
```bash
heroku create app-name
heroku config:set DB_HOST=...
git push heroku main
```

### Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 5000
CMD ["npm", "start"]
```

## 📞 Support

Pour toute question ou problème, veuillez consulter la documentation API Swagger sur `/api-docs`.

---

*Dernière mise à jour: Avril 2026*
