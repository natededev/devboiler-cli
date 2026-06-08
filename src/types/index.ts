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
 * Result of a single doctor diagnostic check
 */
export interface DoctorCheckResult {
  name: string;
  passed: boolean;
  message: string;
}
