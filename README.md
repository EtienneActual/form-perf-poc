# POC Form Performance

Ce projet présente une interface simple pour comparer deux bibliothèques de formulaires React :

- TanStack Form (@tanstack/react-form)
- Formik

## Fonctionnalités

- Interface utilisateur claire avec navigation React Router
- Accès direct aux deux implémentations de formulaire via la page d'accueil
- Contrôle du nombre de champs dans chaque formulaire (de 1 à 50)
- Validation des champs en temps réel
- Affichage des résultats de soumission des formulaires
- Interface utilisateur Material UI pour une expérience utilisateur moderne

## Technologies utilisées

- React 19
- TypeScript
- Vite
- React Router
- Material UI
- TanStack Form
- Formik
- Yup (pour la validation dans Formik)

## Structure du projet

- `/src/components/FormA` : Implémentation du formulaire avec TanStack Form
- `/src/components/FormB` : Implémentation du formulaire avec Formik
- `/src/pages` : Pages de l'application (Accueil, TanStack, Formik)
- `/src/theme.tsx` : Configuration du thème Material UI

## Comment utiliser

1. Clonez ce dépôt
2. Installez les dépendances :

```bash
npm install
```

3. Lancez l'application en mode développement :

```bash
npm run dev
```

4. Ouvrez votre navigateur à l'adresse indiquée par Vite

## Fonctionnement

1. La page d'accueil présente deux boutons pour naviguer vers chaque formulaire
2. Chaque page de formulaire permet d'ajuster le nombre de champs (1-50)
3. Chaque formulaire utilise Material UI TextField pour une interface utilisateur cohérente
4. La validation des champs est effectuée en temps réel (minimum 3 caractères requis)
5. Après la soumission, les valeurs du formulaire sont affichées au format JSON
   project: ['./tsconfig.node.json', './tsconfig.app.json'],
   tsconfigRootDir: import.meta.dirname,
   },
   // other options...
   },
   },
   ])

````

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
````
