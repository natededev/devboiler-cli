# DevBoiler CLI — Implementation Documentation

## Overview

DevBoiler is a zero-bloat project scaffolding CLI for React + Vite + TypeScript. It bootstraps projects via the official `create-vite` tooling and then applies progressive enhancement features on top of a meticulously clean base.

### Core Philosophy

1. **Upstream-first**: Uses `npx --yes create-vite@latest` to scaffold the base React + TypeScript project. This ensures the generated output always matches the latest Vite defaults.

2. **Bloat-free baseline**: Immediately after scaffolding, DevBoiler strips all default styling, removes `App.css`, empties `index.css`, and replaces `App.tsx` with a minimal professional component.

3. **Progressive composition**: Features are layered on demand — not template permutations. A single base project receives Tailwind, Zustand, React Router, and/or ESLint + Prettier via feature flags.

4. **Service architecture**: Business logic is encapsulated in dedicated service classes with single responsibilities, making the codebase testable and extensible.

---

## Project Structure

```
devboiler-cli/
├── bin/
│   └── devboiler.js              # Executable entry point
├── src/
│   ├── index.ts                  # Commander.js CLI setup
│   ├── commands/
│   │   ├── index.ts              # Barrel export
│   │   └── create.ts             # `create` command orchestration
│   ├── schemas/
│   │   └── index.ts              # Zod validation schemas
│   ├── services/
│   │   ├── index.ts              # Barrel export
│   │   ├── ViteService.ts        # Scaffolds via create-vite
│   │   ├── FeatureService.ts     # Applies features + cleanup
│   │   └── PackageManagerService.ts  # Package installation
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   └── utils/
│       ├── index.ts              # Barrel export
│       ├── logger.ts             # Clean professional logging (chalk)
│       └── spinner.ts            # Loading spinner wrapper (ora)
├── .eslintrc.js
├── .gitignore
├── .prettierrc.json
├── LICENSE
├── IMPLEMENTATION.md             # This file
├── README.md
├── package.json
└── tsconfig.json
```

---

## CLI Entry Point (`src/index.ts`)

Sets up Commander.js with:
- Program name: `devboiler`
- Version from `package.json`
- `create` command registered from `commands/create.ts`
- Help text with usage examples
- Auto-displays help when no arguments provided

```
Usage: devboiler [options] [command]

Commands:
  create [options] [name]  Scaffold a React + Vite project with optional features
```

---

## Create Command (`src/commands/create.ts`)

### Command Options

| Flag | Description | Default |
|------|-------------|---------|
| `[name]` | Project name | Required or prompted |
| `-p, --package-manager` | Package manager (npm, pnpm, yarn) | `npm` |
| `--skip-install` | Skip dependency installation | `false` |
| `--add-tailwind` | Add Tailwind CSS | `false` |
| `--add-zustand` | Add Zustand state management | `false` |
| `--add-react-router` | Add React Router | `false` |
| `--add-eslint-prettier` | Add ESLint & Prettier | `false` |

### Two Modes

**Interactive mode** (`devboiler create` without name):
1. Prompts for project name (validated via Zod)
2. Prompts for package manager
3. Prompts for each feature flag (Y/N)
4. Displays configuration summary
5. Executes workflow

**Non-interactive mode** (`devboiler create my-app --add-tailwind`):
1. Parses and validates all options via Zod
2. Displays configuration summary
3. Executes workflow without prompts

### Workflow Steps

```
[1/4] Scaffolding React + Vite + TypeScript project
  → ViteService.scaffold()

[2/4] Configuring project
  → FeatureService.cleanupBaseTemplate()    (remove bloat)
  → FeatureService.configurePathAliases()    (@/ import alias)

[3/4] Adding features
  → FeatureService.addTailwind()             (if flag set)
  → FeatureService.addZustand()              (if flag set)
  → FeatureService.addReactRouter()          (if flag set, standalone)
  → FeatureService.addReactRouterWithZustand() (if both Router + Zustand)

[4/4] Installing dependencies
  → PackageManagerService.install()
```

### Output Design

The CLI uses a clean, emoji-free professional aesthetic:

```
Project
────────────────────────────────────────
  test-app
  npm  ·  react-ts

  [1/4] Scaffolding React + Vite + TypeScript project
ok  Scaffolded
  [2/4] Configuring project
>  Cleaning up base template...
ok  Base template cleaned up
>  Configuring path aliases...
ok  Path aliases configured
ok  Configured
  [3/4] Adding features

Project: test-app
────────────────────────────────────────
  Location  C:\Users\...\test-app

  Next steps:

    cd test-app
    npm run dev
```

---

## ViteService (`src/services/ViteService.ts`)

### Purpose
Scaffolds a React + TypeScript project using the official Vite toolchain.

### How It Works

Uses `npx --yes create-vite@latest <name> --template react-ts` with `stdio: 'inherit'`. This:

- Downloads and runs the latest `create-vite` package automatically (`npx --yes` skips the npm install confirmation)
- Passes through all output directly to the user's terminal
- Allows the user to interact with create-vite's own prompts (install deps, start dev server)

### Why Not `npm create vite`?

`npm create vite@latest` in v9 presents an "Install with npm and start now?" prompt that can hang the CLI. Using `npx --yes create-vite@latest` directly skips npm's wrapper but still passes through create-vite's own prompts for a native interactive experience.

---

## FeatureService (`src/services/FeatureService.ts`)

The core service that handles all project modifications after scaffolding.

### `cleanupBaseTemplate()`

Removes all default Vite styling bloat:
- Deletes `src/App.css`
- Empties `src/index.css`
- Replaces `src/App.tsx` with a minimal professional starter:

```tsx
function App() {
  return (
    <main>
      <h1>React + Vite + TypeScript</h1>
      <p>Start building from this bloat-free setup.</p>
    </main>
  );
}
export default App;
```

### `configurePathAliases()`

Sets up `@/` import aliases pointing to `src/`:

**tsconfig.json** — adds to `compilerOptions`:
```json
{
  "baseUrl": ".",
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

**vite.config.ts** — adds to `defineConfig()`:
```ts
resolve: {
  alias: {
    '@': '/src',
  },
},
```

Note: Uses `'/src'` (not `path.resolve(__dirname, './src')`) because vite configs run in ESM mode where `__dirname` is not available. Vite resolves `/src` relative to the project root natively.

### `addTailwind()`

Installs: `tailwindcss`, `postcss`, `autoprefixer`

Creates:
- `tailwind.config.js` — content scanning config
- `postcss.config.js` — PostCSS with Tailwind + autoprefixer
- Updates `src/index.css` with `@tailwind base; @tailwind components; @tailwind utilities;`

### `addZustand()`

Installs: `zustand`

Creates:
- `src/store/counterStore.ts` — Example Zustand store with count, increment, decrement, reset

```ts
export const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

### `addReactRouter()`

Installs: `react-router-dom`

Replaces `src/App.tsx` with a router-enabled version featuring Home and About pages with navigation.

### `addReactRouterWithZustand()`

When both Zustand and React Router are selected, generates a composable multi-page layout:

- **Home page**: Shows counter value with increment/decrement/reset buttons (uses Zustand store)
- **About page**: Reads and displays the counter value from the same store
- Demonstrates state persistence across routes
- Uses `@/store/counterStore` import path (requires active path aliases)

### `addEslintPrettier()`

Installs (dev): `eslint`, `prettier`, `eslint-config-prettier`, `eslint-plugin-prettier`, `@types/eslint`

Creates:
- `.eslintrc.cjs` — ESLint config with TypeScript + React + Prettier plugins
- `.prettierrc` — Prettier config (single quotes, trailing commas, etc.)
- `.eslintignore` — Standard ignores (node_modules, dist, build, coverage)

---

## PackageManagerService (`src/services/PackageManagerService.ts`)

### Purpose
Handles all package manager operations across npm, pnpm, and yarn.

### Methods

- `install(cwd)` — Runs `npm install` / `pnpm install` / `yarn` in the project directory
- `addPackages(packages, cwd, dev)` — Installs specific packages (`npm install --save-dev` / `pnpm add -D` / `yarn add -D`)
- `isAvailable()` — Checks if the selected package manager is installed
- `detectAvailable()` — Static method that detects all available package managers on the system

### Key Features
- Uses `process.platform === 'win32'` check to enable shell mode on Windows
- Pipes stdout/stderr directly to the terminal for real-time feedback
- Proper error handling with meaningful exit code messages

---

## Types (`src/types/index.ts`)

```typescript
export type PackageManager = 'npm' | 'pnpm' | 'yarn';

export interface FeatureFlags {
  addTailwind: boolean;
  addZustand: boolean;
  addReactRouter: boolean;
  addEslintPrettier: boolean;
}

export interface CreateProjectConfig {
  name: string;
  packageManager: PackageManager;
  template: string;
  skipInstall: boolean;
}

export interface ProjectConfig extends CreateProjectConfig, FeatureFlags {}

export interface ServiceResult {
  success: boolean;
  error?: string;
  message?: string;
}
```

---

## Schemas (`src/schemas/index.ts`)

Zod validation for all user inputs:

```typescript
export const projectNameSchema = z.string()
  .min(1, 'Project name is required')
  .max(214, 'Project name is too long')
  .regex(/^[a-zA-Z0-9-_]+$/, 'Invalid characters');

export const createOptionsSchema = z.object({
  name: projectNameSchema,
  packageManager: z.enum(['npm', 'pnpm', 'yarn']).default('npm'),
  template: z.string().default('react-ts'),
  skipInstall: z.boolean().default(false),
  addTailwind: z.boolean().default(false),
  addZustand: z.boolean().default(false),
  addReactRouter: z.boolean().default(false),
  addEslintPrettier: z.boolean().default(false),
});
```

---

## Utilities

### Logger (`src/utils/logger.ts`)

Clean, emoji-free terminal output with chalk coloring:

| Method | Format | Color |
|--------|--------|-------|
| `success(msg)` | `ok  msg` | Green |
| `error(msg)` | `ERROR  msg` | Red |
| `warning(msg)` | `WARN  msg` | Yellow |
| `info(msg)` | `>  msg` | Blue |
| `step(n, total, msg)` | `  [n/total] msg` | Dimmed |
| `header(msg)` | `msg\n────────` | Bold + dim separator |
| `command(cmd)` | `  cmd` | White bright |
| `link(url)` | `  url` | Dimmed |

### Spinner (`src/utils/spinner.ts`)

Wraps `ora` for loading states (currently used by PackageManagerService install operations):
- `start(message)` — begins spinner
- `succeed(message)` — green check
- `fail(message)` — red fail
- `stop()` — clean stop

---

## Build & Development

### Prerequisites
- Node.js >= 18.0.0
- npm, pnpm, or yarn

### Commands

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript to dist/
npm run dev          # Watch mode
npm run clean        # Remove dist/
npm run lint         # Run ESLint
npm run format       # Run Prettier
```

### Local Testing

```bash
npm link
devboiler create test-app
cd test-app
npm run dev
```

### Testing Feature Combinations

```bash
# Base only
devboiler create test-app --skip-install

# Tailwind only
devboiler create test-app --add-tailwind --skip-install

# Zustand + React Router (composable layout)
devboiler create test-app --add-zustand --add-react-router --skip-install

# Full stack
devboiler create test-app --add-tailwind --add-zustand --add-react-router --add-eslint-prettier
```

---

## Dependencies

### Production

| Package | Purpose |
|---------|---------|
| `chalk` (v4) | Colored terminal output |
| `commander` (v12) | CLI framework |
| `fs-extra` (v11) | Enhanced file system operations |
| `ora` (v5) | Loading spinners |
| `prompts` (v2) | Interactive prompts |
| `zod` (v3) | Schema validation |

### Development

| Package | Purpose |
|---------|---------|
| `typescript` (v5) | TypeScript compiler |
| `@types/node` | Node.js type definitions |
| `@types/fs-extra` | fs-extra type definitions |
| `@types/prompts` | prompts type definitions |
| `eslint` (v8) | Linting |
| `@typescript-eslint/*` | TypeScript ESLint integration |
| `prettier` (v3) | Code formatting |

---

## Configuration Files

### tsconfig.json

- Target: ES2022
- Module: NodeNext (ESM)
- Strict mode enabled
- All strict flags enabled (noImplicitAny, strictNullChecks, etc.)
- Source maps and declaration files generated
- Output: `dist/`

### .eslintrc.js

- Parser: `@typescript-eslint/parser`
- Extends: recommended, TypeScript strict, eslint:recommended
- Rules: no-explicit-any (warn), consistent-type-imports, no-floating-promises, curly

### .prettierrc.json

- Single quotes
- Trailing commas in ES5
- 80 char print width
- 2 space indentation
- LF line endings

---

## Future Extensibility

The service-based architecture enables easy addition of:

- **New frameworks**: Next.js, SvelteKit, Vue — create new service classes
- **Plugin system**: Implement `DevBoilerPlugin` interface with `beforeCreate`/`afterCreate` hooks
- **Configuration file**: `.devboilerrc` for default options
- **Additional features**: Testing setups (Vitest, Playwright), CI/CD configs, Docker files

The template-free approach means no static files to maintain — features are applied programmatically through service methods that install packages and write configuration files.