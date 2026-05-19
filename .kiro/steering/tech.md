# Tech Stack

## Core

- **React 19** with function components and hooks. No class components.
- **Vite 8** as build tool and dev server (`@vitejs/plugin-react`).
- **Tailwind CSS v4** via the official `@tailwindcss/vite` plugin. Styles use the v4 single-line import (`@import "tailwindcss";` in `src/index.css`) — there is no `tailwind.config.js` and none should be added unless v4 customization requires it.
- **Recharts 3** for line, bar, and pie charts. Tables and the process diagram are hand-rolled SVG/HTML.
- **JavaScript (JSX), not TypeScript.** `@types/react` is present only because Vite's React plugin pulls it in. Do not introduce `.ts`/`.tsx` files unless the project is migrated wholesale.
- **ESLint flat config** (`eslint.config.js`) using `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`. The `dist/` folder is globally ignored.

## External services

- **OpenRouter** (`https://openrouter.ai/api/v1/chat/completions`) is the only network dependency. Models are selectable in-app via `ModelSelector`; default is `openai/gpt-4o-mini`.

## Environment variables

All env vars must be prefixed with `VITE_` to be exposed to client code.

- `VITE_OPENROUTER_API_KEY` — system-wide OpenRouter key. Optional; if absent, the app forces personal-key mode.

`.env` is git-ignored. `.env.example` is the source of truth for required keys.

## Vite-specific imports

- Markdown is loaded as raw text using `?raw` (`import rulebook from "./docs/...md?raw"`). Keep this pattern when adding more reference docs.
- Static assets in `public/` are referenced by absolute path (`/favicon.svg`, `/icons.svg`).

## Common commands

| Command           | Purpose                             |
| ----------------- | ----------------------------------- |
| `npm install`     | Install dependencies.               |
| `npm run dev`     | Start the Vite dev server with HMR. |
| `npm run build`   | Production build into `dist/`.      |
| `npm run preview` | Serve the built output locally.     |
| `npm run lint`    | Run ESLint over the project.        |

There is no test runner configured. Do not add one unless explicitly requested.

## Coding conventions

- Default-export function components, one per file, named in `PascalCase`.
- Custom hooks live in `src/hooks/`, prefixed `use*`, default-exported.
- Prefer `useState`/`useEffect` and small composed hooks (see `useChartDraft`, `useDebounce`) over external state libraries.
- Use `structuredClone` when copying chart data to avoid shared-reference bugs.
- Tailwind utility classes inline on JSX. No CSS modules, no styled-components.
- The codebase tolerates both semicolon and semicolon-free JS files. Match the style of the file you are editing.
- Strings use double quotes in JSX/components (App.jsx) and single quotes in plain JS data (prompts.js, hooks). Match the surrounding file.
