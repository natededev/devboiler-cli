# DevBoiler CLI — Core Architecture & Command Manifest 📘

This document serves as the absolute source of truth for the internal mechanics, command patterns, and system lifecycle requirements of the DevBoiler CLI project toolchain.

---

## 1. Global Lifecycle & Architecture Blueprint

DevBoiler operates as a zero-bloat, programmatic orchestration framework. Instead of relying on heavy, static template folders that degrade over time, it utilizes an atomic three-stage pipeline:

1. User Input via CLI/Prompts
2. Native Upstream Scaffolding via Vite
3. Programmatic Feature Injection
4. Clean Exit / Readiness

### Critical Architectural Guardrails
- **NodeNext Compliance:** Every internal file layout, command handler, utility, and service module MUST use strict ESM relative import strings appended with explicit `.js` extensions.
- **Atomic Transactions:** All system modifications are wrapped in an atomic file-system rollback gate. If any lifecycle step crashes, the target environment is completely swept clear via `fs.remove()` to prevent directory contamination.

---

## 2. Command Reference Registry

### `devboiler doctor`
**Description:** Validates host machine prerequisites to guarantee problem-free scaffolding execution before initiating code generation.

- **Execution Protocol:** Runs all system binary queries concurrently using asynchronous `Promise.all` handlers for maximum speed.
- **Cross-Platform Mapping:** Evaluates binaries using `where` on Windows systems and `which` on Unix/macOS environments.
- **Evaluated System Layers:**
  | Metric | Requirement | Failure Action |
  |---|---|---|
  | Node.js Runtime | `>= 18.0.0` | Mandatory Requirement. Triggers hard error if unmet. |
  | Git Installation | Globally discoverable | Mandatory Requirement. Triggers hard error if unmet. |
  | `npm` Binary | Globally discoverable | Mandatory Requirement. Triggers hard error if unmet. |
  | `pnpm` Binary | Optional fallback | Soft Warning. Displays `!` indicator without halting execution. |
  | `yarn` Binary | Optional fallback | Soft Warning. Displays `!` indicator without halting execution. |

### `devboiler create [name]`
**Description:** Directs the upstream generation, structural de-bloating, and modular enrichment of a modern React + Vite + TypeScript web stack.

- **Input Modality Resolution Engine:**
  The command parses execution inputs using a strict Three-Tier Evaluation System to prevent accidental omission of feature flags:
  1. *No Arguments (`devboiler create`):* Enters full interactive mode using sequential prompts.
  2. *Name Specified Only (`devboiler create my-app`):* Hybrid Mode. Captures the project title argument immediately, skips the name prompt, but safely queries stack configuration options.
  3. *Flags Passed Inline:* Automation/Silent Mode. Directs arguments straight through Zod schemas, skipping prompt routines entirely to support headless execution scripts.

---

## 3. Core Service Engine Specifications

### `ViteService.ts`
- **Execution:** Spawns a native shell process invoking `npx --yes create-vite@latest [name] --template react-ts`. This guarantees DevBoiler never breaks when Vite or React issue major framework updates.
- **De-bloating Subroutine:** The second scaffolding is written, it maps out and deletes raw boilerplate assets (`vite.svg`, `react.svg`), clears standard global configurations, and resets `App.tsx` into a pristine, blank functional container.

### `FeatureService.ts`
The dynamic injection processor. Instead of overriding files blindly, it uses programmatic string and file-system manipulation to layer features on-demand.

- **Native Tailwind v4 Engine Integration:** Installs `tailwindcss` and the native compiler plugin `@tailwindcss/vite`. It runs a programmatic injection method `injectTailwindVitePlugin()` which unshifts `tailwindcss()` directly into the `plugins: [...]` array of the generated `vite.config.ts`, completely eliminating the need for heavy `postcss.config.js` or `tailwind.config.js` files.
- **Asset Asset Pipeline Wrapper:** Reads the native standalone `devboiler.svg` logo asset from the CLI package workspace at runtime and cleanly transfers it to the user's scaffolded `public/favicon.svg` destination path, preserving zero-bloat bundle binaries.