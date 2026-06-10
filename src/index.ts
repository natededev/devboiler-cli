#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createCommand, doctorCommand } from './commands/index.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Get package.json version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf-8')
);

/**
 * Main CLI entry point
 * Sets up Commander with all commands and global options
 */
function main(): void {
  const program = new Command();

  program
    .name('devboiler')
    .description(
      'A developer scaffolding tool for React + Vite projects with modern tooling preconfigured'
    )
    .version(packageJson.version, '-v, --version', 'output the current version')
    .addHelpText(
      'after',
      `
Example usage:
  ${chalk.cyan('devboiler create my-app')}           Create a new project with prompts
  ${chalk.cyan('devboiler create my-app -p pnpm')}   Create with pnpm package manager
  ${chalk.cyan('devboiler create my-app --add-tailwind --add-zustand')}  Create with features

For more information, visit: ${chalk.blue.underline('https://github.com/natededev/devboiler-cli')}
`
    );

  // Register commands
  createCommand(program);
  doctorCommand(program);

  // Parse arguments
  program.parse(process.argv);

  // Show help if no arguments provided
  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
}

// Run the CLI
main();