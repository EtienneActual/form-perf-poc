# POC Form Performance

Ce projet présente une interface complète pour comparer deux bibliothèques de formulaires React avec validation avancée :

- **TanStack Form** (@tanstack/react-form) avec validation **Zod**
- **Formik** avec validation **Yup**

## 🚀 Fonctionnalités

- **Interface utilisateur moderne** avec navigation React Router
- **Configuration flexible des champs** : Choisir le nombre de champs par type
- **5 types de champs supportés** :
  - TextField (champ texte)
  - Select (liste déroulante)
  - Autocomplete (saisie avec suggestions)
  - Checkbox (case à cocher)
  - DatePicker (sélecteur de date)
- **Validation robuste** au niveau des champs et du formulaire
- **Affichage des erreurs** en temps réel avec Material UI Alerts
- **Mesure de performance** avec timestamps de soumission
- **Interface utilisateur cohérente** avec Material UI

## 🛠 Technologies utilisées

- **React 19** + **TypeScript**
- **Vite** (build system)
- **React Router** (navigation)
- **Material UI** (composants UI + DatePicker)
- **TanStack Form** avec validation **Zod** (Standard Schema)
- **Formik** avec validation **Yup**
- **date-fns** (gestion des dates)
- **ESLint** (qualité du code)

## 📁 Structure du projet

```
src/
├── components/
│   ├── FormA/                    # TanStack Form + Zod
│   ├── FormB/                    # Formik + Yup
│   └── FieldTypeControls.tsx     # Configuration des types de champs
├── pages/                        # Pages de l'application
├── types/                        # Définitions TypeScript
├── validation/
│   ├── zodSchemas.ts            # Schémas Zod pour TanStack Form
│   └── yupSchemas.ts            # Schémas Yup pour Formik
├── utils/                       # Utilitaires
└── theme.tsx                    # Configuration Material UI
```

## 🚀 Installation et utilisation

1. **Clonez le dépôt**
```bash
git clone <url-du-depot>
cd poc-form-perf
```

2. **Installez les dépendances**
```bash
npm install
```

3. **Lancez en mode développement**
```bash
npm run dev
```

4. **Ouvrez votre navigateur** à l'adresse indiquée par Vite (généralement http://localhost:5173)

## 📋 Commandes disponibles

```bash
npm run dev        # Serveur de développement
npm run build      # Build de production
npm run preview    # Aperçu du build
npm run lint       # Vérification du code
npm run clean      # Nettoyage
```

## 🎯 Fonctionnement

### Configuration des champs
- **Page d'accueil** : Navigation vers TanStack Form ou Formik
- **Configuration flexible** : Définir le nombre de champs pour chaque type (0-20)
- **Types supportés** : TextField, Select, Autocomplete, Checkbox, DatePicker

### Validation
#### TanStack Form + Zod
- **Validation directe** : Schémas Zod sans adapter (TanStack Form v1)
- **Validation au niveau des champs** : Validation en temps réel
- **Validation au niveau du formulaire** : Règles transversales avec `onSubmitAsync`
- **Affichage des erreurs** : Utilisation de `form.Subscribe` pour les erreurs de formulaire

#### Formik + Yup
- **Schémas dynamiques** : Génération automatique des schémas Yup
- **Validation au niveau des champs** : Validation individuelle des champs
- **Validation au niveau du formulaire** : Fonction de validation personnalisée
- **Validation onSubmit** : Validation complète à la soumission

### Règles de validation
- **TextField** : Requis + minimum 3 caractères
- **Select/Autocomplete** : Sélection requise
- **Checkbox** : Aucune validation (booléen)
- **DatePicker** : Optionnel, mais si sélectionné doit être dans le futur
- **Formulaire** : Au moins un champ requis doit être rempli

## 🔧 Architecture de validation

Le projet implémente une validation similaire pour les deux bibliothèques :

- **Validation au niveau des champs** : Feedback immédiat pendant la saisie
- **Validation au niveau du formulaire** : Règles transversales et complexes
- **Validation onSubmit** : Vérification finale avant soumission
- **Gestion d'erreurs** : Affichage cohérent avec Material UI Alerts

## 📊 Comparaison de performance

L'application permet de comparer les performances entre TanStack Form et Formik avec :
- **Timestamp de soumission** : Mesure du temps de traitement
- **Configuration identique** : Mêmes types de champs et validation
- **Interface cohérente** : Material UI pour une comparaison équitable

## 🧪 Tests et qualité

- **TypeScript strict** : Typage complet et vérifications
- **ESLint** : Règles de qualité et bonnes pratiques
- **Build optimisé** : Vite pour des performances optimales
- **Validation cross-browser** : Compatible avec les navigateurs modernes