import { execSync, spawn } from 'node:child_process';
import { logger } from '../utils/index.js';
import type { PackageManager } from '../types/index.js';

/**
 * Service for managing package manager operations
 * Handles dependency installation across npm, pnpm, and yarn
 */
export class PackageManagerService {
  private readonly packageManager: PackageManager;

  constructor(packageManager: PackageManager = 'npm') {
    this.packageManager = packageManager;
  }

  /**
   * Get the install command for the current package manager
   */
  getInstallCommand(): string {
    switch (this.packageManager) {
      case 'npm':
        return 'npm install';
      case 'pnpm':
        return 'pnpm install';
      case 'yarn':
        return 'yarn';
    }
  }

  /**
   * Get the add packages command for the current package manager
   */
  getAddCommand(dev: boolean = false): string {
    switch (this.packageManager) {
      case 'npm':
        return dev ? 'npm install --save-dev' : 'npm install';
      case 'pnpm':
        return dev ? 'pnpm add -D' : 'pnpm add';
      case 'yarn':
        return dev ? 'yarn add -D' : 'yarn add';
    }
  }

  /**
   * Check if the package manager is available on the system
   */
  isAvailable(): boolean {
    try {
      execSync(`${this.packageManager} --version`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Detect available package managers on the system
   */
  static detectAvailable(): PackageManager[] {
    const managers: PackageManager[] = ['npm', 'pnpm', 'yarn'];
    return managers.filter((pm) => {
      try {
        execSync(`${pm} --version`, { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    });
  }

  /**
   * Install dependencies in the specified directory
   */
  async install(cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
      logger.info(`Installing dependencies with ${this.packageManager}...`);

      const args =
        this.packageManager === 'yarn' ? ['install'] : ['install'];

      const child = spawn(this.packageManager, args, {
        cwd,
        stdio: 'inherit',
        shell: process.platform === 'win32',
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`${this.packageManager} install failed with code ${code}`));
        }
      });

      child.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Add packages to the project
   */
  async addPackages(
    packages: string[],
    cwd: string,
    dev: boolean = false
  ): Promise<void> {
    if (packages.length === 0) return;

    return new Promise((resolve, reject) => {
      const baseArgs =
        this.packageManager === 'npm'
          ? dev
            ? ['install', '--save-dev']
            : ['install']
          : this.packageManager === 'pnpm'
            ? dev
              ? ['add', '-D']
              : ['add']
            : dev
              ? ['add', '-D']
              : ['add'];

      const args = [...baseArgs, ...packages];

      logger.info(
        `Adding ${dev ? 'dev ' : ''}packages: ${packages.join(', ')}`
      );

      const child = spawn(this.packageManager, args, {
        cwd,
        stdio: 'inherit',
        shell: process.platform === 'win32',
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(
            new Error(
              `${this.packageManager} add failed with code ${code}`
            )
          );
        }
      });

      child.on('error', (err) => {
        reject(err);
      });
    });
  }
}