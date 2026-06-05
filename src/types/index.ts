/**
 * Package manager options supported by DevBoiler
 */
export type PackageManager = 'npm' | 'pnpm' | 'yarn';

/**
 * Feature flags for progressive enhancement
 */
export interface FeatureFlags {
  addTailwind: boolean;
  addZustand: boolean;
  addReactRouter: boolean;
  addEslintPrettier: boolean;
}

/**
 * Complete project configuration options
 */
export interface CreateProjectConfig {
  name: string;
  packageManager: PackageManager;
  template: string;
  skipInstall: boolean;
}

/**
 * Combined configuration with feature flags
 */
export interface ProjectConfig extends CreateProjectConfig, FeatureFlags {}

/**
 * Result of a service operation
 */
export interface ServiceResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Feature snippet information
 */
export interface FeatureSnippet {
  name: string;
  description: string;
  packages: string[];
  devPackages: string[];
  files: Record<string, string>;
}