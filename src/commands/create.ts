import { Command } from 'commander';
import prompts from 'prompts';
import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import { logger } from '../utils/index.js';
import {
  ViteService,
  FeatureService,
  PackageManagerService,
} from '../services/index.js';
import { createOptionsSchema, validateProjectName } from '../schemas/index.js';
import type { PackageManager, ProjectConfig } from '../types/index.js';

/**
 * Prompts for interactive project configuration
 */
async function promptForConfig(
  initialName?: string
): Promise<ProjectConfig> {
  const { name } = await prompts(
    {
      type: 'text',
      name: 'name',
      message: 'Project name:',
      initial: initialName || 'my-react-app',
      validate: (value: string): string | boolean => {
        const validation = validateProjectName(value);
        return validation.valid ? true : (validation.error || 'Invalid project name');
      },
    },
    {
      onCancel: () => {
        logger.error('Project creation cancelled');
        process.exit(1);
      },
    }
  );

  const { packageManager } = await prompts(
    {
      type: 'select',
      name: 'packageManager',
      message: 'Package manager:',
      choices: [
        { title: 'npm', value: 'npm' },
        { title: 'pnpm', value: 'pnpm' },
        { title: 'yarn', value: 'yarn' },
      ],
      initial: 0,
    },
    {
      onCancel: () => {
        logger.error('Project creation cancelled');
        process.exit(1);
      },
    }
  );

  const features = await prompts(
    [
      {
        type: 'confirm',
        name: 'addTailwind',
        message: 'Add Tailwind CSS?',
        initial: false,
      },
      {
        type: 'confirm',
        name: 'addZustand',
        message: 'Add Zustand (state management)?',
        initial: false,
      },
      {
        type: 'confirm',
        name: 'addReactRouter',
        message: 'Add React Router?',
        initial: false,
      },
      {
        type: 'confirm',
        name: 'addEslintPrettier',
        message: 'Add ESLint & Prettier?',
        initial: false,
      },
    ],
    {
      onCancel: () => {
        logger.error('Project creation cancelled');
        process.exit(1);
      },
    }
  );

  return {
    name,
    packageManager: packageManager as PackageManager,
    template: 'react-ts',
    skipInstall: false,
    ...features,
  };
}

/**
 * Display configuration summary before starting
 */
function displaySummary(config: ProjectConfig): void {
  logger.header('Project');
  console.log(`  ${chalk.bold(config.name)}`);
  console.log(`  ${chalk.dim(config.packageManager)}  ·  react-ts`);
  
  const features = [];
  if (config.addTailwind) features.push('Tailwind');
  if (config.addZustand) features.push('Zustand');
  if (config.addReactRouter) features.push('React Router');
  if (config.addEslintPrettier) features.push('ESLint & Prettier');
  
  if (features.length > 0) {
    console.log(`  ${chalk.dim(features.join(', '))}`);
  }
  
  console.log('');
}

/**
 * Display success message with next steps
 */
function displaySuccess(config: ProjectConfig): void {
  console.log('');
  logger.header(`Project: ${config.name}`);
  
  console.log(`  Location  ${chalk.dim(path.resolve(config.name))}`);
  console.log('');
  console.log(`  Next steps:`);
  console.log('');
  logger.command(`  cd ${config.name}`);
  logger.command(`  ${config.packageManager} run dev`);
  console.log('');

  if (config.addTailwind || config.addZustand || config.addReactRouter || config.addEslintPrettier) {
    console.log(`  Resources`);
    
    if (config.addTailwind) {
      logger.link('  https://tailwindcss.com/docs');
    }
    
    if (config.addZustand) {
      logger.link('  https://zustand-demo.pmnd.rs');
    }
    
    if (config.addReactRouter) {
      logger.link('  https://reactrouter.com');
    }
    
    if (config.addEslintPrettier) {
      console.log('');
      logger.command(`  ${config.packageManager} run lint`);
      logger.command(`  ${config.packageManager} run format`);
    }
  }
  
  console.log('');
}

/**
 * Prompt for features and package manager only (name already provided)
 */
async function promptForFeatures(
  name: string
): Promise<ProjectConfig> {
  const { packageManager } = await prompts(
    {
      type: 'select',
      name: 'packageManager',
      message: 'Package manager:',
      choices: [
        { title: 'npm', value: 'npm' },
        { title: 'pnpm', value: 'pnpm' },
        { title: 'yarn', value: 'yarn' },
      ],
      initial: 0,
    },
    {
      onCancel: () => {
        logger.error('Project creation cancelled');
        process.exit(1);
      },
    }
  );

  const features = await prompts(
    [
      {
        type: 'confirm',
        name: 'addTailwind',
        message: 'Add Tailwind CSS?',
        initial: false,
      },
      {
        type: 'confirm',
        name: 'addZustand',
        message: 'Add Zustand (state management)?',
        initial: false,
      },
      {
        type: 'confirm',
        name: 'addReactRouter',
        message: 'Add React Router?',
        initial: false,
      },
      {
        type: 'confirm',
        name: 'addEslintPrettier',
        message: 'Add ESLint & Prettier?',
        initial: false,
      },
    ],
    {
      onCancel: () => {
        logger.error('Project creation cancelled');
        process.exit(1);
      },
    }
  );

  return {
    name,
    packageManager: packageManager as PackageManager,
    template: 'react-ts',
    skipInstall: false,
    ...features,
  };
}

/**
 * Check if any feature flags were explicitly provided in process.argv.
 * Only --add-* flags trigger fully non-interactive mode, since they signal
 * the user has made deliberate choices about the project configuration.
 * Flags like -p/--package-manager and --skip-install are convenience flags
 * that should still allow feature prompts.
 */
function hasFeatureFlags(): boolean {
  return process.argv.some((arg) => arg.startsWith('--add-'));
}

/**
 * Display a crisp ASCII banner at the top of the create workflow
 */
function displayBanner(): void {
  logger.log('');
  logger.log(`  ${chalk.bold('╔══════════════════════════════════╗')}`);
  logger.log(`  ${chalk.bold('║')}          ${chalk.cyan('DEVBOILER')}           ${chalk.bold('║')}`);
  logger.log(`  ${chalk.bold('║')}  Zero-Bloat Project Scaffolding  ${chalk.bold('║')}`);
  logger.log(`  ${chalk.bold('╚══════════════════════════════════╝')}`);
  logger.log('');
}

/**
 * Create command implementation
 * Orchestrates the entire project generation workflow
 */
export function createCommand(program: Command): void {
  program
    .command('create')
    .argument('[name]', 'project name')
    .option(
      '-p, --package-manager <manager>',
      'package manager (npm, pnpm, yarn)',
      'npm'
    )
    .option('--template <template>', 'template to use', 'react-ts')
    .option('--skip-install', 'skip installing dependencies', false)
    .option('--add-tailwind', 'add Tailwind CSS', false)
    .option('--add-zustand', 'add Zustand', false)
    .option('--add-react-router', 'add React Router', false)
    .option('--add-eslint-prettier', 'add ESLint & Prettier', false)
    .description('Scaffold a React + Vite project with optional features')
    .action(async (name?: string, options?: Record<string, unknown>) => {
      try {
        displayBanner();

        let config: ProjectConfig;

        // Mode 1: No name provided — prompt for everything (name, package manager, features)
        if (!name) {
          config = await promptForConfig();

        // Mode 2: Name provided, but no explicit feature/flags — prompt for package manager and features
        } else if (!hasFeatureFlags()) {
          const validation = validateProjectName(name);
          if (!validation.valid) {
            logger.error(validation.error || 'Invalid project name');
            process.exit(1);
          }
          config = await promptForFeatures(name);

        // Mode 3: Name + explicit CLI flags — parse and use all values from command line (no prompts)
        } else {
          // Parse and validate CLI-provided options via Zod
          const parsedOptions = createOptionsSchema.parse({
            name,
            packageManager: options?.packageManager || 'npm',
            template: options?.template || 'react-ts',
            skipInstall: options?.skipInstall || false,
            addTailwind: options?.addTailwind || false,
            addZustand: options?.addZustand || false,
            addReactRouter: options?.addReactRouter || false,
            addEslintPrettier: options?.addEslintPrettier || false,
          });

          // Validate the provided name
          const validation = validateProjectName(parsedOptions.name);
          if (!validation.valid) {
            logger.error(validation.error || 'Invalid project name');
            process.exit(1);
          }
          config = {
            ...parsedOptions,
            packageManager: parsedOptions.packageManager as PackageManager,
          };
        }

        // Check if directory already exists
        const projectPath = path.resolve(config.name);
        if (await fs.pathExists(projectPath)) {
          logger.error(`Directory "${config.name}" already exists`);
          process.exit(1);
        }

        // Display configuration summary
        displaySummary(config);

        // Step 1: Scaffold the base Vite project
        logger.step(1, 4, 'Scaffolding React + Vite + TypeScript project');
        const viteService = new ViteService(config.packageManager);
        await viteService.scaffold(config.name);
        logger.success('Scaffolded');

        // Step 2: Clean up base template and configure path aliases
        logger.step(2, 4, 'Configuring project');
        const featureService = new FeatureService(projectPath, config.packageManager, config.name);
        await featureService.cleanupBaseTemplate();
        await featureService.configurePathAliases();
        logger.success('Configured');

        // Step 3: Add requested features
        logger.step(3, 4, 'Adding features');
        
        if (config.addTailwind) {
          await featureService.addTailwind();
        }

        if (config.addZustand) {
          await featureService.addZustand();
        }

        if (config.addReactRouter) {
          // If both Zustand and React Router are selected, use composable layout
          if (config.addZustand) {
            await featureService.addReactRouterWithZustand(config);
          } else {
            await featureService.addReactRouter(config);
          }
        }

        if (config.addEslintPrettier) {
          await featureService.addEslintPrettier();
        }

        // Step 4: Install dependencies (if not skipped)
        if (!config.skipInstall) {
          logger.step(4, 4, 'Installing dependencies');
          const packageManagerService = new PackageManagerService(config.packageManager);
          await packageManagerService.install(projectPath);
          logger.success('Dependencies installed');
        }

        // Display success message
        displaySuccess(config);

      } catch (error) {
        if (error instanceof Error) {
          logger.error(error.message);
        } else {
          logger.error('An unexpected error occurred');
        }
        process.exit(1);
      }
    });
}