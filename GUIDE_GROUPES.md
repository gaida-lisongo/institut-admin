# 👥 Guide d'Utilisation - Gestion des Groupes

## 🎯 Introduction

Le module **Groupes** permet d'organiser des sessions d'interrogation en assignant des travaux à des groupes d'étudiants spécifiques. Vous pouvez suivre leurs progrès, générer des rapports et créer des documents personnalisés.

## 🚀 Démarrage Rapide

### Étape 1 : Créer un Groupe
1. Accédez à **Groupes** dans la navigation principale
2. Cliquez sur **"Nouveau Groupe"**
3. Remplissez les informations :
   - **Désignation** : Nom du groupe (ex: "Groupe A - Contrôle Maths")
   - **Session** : Choisissez la session d'interrogation
   - **Description** : Description optionnelle
   - **Durée maximale** : Temps limite en minutes (optionnel)
   - **Tentatives** : Nombre de tentatives autorisées

### Étape 2 : Ajouter des Étudiants
1. Cliquez sur le nom du groupe pour accéder aux détails
2. Cliquez sur **"Ajouter Étudiants"**
3. Utilisez les filtres pour trouver les étudiants :
   - Recherche par nom/prénom/email
   - Filtrage par classe
4. Sélectionnez les étudiants (cases à cocher)
5. Cliquez sur **"Ajouter X étudiant(s)"**

### Étape 3 : Ouvrir le Groupe
1. Dans les détails du groupe, changez le statut vers **"Ouvert"**
2. Les étudiants peuvent maintenant accéder au travail

### Étape 4 : Générer les Documents
1. Cliquez sur **"Générer PDF"** pour créer les fiches individuelles
2. Chaque étudiant aura sa page avec QR code personnalisé
3. Distribuez les documents aux étudiants

## 📊 Suivi des Résultats

### Tableau de Bord
Le tableau de bord affiche en temps réel :
- **Participants** : Nombre d'étudiants dans le groupe
- **Terminés** : Nombre ayant fini le travail
- **Moyenne** : Note moyenne du groupe
- **Temps Total** : Temps cumulé de tous les participants

### Visualisation Détaillée
Cliquez sur **"Voir Résultats"** pour accéder à :
- **Classement** : Rang de chaque étudiant
- **Notes détaillées** : Notes et pourcentages
- **Temps de travail** : Durée de chaque participant
- **Statuts** : Progression de chaque étudiant

### Tri et Filtrage
- Cliquez sur les en-têtes de colonnes pour trier
- Les résultats sont automatiquement classés par note
- Médailles pour le podium (🥇🥈🥉)

## 📈 Exports et Rapports

### Export Excel - Palmarès
Le bouton **"Exporter Palmarès"** génère un fichier Excel contenant :
- **Classement complet** avec rang, notes et pourcentages
- **Statistiques globales** : moyenne, meilleure/plus mauvaise note
- **Mise en forme conditionnelle** : couleurs selon les performances
- **Métadonnées** : informations du groupe et date

### Génération PDF - Documents Étudiants
Le bouton **"Générer PDF"** crée un document avec :
- **Une page par étudiant** avec ses informations personnelles
- **Détails du travail** : session, cours, instructions
- **QR code unique** pour accès direct à la plateforme
- **Espace pour notes** : lignes pour écriture manuscrite

## 🔄 Gestion des Statuts

### Statuts des Groupes
- **Brouillon** : Groupe en préparation, non accessible aux étudiants
- **Ouvert** : Groupe actif, étudiants peuvent travailler
- **Fermé** : Travail terminé, plus d'accès possible
- **Archivé** : Groupe archivé pour historique

### Statuts des Résolutions (Étudiants)
- **Non commencé** : Étudiant n'a pas encore démarré
- **En cours** : Travail en progression
- **Terminé** : Travail soumis, en attente de correction
- **Corrigé** : Note attribuée, travail finalisé

## 🛠️ Fonctionnalités Avancées

### Duplication de Groupes
- Cliquez sur l'icône "Dupliquer" dans la liste des groupes
- Un nouveau groupe est créé avec les mêmes paramètres
- Les étudiants ne sont pas copiés (groupe vide)

### Gestion des Participants
- **Retirer un étudiant** : Cliquez sur l'icône poubelle
- **Voir les détails** : Cliquez sur l'icône œil
- **Filtrage** : Utilisez la recherche pour trouver un étudiant

### QR Codes Personnalisés
Chaque QR code contient :
- ID du groupe
- ID de l'étudiant  
- ID de la session
- Timestamp de génération

## 📱 Utilisation Mobile

L'interface est entièrement responsive :
- **Navigation tactile** : Swipe et tap optimisés
- **Tableaux adaptatifs** : Défilement horizontal automatique
- **Modals responsives** : Adaptation à la taille d'écran
- **Boutons accessibles** : Taille optimale pour le touch

## ⚠️ Bonnes Pratiques

### Avant de Créer un Groupe
1. **Vérifiez** que la session d'interrogation est prête
2. **Préparez** la liste des étudiants participants
3. **Définissez** les paramètres de temps et tentatives

### Pendant le Travail
1. **Surveillez** le tableau de bord en temps réel
2. **Vérifiez** que tous les étudiants ont accès
3. **Notez** les éventuels problèmes techniques

### Après le Travail
1. **Fermez** le groupe pour empêcher de nouveaux accès
2. **Exportez** le palmarès pour archivage
3. **Archivez** le groupe une fois les notes finalisées

## 🆘 Résolution de Problèmes

### Problèmes Courants

**"Étudiant déjà dans le groupe"**
- L'étudiant est déjà assigné à ce groupe
- Vérifiez la liste des participants

**"Session non trouvée"**
- La session a été supprimée ou modifiée
- Créez une nouvelle session ou choisissez-en une autre

**"Export impossible"**
- Aucun résultat à exporter
- Attendez que des étudiants terminent le travail

**"QR code illisible"**
- Imprimez en qualité élevée
- Vérifiez que le PDF n'est pas corrompu

### Support Technique
En cas de problème persistant :
1. Vérifiez la console du navigateur (F12)
2. Notez le message d'erreur exact
3. Contactez l'administrateur système

## 🎓 Cas d'Usage Typiques

### Contrôle en Classe
1. Créez un groupe pour la classe
2. Ajoutez tous les étudiants
3. Définissez une durée (ex: 60 minutes)
4. Générez les QR codes
5. Ouvrez le groupe au début du contrôle

### Devoir Maison
1. Créez un groupe avec durée longue
2. Autorisez plusieurs tentatives
3. Laissez le groupe ouvert plusieurs jours
4. Suivez les soumissions en temps réel

### Évaluation par Groupes
1. Créez plusieurs groupes pour la même session
2. Répartissez les étudiants par niveau
3. Comparez les performances entre groupes
4. Exportez les palmarès séparément

---

## 📞 Contact et Support

Pour toute question ou suggestion d'amélioration, contactez l'équipe de développement.

**Version du guide :** 1.0  
**Dernière mise à jour :** Octobre 2025
