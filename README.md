# DevBoiler CLI 🚀

DevBoiler is a zero-bloat project scaffolding CLI tool for React + Vite + TypeScript. It leverages official upstream toolchains under the hood and layers features programmatically on demand, leaving you with a meticulously clean starting environment.

## Why DevBoiler?

Standard boilerplates and frameworks often come with significant styling noise, counter buttons, asset overhead, or complex configurations that you immediately have to delete. 

DevBoiler solves this by enforcing an **aggressive de-bloating process** the moment a project is initialized, followed by precise, progressive feature enhancements tailored *exactly* to what you need—and nothing you don't.

### Core Philosophy
- **Upstream-First:** Uses `npx --yes create-vite@latest` natively to ensure your base project always inherits the latest upstream toolchain defaults, performance improvements, and security patches.
- **Zero-Bloat Baseline:** Instantly purges standard Vite asset boilerplate, clears default styling, and sets up a pristine, minimalist single-element component tree.
- **Composable Growth:** Features are injected programmatically using service-based file manipulation rather than maintaining multiple static template folders.

---

## Features

Select only what your project requires during initialization:
- **Tailwind CSS:** Fully configured with isolated PostCSS settings and a completely stripped `index.css`.
- **Zustand:** Drops a cleanly typed, boilerplate-free state manager store (`src/store/counterStore.ts`) ready for consumption.
- **React Router:** Sets up a lightweight, performance-tuned client-side routing tree with minimal page stubs.
- **Router + Zustand Composition:** Automatically coordinates multi-page routing states out-of-the-box if both flags are chosen, showing you state persistence across routes cleanly.
- **Path Aliases:** Pre-configures zero-config absolute path mappings (`@/*` pointing to `src/*`) inside `tsconfig.json` and `vite.config.ts`.

---

## Installation & Usage

You can use DevBoiler interactively or run it silently with inline flags.

### Interactive Mode
Simply execute the creator command, and an interactive prompt will guide you through your stack configurations:
```bash
npx devboiler create
Non-Interactive ModeSkip the prompt pipeline entirely by passing specific flags directly:Bash# Example: Create a lean Tailwind + Zustand stack
npx devboiler create my-app --add-tailwind --add-zustand
CLI Command OptionsFlagDescription[name]Name of the project directory-p, --package-managerSpecify preferred package manager (npm, pnpm, yarn)--add-tailwindSeamlessly integrate Tailwind CSS configurations--add-zustandSetup a lightweight global Zustand store--add-react-routerBuild a clean client-side routing navigation structure--add-eslint-prettierInstall and configure synchronized ESLint & Prettier configs--skip-installScaffold files but skip running automatic dependency installationsLocal DevelopmentTo contribute to DevBoiler or test changes locally on your machine:Clone and Install Tooling:Bashgit clone [https://github.com/yourusername/devboiler-cli.git](https://github.com/yourusername/devboiler-cli.git)
cd devboiler-cli
npm install
Build and Link Globally:Bashnpm run build
npm link
Scaffold a Test App:Move to any empty directory outside the repository workspace and run your local binary:Bashdevboiler create test-project
LicenseMIT