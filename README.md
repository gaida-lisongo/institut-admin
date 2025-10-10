# 🎓 Institut Admin - Système de Gestion Académique

Institut Admin est une application web complète de gestion administrative pour institut supérieur, construite avec **Next.js 15**, **React 19**, **TypeScript** et **Tailwind CSS**. Elle offre une solution moderne et sécurisée pour la gestion des personnels, étudiants, inscriptions, notes et ressources académiques.

![Institut Admin - Dashboard Preview](./banner.png)

## 🚀 Fonctionnalités Principales

### 👥 Gestion du Personnel
- **CRUD complet** : Création, modification, suppression des agents
- **Système d'autorisations** : 8 niveaux hiérarchiques (DG, SGACAD, SGAD, SGR, AB, FIN, ADMIN, DRH)
- **Grades dynamiques** : 16 grades selon la catégorie (Académique, Scientifique, Administratif/Ouvrier)
- **Upload de documents** : Photos de profil et pièces justificatives
- **Recherche avancée** : Filtrage par nom, matricule, grade, niveau

### 🎓 Gestion Académique
- **Classes et cycles** : Organisation hiérarchique des formations
- **Inscriptions étudiants** : Gestion des statuts (OK/PENDING/NO)
- **Relevés de notes** : Génération automatique de documents
- **Grilles de délibération** : Export Excel professionnel
- **Semestres et unités** : Structure académique complète

### 💰 Gestion Financière
- **Produits et services** : Catalogue avec tarification
- **Suivi des paiements** : États financiers par étudiant
- **Rapports comptables** : Statistiques et analyses
- **Import/Export CSV** : Traitement en lot des données

### 💬 Communication
- **Chat temps réel** : WebSocket avec Socket.IO
- **Pièces jointes** : Upload et partage de fichiers
- **Notifications** : Système d'alertes intégré
- **Autorisations contextuelles** : Chat adapté au niveau d'autorisation

## 🛡️ Sécurité et Authentification

### Middleware de Sécurité Avancé
- **JWT avec `jose`** : Vérification cryptographique des tokens
- **Protection des routes** : Middleware Next.js pour toutes les pages protégées
- **Autorisations hiérarchiques** : Contrôle d'accès selon les rôles
- **Anti-indexation** : Protection complète contre l'indexation des moteurs de recherche

### Authentification Multi-Niveaux
- **Vérification serveur** : Middleware avant rendu des pages
- **Synchronisation tokens** : localStorage ↔ cookies pour compatibilité
- **Déconnexion sécurisée** : Nettoyage automatique de tous les tokens
- **Sessions persistantes** : Gestion d'état avec Zustand

## 🏗️ Architecture Technique

### Stack Technologique
- **Frontend** : Next.js 15.x, React 19, TypeScript
- **Styling** : Tailwind CSS V4, Mode sombre/clair
- **État global** : Zustand avec persistance
- **Authentification** : JWT avec `jose`, Middleware Next.js
- **Communication** : Socket.IO pour le chat temps réel
- **Upload** : BlobManager pour la gestion des fichiers

### Structure du Projet
```
src/
├── app/                    # App Router Next.js 15
│   ├── (admin)/           # Routes protégées
│   ├── (auth)/            # Pages d'authentification
│   └── layout.tsx         # Layout principal avec métadonnées
├── components/            # Composants réutilisables
│   ├── auth/              # Composants d'authentification
│   ├── classe/            # Gestion des classes
│   ├── personnel/         # Gestion du personnel
│   └── common/            # Composants partagés
├── stores/                # Stores Zustand
├── services/              # Services API
├── utils/                 # Utilitaires et helpers
├── middleware.ts          # Middleware de sécurité
└── types/                 # Définitions TypeScript
```

### Quick Links
- [✨ Visit Website](https://tailadmin.com)
- [📄 Documentation](https://tailadmin.com/docs)
- [⬇️ Download](https://tailadmin.com/download)
- [🖌️ Figma Design File (Community Edition)](https://www.figma.com/community/file/1463141366275764364)
- [⚡ Get PRO Version](https://tailadmin.com/pricing)

### Demos
- [Free Version](https://nextjs-free-demo.tailadmin.com)
- [Pro Version](https://nextjs-demo.tailadmin.com)

### Other Versions
- [HTML Version](https://github.com/TailAdmin/tailadmin-free-tailwind-dashboard-template)
- [React Version](https://github.com/TailAdmin/free-react-tailwind-admin-dashboard)
- [Vue.js Version](https://github.com/TailAdmin/vue-tailwind-admin-dashboard)

## Installation

### Prerequisites
To get started with TailAdmin, ensure you have the following prerequisites installed and set up:

- Node.js 18.x or later (recommended to use Node.js 20.x or later)

### Cloning the Repository
Clone the repository using the following command:

```bash
git clone https://github.com/TailAdmin/free-nextjs-admin-dashboard.git
```

> Windows Users: place the repository near the root of your drive if you face issues while cloning.

1. Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
    > Use `--legacy-peer-deps` flag if you face peer-dependency error during installation.

2. Start the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```

## Components

TailAdmin is a pre-designed starting point for building a web-based dashboard using Next.js and Tailwind CSS. The template includes:

- Sophisticated and accessible sidebar
- Data visualization components
- Profile management and custom 404 page
- Tables and Charts(Line and Bar)
- Authentication forms and input elements
- Alerts, Dropdowns, Modals, Buttons and more
- Can't forget Dark Mode 🕶️

All components are built with React and styled using Tailwind CSS for easy customization.

## Feature Comparison

### Free Version
- 1 Unique Dashboard
- 30+ dashboard components
- 50+ UI elements
- Basic Figma design files
- Community support

### Pro Version
- 5 Unique Dashboards: Analytics, Ecommerce, Marketing, CRM, Stocks (more coming soon)
- 400+ dashboard components and UI elements
- Complete Figma design file
- Email support

To learn more about pro version features and pricing, visit our [pricing page](https://tailadmin.com/pricing).

## Changelog

### Version 2.0.2 - [March 25, 2025]

- Upgraded to Next v15.2.3 for [CVE-2025-29927](https://nextjs.org/blog/cve-2025-29927) concerns
- Included overrides vectormap for packages to prevent peer dependency errors during installation.
- Migrated from react-flatpickr to flatpickr package for React 19 support

### Version 2.0.1 - [February 27, 2025]

#### Update Overview

- Upgraded to Tailwind CSS v4 for better performance and efficiency.
- Updated class usage to match the latest syntax and features.
- Replaced deprecated class and optimized styles.

#### Next Steps

- Run npm install or yarn install to update dependencies.
- Check for any style changes or compatibility issues.
- Refer to the Tailwind CSS v4 [Migration Guide](https://tailwindcss.com/docs/upgrade-guide) on this release. if needed.
- This update keeps the project up to date with the latest Tailwind improvements. 🚀

### v2.0.0 (February 2025)
A major update focused on Next.js 15 implementation and comprehensive redesign.

#### Major Improvements
- Complete redesign using Next.js 15 App Router and React Server Components
- Enhanced user interface with Next.js-optimized components
- Improved responsiveness and accessibility
- New features including collapsible sidebar, chat screens, and calendar
- Redesigned authentication using Next.js App Router and server actions
- Updated data visualization using ApexCharts for React

#### Breaking Changes

- Migrated from Next.js 14 to Next.js 15
- Chart components now use ApexCharts for React
- Authentication flow updated to use Server Actions and middleware

[Read more](https://tailadmin.com/docs/update-logs/nextjs) on this release.

#### Breaking Changes
- Migrated from Next.js 14 to Next.js 15
- Chart components now use ApexCharts for React
- Authentication flow updated to use Server Actions and middleware

### v1.3.4 (July 01, 2024)
- Fixed JSvectormap rendering issues

### v1.3.3 (June 20, 2024)
- Fixed build error related to Loader component

### v1.3.2 (June 19, 2024)
- Added ClickOutside component for dropdown menus
- Refactored sidebar components
- Updated Jsvectormap package

### v1.3.1 (Feb 12, 2024)
- Fixed layout naming consistency
- Updated styles

### v1.3.0 (Feb 05, 2024)
- Upgraded to Next.js 14
- Added Flatpickr integration
- Improved form elements
- Enhanced multiselect functionality
- Added default layout component

## License

TailAdmin Next.js Free Version is released under the MIT License.

## Support

If you find this project helpful, please consider giving it a star on GitHub. Your support helps us continue developing and maintaining this template.
