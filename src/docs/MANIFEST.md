# DevBoiler CLI — Core Architecture & Command Manifest 📘

This document serves as the absolute source of truth for the internal mechanics, command patterns, and system lifecycle requirements of the DevBoiler CLI project toolchain.

---

## 🛠️ 1. Global Lifecycle & Architecture Blueprint

DevBoiler operates as a zero-bloat, programmatic orchestration framework. Instead of relying on heavy, static template folders that degrade over time, it utilizes an atomic three-stage pipeline:

[1. User Input via CLI/Prompts] ──> [2. Native Upstream Scaffolding via Vite]
│
▼
[4. Clean Exit / Readiness]    <─── [3. Programmatic Feature Injection]


### Critical Architectural Guardrails
- **NodeNext Compliance:** Every internal file layout, command handler, utility, and service module MUST use strict ESM relative import strings appended with explicit `.js` extensions.
- **Atomic Transactions:** All system modifications are wrapped in an atomic file-system rollback gate. If any lifecycle step crashes, the target environment is completely swept clear to prevent directory contamination.

---

## 🛰️ 2. Command Reference Registry

### 🟢 `devboiler doctor`
**Description:** Validates host machine prerequisites to guarantee problem-free scaffolding execution before initiating code generation.

- **Execution Protocol:** Runs all system binary queries concurrently using asynchronous `Promise.all` handlers.
- **Cross-Platform Mapping:** Evaluates binaries using `where` on Windows systems and `which` on Unix/macOS environments.
- **Evaluated System Layers:**
  | Metric | Requirement | Failure Action |
  |---|---|---|
  | Node.js Runtime | `>= 18.0.0` | Soft Warning (Logs active version mismatch) |
  | Git Installation | Globally discoverable | Soft Warning (Suggests link) |
  | `npm` Binary | Globally discoverable | Standard Verification |
  | `pnpm` Binary | Optional fallback | Graceful "Not Found" flag display |
  | `yarn` Binary | Optional fallback | Graceful "Not Found" flag display |

---

### 🟢 `devboiler create [name]`
**Description:** Directs the upstream generation, structural de-bloating, and modular enrichment of a modern React + Vite + TypeScript web stack.

- **Input Modality Resolution Engine:**
  The command parses execution inputs using a strict **Three-Tier Evaluation System** to prevent accidental omission of feature flags:
  1. *No Arguments (`devboiler create`):* Enters full interactive mode. Prompts sequentially for Project Name, Package Manager preference, and all 4 core feature layers.
  2. *Name Specified Only (`devboiler create my-app`):* Hybrid Mode. Captures the project title argument immediately, skips the name prompt, but halts to safely query stack configuration options.
  3. *Flags Passed Inline (`devboiler create my-app --add-tailwind`):* Automation/Silent Mode. Directs arguments straight through Zod schemas, skipping prompt routines entirely to support headless execution scripts.

- **Core Inline Configuration Flags:**
  | Option Flag | Type | Evaluation Effect |
  |---|---|---|
  | `-p, --package-manager <type>` | `string` | Defines compilation target executor (`npm`, `pnpm`, `yarn`) |
  | `--add-tailwind` | `boolean` | Triggers Tailwind v4 PostCSS compilation injections |
  | `--add-zustand` | `boolean` | Drops typed, boilerplate-free global stores into workspace |
  | `--add-react-router` | `boolean` | Implements localized single-page client-side route mapping |
  | `--add-eslint-prettier` | `boolean` | Synthesizes strict linting and formatting rule trees |
  | `--skip-install` | `boolean` | Compiles file architecture but leaves `node_modules` unexpanded |

---

## 🧬 3. Core Service Engine Specifications

### 🔬 `ViteService.ts`
- **Execution:** Spawns a native shell process invoking `npx --yes create-vite@latest [name] --template react-ts`. This guarantees DevBoiler never breaks or becomes obsolete when Vite or React issue major framework updates.
- **De-bloating Subroutine:** The second scaffolding is written, it maps out and deletes raw boilerplate assets (`vite.svg`, `react.svg`), clears standard global configurations, and resets `App.tsx` into a pristine, blank functional container.

### 🔬 `FeatureService.ts`
The dynamic injection processor. Instead of overriding files blindly, it uses programmatic string and file-system manipulation to layer features on-demand.

- **Tailwind v4 Integration Layer:** Installs `tailwindcss`, `autoprefixer`, and the mandatory **`@tailwindcss/postcss`** plugin wrapper. It directly rewrites the style entrypoint into the strict modern v4 format: `@import "tailwindcss";` inside `src/index.css`.
- **Compositional Dashboard Synthesis:**
  Generates a premium, styled dashboard application out of the box based exclusively on what flags were passed to the terminal:
  - *Tailwind Present:* Builds a beautifully responsive, modern dark-mode canvas (`bg-zinc-950 text-zinc-50`) utilizing clean utility classes.
  - *Tailwind Absent:* Falls back cleanly to semantic, unstyled HTML blocks with minimal structural spacing so pure CSS users don't have to clean up residual framework artifacts.
  - *Zustand + Router Combined:* Injects an interactive sandbox proving state preservation across distinct views via navigation tabs instantly.

---

## 🛡️ 4. Active System Guardrails & Failure Rules

### The Atomic Rollback Protocol
- **Trigger Condition:** Any uncaught runtime error, command failure, missing binary crash, or network interruption during dependency installation.
- **Execution Lifecycle:**
  1. Intercepts error context within the orchestration layer.
  2. Evaluates the global variable state to isolate if `projectPath` was defined and activated.
  3. Safely halts all terminal interface loaders/spinners.
  4. Runs a recursive `fs.remove()` operation targeting the corrupt project directory.
  5. Outputs a detailed diagnostic breakdown to the terminal while leaving the host environment perfectly immaculate.