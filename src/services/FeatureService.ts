import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/index.js';
import { PackageManagerService } from './PackageManagerService.js';
import type { PackageManager } from '../types/index.js';

/**
 * Feature configuration for progressive enhancement
 */
interface FeatureConfig {
  name: string;
  packages: string[];
  devPackages: string[];
  files: Record<string, string>;
}

/**
 * Service for adding features to a scaffolded Vite project
 * Handles Tailwind CSS, Zustand, React Router, and ESLint/Prettier
 * Also provides base template cleanup for a zero-bloat starting point
 */
export class FeatureService {
  private readonly projectPath: string;
  private readonly packageManager: PackageManager;
  private readonly packageManagerService: PackageManagerService;

  constructor(projectPath: string, packageManager: PackageManager = 'npm') {
    this.projectPath = projectPath;
    this.packageManager = packageManager;
    this.packageManagerService = new PackageManagerService(packageManager);
  }

  /**
   * Clean up the base Vite template to provide a zero-bloat starting point
   * Removes default styling and strips App.tsx to a minimal component
   */
  async cleanupBaseTemplate(): Promise<void> {
    logger.info('Cleaning up base template...');

    // Delete src/App.css (default Vite styling)
    const appCssPath = path.join(this.projectPath, 'src', 'App.css');
    if (await fs.pathExists(appCssPath)) {
      await fs.remove(appCssPath);
    }

    // Clear src/index.css (remove default Vite styles)
    const indexCssPath = path.join(this.projectPath, 'src', 'index.css');
    await fs.writeFile(indexCssPath, '');

    // Strip src/App.tsx to a clean, minimal component
    const appTsxPath = path.join(this.projectPath, 'src', 'App.tsx');
    await fs.writeFile(appTsxPath, this.getMinimalApp());

    logger.success('Base template cleaned up');
  }

  /**
   * Configure absolute path aliases (@ prefix pointing to src/)
   * Modifies tsconfig.json and vite.config.ts
   */
  async configurePathAliases(): Promise<void> {
    logger.info('Configuring path aliases...');

    // Update tsconfig.json
    const tsconfigPath = path.join(this.projectPath, 'tsconfig.json');
    if (await fs.pathExists(tsconfigPath)) {
      const tsconfig = await fs.readJSON(tsconfigPath);
      
      // Ensure compilerOptions exists
      if (!tsconfig.compilerOptions) {
        tsconfig.compilerOptions = {};
      }
      
      // Add path aliases
      tsconfig.compilerOptions.paths = {
        '@/*': ['./src/*']
      };
      
      // Ensure baseUrl is set
      tsconfig.compilerOptions.baseUrl = '.';

      await fs.writeJSON(tsconfigPath, tsconfig, { spaces: 2 });
    }

    // Update vite.config.ts
    // Note: vite.config.ts runs in ESM mode where __dirname is not available.
    // We use '/src' as a relative path which Vite resolves to the project root's /src directory.
    const viteConfigPath = path.join(this.projectPath, 'vite.config.ts');
    if (await fs.pathExists(viteConfigPath)) {
      const viteConfig = await fs.readFile(viteConfigPath, 'utf-8');
      
      // If resolve.alias is already configured, skip
      if (viteConfig.includes('resolve:')) {
        logger.success('Path aliases already configured in vite.config.ts');
        return;
      }
      
      // Replace the defineConfig content to add resolve.alias
      // '/src' is relative to the project root which is what Vite uses as the base
      const updatedConfig = viteConfig.replace(
        /plugins: \[react\(\)\]/,
        `resolve: {
      alias: {
        '@': '/src',
      },
    },
    plugins: [react()]`
      );

      await fs.writeFile(viteConfigPath, updatedConfig);
    }

    logger.success('Path aliases configured');
  }

  /**
   * Feature configurations with package dependencies and file contents
   */
  private getFeatureConfigs(): Record<string, FeatureConfig> {
    return {
      tailwind: {
        name: 'Tailwind CSS',
        packages: ['tailwindcss', 'postcss', 'autoprefixer'],
        devPackages: [],
        files: {
          'tailwind.config.js': this.getTailwindConfig(),
          'postcss.config.js': this.getPostCssConfig(),
          'src/index.css': this.getTailwindCss(),
        },
      },
      zustand: {
        name: 'Zustand',
        packages: ['zustand'],
        devPackages: [],
        files: {
          'src/store/counterStore.ts': this.getCounterStore(),
        },
      },
      'react-router': {
        name: 'React Router',
        packages: ['react-router-dom'],
        devPackages: [],
        files: {
          'src/App.tsx': this.getReactRouterApp(),
        },
      },
      'eslint-prettier': {
        name: 'ESLint & Prettier',
        packages: [],
        devPackages: [
          'eslint',
          'prettier',
          'eslint-config-prettier',
          'eslint-plugin-prettier',
          '@types/eslint',
        ],
        files: {
          '.eslintrc.cjs': this.getEslintConfig(),
          '.prettierrc': this.getPrettierConfig(),
          '.eslintignore': this.getEslintIgnore(),
        },
      },
    };
  }

  /**
   * Add Tailwind CSS to the project
   */
  async addTailwind(): Promise<void> {
    const configs = this.getFeatureConfigs();
    const config = configs.tailwind;
    if (!config) throw new Error('Tailwind config not found');
    
    logger.info('Adding Tailwind CSS...');

    // Install packages
    await this.packageManagerService.addPackages(
      config.packages,
      this.projectPath,
      false
    );

    // Write config files
    await this.writeFile('tailwind.config.js', config.files['tailwind.config.js']!);
    await this.writeFile('postcss.config.js', config.files['postcss.config.js']!);

    // Update src/index.css with Tailwind directives
    const cssPath = path.join(this.projectPath, 'src', 'index.css');
    await fs.writeFile(cssPath, config.files['src/index.css']!);

    logger.success('Tailwind CSS added successfully');
  }

  /**
   * Add Zustand to the project
   */
  async addZustand(): Promise<void> {
    const configs = this.getFeatureConfigs();
    const config = configs.zustand;
    if (!config) throw new Error('Zustand config not found');
    
    logger.info('Adding Zustand...');

    // Install packages
    await this.packageManagerService.addPackages(
      config.packages,
      this.projectPath,
      false
    );

    // Create store directory and file
    const storeDir = path.join(this.projectPath, 'src', 'store');
    await fs.ensureDir(storeDir);
    await this.writeFile(path.join('src', 'store', 'counterStore.ts'), config.files['src/store/counterStore.ts']!);

    logger.success('Zustand added successfully');
  }

  /**
   * Add React Router to the project
   */
  async addReactRouter(): Promise<void> {
    const configs = this.getFeatureConfigs();
    const config = configs['react-router'];
    if (!config) throw new Error('React Router config not found');
    
    logger.info('Adding React Router...');

    // Install packages
    await this.packageManagerService.addPackages(
      config.packages,
      this.projectPath,
      false
    );

    // Replace App.tsx with router-enabled version
    const appPath = path.join(this.projectPath, 'src', 'App.tsx');
    await fs.writeFile(appPath, config.files['src/App.tsx']!);

    logger.success('React Router added successfully');
  }

  /**
   * Add React Router with Zustand integration
   * Creates a composable multi-page layout that demonstrates
   * reading and writing to a Zustand store across routes
   */
  async addReactRouterWithZustand(): Promise<void> {
    const configs = this.getFeatureConfigs();
    const config = configs['react-router'];
    if (!config) throw new Error('React Router config not found');
    
    logger.info('Adding React Router with Zustand integration...');

    // Install packages (Zustand should already be installed)
    await this.packageManagerService.addPackages(
      config.packages,
      this.projectPath,
      false
    );

    // Replace App.tsx with composable layout
    const appPath = path.join(this.projectPath, 'src', 'App.tsx');
    await fs.writeFile(appPath, this.getComposableAppLayout());

    logger.success('React Router with Zustand integration added successfully');
  }

  /**
   * Add ESLint and Prettier to the project
   */
  async addEslintPrettier(): Promise<void> {
    const configs = this.getFeatureConfigs();
    const config = configs['eslint-prettier'];
    if (!config) throw new Error('ESLint & Prettier config not found');
    
    logger.info('Adding ESLint & Prettier...');

    // Install dev packages
    await this.packageManagerService.addPackages(
      config.devPackages,
      this.projectPath,
      true
    );

    // Write config files
    await this.writeFile('.eslintrc.cjs', config.files['.eslintrc.cjs']!);
    await this.writeFile('.prettierrc', config.files['.prettierrc']!);
    await this.writeFile('.eslintignore', config.files['.eslintignore']!);

    logger.success('ESLint & Prettier added successfully');
  }

  /**
   * Write a file to the project directory
   */
  private async writeFile(filePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.projectPath, filePath);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, content);
  }

  // ==================== Snippet Generators ====================

  private getMinimalApp(): string {
    return `function App() {
  return (
    <main>
      <h1>React + Vite + TypeScript</h1>
      <p>Start building from this bloat-free setup.</p>
    </main>
  );
}

export default App;
`;
  }

  private getTailwindConfig(): string {
    return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
  }

  private getPostCssConfig(): string {
    return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
  }

  private getTailwindCss(): string {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;
`;
  }

  private getCounterStore(): string {
    return `import { create } from 'zustand';

interface CounterStore {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
`;
  }

  private getReactRouterApp(): string {
    return `import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to the home page!</p>
    </div>
  );
}

function About() {
  return (
    <div>
      <h1>About Page</h1>
      <p>This is the about page.</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
`;
  }

  /**
   * Generate a composable multi-page layout with Zustand integration
   * Demonstrates reading and writing to a Zustand store across routes
   */
  private getComposableAppLayout(): string {
    return `import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useCounterStore } from '@/store/counterStore';

// Home page with counter controls
function Home() {
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <div>
      <h1>Home Page</h1>
      <p>Counter: {count}</p>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
        <button onClick={reset}>Reset</button>
      </div>
      <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
        Navigate to About to see the counter persists
      </p>
    </div>
  );
}

// About page that reads from the same store
function About() {
  const count = useCounterStore((state) => state.count);

  return (
    <div>
      <h1>About Page</h1>
      <p>Current counter value from Zustand: {count}</p>
      <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
        The counter is shared across routes
      </p>
    </div>
  );
}

// Main App component with routing
function App() {
  return (
    <Router>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #eee', marginBottom: '2rem' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
`;
  }

  private getEslintConfig(): string {
    return `module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
`;
  }

  private getPrettierConfig(): string {
    return `{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
`;
  }

  private getEslintIgnore(): string {
    return `node_modules
dist
build
coverage
`;
  }
}