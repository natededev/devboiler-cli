import { spawn } from 'node:child_process';
import type { PackageManager } from '../types/index.js';

/**
 * Service for scaffolding Vite projects
 * Spawns the official Vite create command with the react-ts template
 * 
 * Uses --no-interactive flag to prevent create-vite from:
 * - Prompting to install dependencies
 * - Auto-starting the dev server
 * 
 * DevBoiler handles all installation and configuration after scaffolding completes.
 */
export class ViteService {
  private readonly packageManager: PackageManager;

  constructor(packageManager: PackageManager = 'npm') {
    this.packageManager = packageManager;
  }

  /**
   * Get the create vite command for the current package manager
   * We call create-vite directly instead of going through npm create/pnpm create/yarn create
   * because the npm create wrapper has prompts that can hang the CLI.
   * 
   * The --no-interactive flag prevents create-vite from prompting to install
   * dependencies and start the dev server. DevBoiler handles all installation
   * and configuration after scaffolding completes.
   */
  private getCreateCommand(projectName: string): { cmd: string; args: string[] } {
    switch (this.packageManager) {
      case 'npm':
        return {
          cmd: 'npx',
          args: ['--yes', 'create-vite@latest', projectName, '--template', 'react-ts', '--no-interactive'],
        };
      case 'pnpm':
        return {
          cmd: 'pnpm',
          args: ['dlx', 'create-vite@latest', projectName, '--template', 'react-ts', '--no-interactive'],
        };
      case 'yarn':
        return {
          cmd: 'yarn',
          args: ['create', 'vite@latest', projectName, '--template', 'react-ts', '--no-interactive'],
        };
    }
  }

  /**
   * Scaffold a new Vite React + TypeScript project
   * Uses stdio: 'inherit' to show create-vite output directly.
   * DevBoiler handles cleanup and feature addition after scaffolding completes.
   */
  async scaffold(projectName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const { cmd, args } = this.getCreateCommand(projectName);

      const child = spawn(cmd, args, {
        stdio: 'inherit',
        shell: process.platform === 'win32',
      });

      child.on('close', (code: number) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Vite scaffolding failed with exit code ${code}`));
        }
      });

      child.on('error', (err: Error) => {
        reject(new Error(`Failed to start Vite scaffolding: ${err.message}`));
      });
    });
  }

  /**
   * Get the project directory name after scaffolding
   * Vite may create a subdirectory based on the project name
   */
  getProjectPath(projectName: string, targetDir?: string): string {
    return targetDir || projectName;
  }
}
