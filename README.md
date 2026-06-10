<div align="center">

<img src="./devboiler.svg" width="120" height="120" alt="devboiler logo" />

# DevBoiler

### The Hyper-Minimalist, Zero-Bloat Scaffolder for Modern Web Stacks

[![npm version](https://img.shields.io/npm/v/devboiler.svg?style=flat-square&color=zinc)](https://www.npmjs.com/package/devboiler)
[![license](https://img.shields.io/github/license/natededev/devboiler-cli?style=flat-square&color=zinc)](LICENSE)

---

</div>

DevBoiler is an open-source command-line orchestration engine engineered to initialize production-ready, clean web workspaces instantly. It eliminates configuration fatigue, hidden wrappers, and boilerplate accumulation.

---

## 🏗️ Core Architecture and Security Framework

Unlike traditional template generators that pull downstream repository clones containing unvetted configurations, DevBoiler utilizes a direct, programmatic compilation layer modeled after enterprise pipeline primitives.

### Zero Dependency Footprint

The CLI operates exclusively on essential runtime primitives. Scaffolded environments contain only the explicitly declared packages requested by the operator.

### Atomic Rollback Architecture

File system executions are transactional. If an installation runtime error or network interruption occurs mid-process, the engine safely halts execution and recursively sweeps the targeted workspace directory to prevent artifact corruption.

### Native Compilation Pipelines

Harnesses the native Vite compiler plugin for Tailwind CSS v4, completely bypassing legacy PostCSS abstractions for high-performance builds.

Following the design parameters found within the [Vite Core Repository](https://github.com/vitejs/vite), DevBoiler acts as a transparent orchestrator over the native build tool, ensuring your configuration remains clean, modular, and directly aligned with upstream specifications.

---

## 🚀 Quick Start

Launch the interactive setup wizard globally instantly without installation:

```bash
npx devboiler create
```

---

## 🔍 System Diagnostics

Verify your local machine environment is fully compatible and optimized before running a scaffold:

```bash
npx devboiler doctor
```

---

## 🎛️ Feature Matrix

Select your core engineering layers seamlessly via interactive prompts or headless CLI flags:

| Feature Layer | Selected Stack | Execution Blueprint |
|--------------|---------------|---------------------|
| Core | React + Vite + TypeScript | Pruned, blank functional container (Vite defaults purged) |
| Styling | Tailwind CSS v4 | Native `@tailwindcss/vite` compilation engine integrated directly into configuration |
| State | Zustand | Boilerplate-free global stores with cross-route state persistence |
| Routing | React Router | Clean, high-performance client-side route mappings |
| Linting | ESLint + Prettier | Pre-configured, unified code quality and formatting rule trees |

---

## 🔧 Headless Automation Flags

Skip the prompts entirely and spin up workspaces programmatically using inline flags:

```bash
devboiler create my-app \
  --add-tailwind \
  --add-zustand \
  --add-react-router \
  --package-manager npm
```

---

## 📋 Supported Execution Flags

| Flag | Description |
|--------|-------------|
| `-p, --package-manager <npm \| pnpm \| yarn>` | Explicitly target runtime executor |
| `--add-tailwind` | Injects the native Tailwind CSS v4 Vite compilation engine |
| `--add-zustand` | Initializes typed global store configurations |
| `--add-react-router` | Maps client-side application routes |
| `--add-eslint-prettier` | Injects linting and formatting rule trees |
| `--skip-install` | Constructs directory architecture without running dependency installation |

---

## 🏛️ System Blueprint

For an exhaustive analysis of the system specifications, error catching boundaries, and localized lifecycle routines, explore our internal **Architecture & Command Manifest**.

---

## 💡 Philosophy

DevBoiler was designed around a simple principle:

> Generate only what developers actually need.

No hidden abstractions. No opinionated framework layers. No unnecessary dependencies. No vendor lock-in.

The generated project remains fully transparent, allowing developers to work directly with upstream tooling and official documentation while maintaining complete control over their codebase.

---

## 📄 License

MIT License.

See the [LICENSE](LICENSE) file for details.