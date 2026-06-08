<div align="center">

<img src="./devboiler.svg" width="120" height="120" alt="devboiler logo" />

# devboiler

### The Hyper-Minimalist, Zero-Bloat Scaffolder for Modern Web Stacks.

[![npm version](https://img.shields.io/npm/v/devboiler.svg?style=flat-square&color=zinc)](https://www.npmjs.com/package/devboiler)
[![license](https://img.shields.io/github/license/Nathanael-Omebele/devboiler-cli?style=flat-square&color=zinc)](LICENSE)

---
</div>

`devboiler` is an open-source command-line orchestration engine built to spin up production-ready, ultra-clean web workspaces in seconds. No configuration fatigue. No hidden wrappers. No ecosystem bloat.

## ⚡ The Core Philosophy: Zero-Bloat, Maximum Security

In an ecosystem saturated with heavy starters that drag down megabytes of unvetted boilerplate, `devboiler` delivers an immaculate developer experience through a **programmatic injection pipeline**:

* 🔒 **Zero Dependency Footprint:** Built natively using lightweight runtime primitives. Your final scaffolded app contains exactly what you asked for—nothing more.
* 🛡️ **Atomic Rollback Architecture:** If an installation fails or gets interrupted mid-process, the engine catches it, safely terminates, and recursively sweeps the target directory clean to prevent workspace contamination.
* 🚀 **Native Tooling Pipelines:** Harnesses the raw power of **Tailwind CSS v4's native Vite compiler plugin**—completely bypassing legacy PostCSS configurations for blazingly fast builds.

---

## 🚀 Quick Start

Launch the interactive setup wizard globally instantly without installation:

```bash
npx devboiler create
System DiagnosticsVerify your local machine environment is fully compatible and optimized before running a scaffold:Bashnpx devboiler doctor
🎛️ Feature MatrixSelect your core engineering layers seamlessly via interactive prompts or headless CLI flags:Feature LayerSelected StackExecution BlueprintCore CoreReact + Vite + TypeScriptPruned, blank functional container (Vite defaults purged)StylingTailwind CSS v4Native @tailwindcss/vite compilation engine unshifted into configurationStateZustandBoilerplate-free global stores with cross-route state persistenceRoutingReact RouterClean, high-performance client-side single-page route mappingsLintingESLint + PrettierPre-configured, unified code quality and formatting rule trees🔧 Headless Automation FlagsSkip the prompts entirely and spin up workspaces programmatically using inline flags:Bashdevboiler create my-app --add-tailwind --add-zustand --add-react-router --package-manager npm
Supported Flags-p, --package-manager <npm\|pnpm\|yarn> — Define explicit target executor--add-tailwind — Injects native Tailwind v4 build engine--add-zustand — Drops typed global store configurations into workspace--add-react-router — Initializes client-side navigation maps--add-eslint-prettier — Appends strict formatting rules--skip-install — Constructs directory architecture without expanding node_modules🏛️ System BlueprintFor an exhaustive analysis of the system specifications, error catching boundaries, and localized lifecycle routines, explore our internal Architecture & Command Manifest.