#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🎓 Institut Admin - Configuration initiale\n');

// Générer une clé JWT sécurisée
const generateJWTSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Créer le fichier .env.local s'il n'existe pas
const createEnvFile = () => {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    console.log('✅ Le fichier .env.local existe déjà');
    return;
  }

  const jwtSecret = generateJWTSecret();
  const envContent = `# Configuration Institut Admin - Générée automatiquement
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SERVER_API_URL=http://localhost:4000/api/v1

# Clé JWT sécurisée (générée automatiquement)
JWT_SECRET=${jwtSecret}

# Configuration du serveur backend
SERVER_PORT=4000
MONGODB_URI=mongodb://localhost:27017/institut-admin

# Configuration des uploads
NEXT_PUBLIC_UPLOAD_URL=http://localhost:4000/uploads

# Mode de développement
NODE_ENV=development
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Fichier .env.local créé avec succès');
    console.log('🔑 Clé JWT générée automatiquement');
  } catch (error) {
    console.error('❌ Erreur lors de la création du fichier .env.local:', error.message);
  }
};

// Vérifier les dépendances critiques
const checkDependencies = () => {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json introuvable');
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const criticalDeps = ['next', 'react', 'jose', 'zustand', 'tailwindcss'];
  
  console.log('🔍 Vérification des dépendances critiques...');
  
  let allDepsPresent = true;
  criticalDeps.forEach(dep => {
    const isPresent = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
    if (isPresent) {
      console.log(`  ✅ ${dep}`);
    } else {
      console.log(`  ❌ ${dep} - MANQUANT`);
      allDepsPresent = false;
    }
  });

  return allDepsPresent;
};

// Créer les dossiers nécessaires
const createDirectories = () => {
  const dirs = [
    'public/uploads',
    'src/components/auth',
    'src/utils',
    'logs'
  ];

  console.log('📁 Création des dossiers nécessaires...');
  
  dirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`  ✅ ${dir}`);
    } else {
      console.log(`  ⏭️  ${dir} (existe déjà)`);
    }
  });
};

// Afficher les instructions de démarrage
const showStartupInstructions = () => {
  console.log('\n🚀 Configuration terminée ! Instructions de démarrage :\n');
  
  console.log('1. 📦 Installer les dépendances :');
  console.log('   npm install\n');
  
  console.log('2. 🗄️  Démarrer MongoDB :');
  console.log('   mongod --dbpath ./data/db\n');
  
  console.log('3. 🖥️  Démarrer le serveur backend :');
  console.log('   cd backend && npm start\n');
  
  console.log('4. 🌐 Démarrer l\'application Next.js :');
  console.log('   npm run dev\n');
  
  console.log('5. 🔐 Première connexion :');
  console.log('   - URL : http://localhost:3000/signin');
  console.log('   - Créer un compte administrateur via l\'API backend\n');
  
  console.log('📚 Documentation :');
  console.log('   - Sécurité : ./SECURITY.md');
  console.log('   - Architecture : ./README.md\n');
  
  console.log('⚠️  IMPORTANT : Changez JWT_SECRET en production !');
};

// Exécution du script
const main = () => {
  try {
    createEnvFile();
    
    if (!checkDependencies()) {
      console.log('\n⚠️  Certaines dépendances sont manquantes. Exécutez : npm install');
    }
    
    createDirectories();
    showStartupInstructions();
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration :', error.message);
    process.exit(1);
  }
};

main();
