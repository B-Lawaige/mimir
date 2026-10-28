# MIMIR

MIMIR est un jeu de mémoire en React : retrouve les paires d’icônes, progresse à travers dix niveaux et choisis des pactes à partir du niveau 5.

## Jouer

Après activation de GitHub Pages, le jeu sera disponible à l’adresse :

`https://<pseudo-github>.github.io/<nom-du-depot>/`

Le workflow GitHub Actions publie automatiquement le site à chaque push sur `main`. L’adresse exacte est aussi visible dans **Settings → Pages** et dans l’exécution du workflow.

## Règles

- Retourner deux cartes par tour et retrouver les paires identiques.
- Les niveaux comportent de 4 à 8 paires.
- Le nombre d’erreurs autorisées augmente selon le niveau.
- À partir du niveau 5, choisir l’un des pactes proposés ou continuer sans pacte.

## Stack

- React 19
- Vite 6
- JavaScript, CSS et Vitest

## Installation locale

Prérequis : Node.js 20 et npm.

```bash
npm ci
npm run dev
```

Pour vérifier le projet et construire le site :

```bash
npm test
npm run lint
npm run build
npm run preview
```

## Déploiement GitHub Pages

Le workflow [deploy.yml](./.github/workflows/deploy.yml) lance les tests, le lint et le build, puis publie `dist`. Vite déduit automatiquement le chemin de base à partir du nom du dépôt GitHub pendant le build.

1. Créer un dépôt GitHub, puis ajouter son URL comme remote `origin` si ce n’est pas déjà fait.
2. Envoyer la branche `main` sur GitHub.
3. Dans le dépôt, ouvrir **Settings → Pages** et sélectionner **GitHub Actions** comme source.
4. Vérifier la fin réussie de l’action **Deploy MIMIR to GitHub Pages**, puis ouvrir l’URL affichée dans **Settings → Pages**.

## Crédits des ressources

- Les icônes SVG viennent de Game-icons.net. Les contributeurs et les licences sont indiqués dans [`icon/license.txt`](./icon/license.txt) ; les icônes sont fournies sous CC BY 3.0, sauf indication CC0.
- Les sources, auteurs et licences des fichiers audio doivent être documentés avant la publication si les fichiers ne sont pas de création personnelle. Ajouter ces informations ici.
