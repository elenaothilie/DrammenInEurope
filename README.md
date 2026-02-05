# React + TypeScript + Vite

## Deploy notifications (Telegram)

On each push to `main`, a GitHub Action notifies your Telegram group about the Vercel deployment (success or failure).

### 1. Vercel environment variables

In your Vercel project → Settings → Environment Variables, add:

- `TELEGRAM_BOT_TOKEN` – from [@BotFather](https://t.me/BotFather)
- `TELEGRAM_GROUP_ID` – the group chat ID (e.g. `-1001234567890`)
- `NOTIFY_SECRET` (optional) – a shared secret so only the workflow can call the notify API

### 2. GitHub secrets

In the repo → Settings → Secrets and variables → Actions, add:

- **`NOTIFY_URL`** (required) – production URL, e.g. `https://yourapp.vercel.app`
- **`NOTIFY_SECRET`** (optional) – same value as in Vercel if you use it
- **`VERCEL_TOKEN`** (optional) – [Vercel API token](https://vercel.com/account/tokens) so the workflow can report real success/failure
- **`VERCEL_PROJECT_ID`** (optional) – from Vercel project settings (e.g. `prj_xxx`) or the project name

Without `VERCEL_TOKEN` and `VERCEL_PROJECT_ID`, the message will say “Deployment triggered” only.

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
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
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
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
```
