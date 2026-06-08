import { Command } from 'commander';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import chalk from 'chalk';
import { logger } from '../utils/index.js';
import { createSpinner } from '../utils/index.js';
import type { DoctorCheckResult } from '../types/index.js';

const execAsync = promisify(exec);

/**
 * Minimum supported Node.js major version
 */
const MIN_NODE_MAJOR = 18;

/**
 * Display the doctor ASCII banner
 */
function displayDoctorBanner(): void {
  logger.log('');
  logger.log(`  ${chalk.bold('╔══════════════════════════════════╗')}`);
  logger.log(`  ${chalk.bold('║')}        ${chalk.cyan('DEVBOILER DOCTOR')}        ${chalk.bold('║')}`);
  logger.log(`  ${chalk.bold('║')}   System Prerequisites Checker  ${chalk.bold('║')}`);
  logger.log(`  ${chalk.bold('╚══════════════════════════════════╝')}`);
  logger.log('');
}

/**
 * Render a single check result with a context-aware indicator.
 * Mandatory checks use ✓ (green) / ✗ (red).
 * Optional checks use ✓ (green) / ! (yellow) with a soft "Not installed" label.
 */
function renderCheck(
  result: DoctorCheckResult,
  mandatory: boolean
): void {
  if (result.passed) {
    console.log(
      `  ${chalk.green('✓')}  ${chalk.bold(result.name)}  ${chalk.green(result.message)}`
    );
  } else if (mandatory) {
    console.log(
      `  ${chalk.red('✗')}  ${chalk.bold(result.name)}  ${chalk.red(result.message)}`
    );
  } else {
    console.log(
      `  ${chalk.yellow('!')}  ${chalk.bold(result.name)}  ${chalk.dim('Not installed (optional)')}`
    );
  }
}

/**
 * Get the platform-appropriate command to test if a binary exists in PATH
 */
function getWhichCommand(binary: string): string {
  return process.platform === 'win32'
    ? `where ${binary}`
    : `which ${binary}`;
}

/**
 * Check Node.js version against the minimum baseline
 */
async function checkNodeVersion(): Promise<DoctorCheckResult> {
  const version = process.version;
  const major = parseInt(version.replace('v', '').split('.')[0] ?? '0', 10);

  if (major >= MIN_NODE_MAJOR) {
    return {
      name: 'Node.js',
      passed: true,
      message: `${version} (>= ${MIN_NODE_MAJOR}.0.0)`,
    };
  }

  return {
    name: 'Node.js',
    passed: false,
    message: `${version} (< ${MIN_NODE_MAJOR}.0.0) — upgrade required`,
  };
}

/**
 * Check if a package manager is available and return its version
 */
async function checkPackageManager(name: string): Promise<DoctorCheckResult> {
  try {
    // First verify the binary exists in PATH
    await execAsync(getWhichCommand(name));

    // Then get its version
    const { stdout } = await execAsync(`${name} --version`, {
      env: { ...process.env },
    });
    const version = stdout.trim().split('\n')[0] ?? '';

    return {
      name,
      passed: true,
      message: version,
    };
  } catch {
    return {
      name,
      passed: false,
      message: `not found — install at https://${name === 'pnpm' ? 'pnpm.io/installation' : `${name}js.com`}`,
    };
  }
}

/**
 * Check if git is installed
 */
async function checkGit(): Promise<DoctorCheckResult> {
  try {
    await execAsync(getWhichCommand('git'));
    const { stdout } = await execAsync('git --version');
    const version = stdout.trim() || 'unknown version';

    return {
      name: 'git',
      passed: true,
      message: version,
    };
  } catch {
    return {
      name: 'git',
      passed: false,
      message: 'not found — install at https://git-scm.com',
    };
  }
}

/**
 * Names of checks that are mandatory for scaffolding
 */
const MANDATORY_CHECKS = new Set(['Node.js', 'npm', 'git']);

/**
 * Render the final dashboard of all check results.
 * Only mandatory failures trigger the final error banner.
 */
function renderDashboard(results: DoctorCheckResult[]): void {
  logger.header('System Prerequisites');

  for (const result of results) {
    renderCheck(result, MANDATORY_CHECKS.has(result.name));
  }

  console.log('');

  // Determine verdict based solely on mandatory checks
  const mandatoryFailed = results.some(
    (r) => MANDATORY_CHECKS.has(r.name) && !r.passed
  );

  if (mandatoryFailed) {
    logger.error(
      'Some required tools are missing. Please install them and try again.'
    );
  } else {
    logger.success('Environment is fully prepped for scaffolding!');
  }

  console.log('');
}

/**
 * Doctor command implementation
 * Runs system diagnostic checks to verify the local environment
 * has the proper tooling for DevBoiler scaffolding.
 */
export function doctorCommand(program: Command): void {
  program
    .command('doctor')
    .description('Check system prerequisites for running DevBoiler')
    .action(async () => {
      const spinner = createSpinner();

      try {
        displayDoctorBanner();

        spinner.start('Checking system prerequisites...');

        // Run all diagnostic checks in parallel
        const [nodeCheck, npmCheck, pnpmCheck, yarnCheck, gitCheck] =
          await Promise.all([
            checkNodeVersion(),
            checkPackageManager('npm'),
            checkPackageManager('pnpm'),
            checkPackageManager('yarn'),
            checkGit(),
          ]);

        spinner.succeed('Prerequisites checked');

        // Render the beautiful dashboard
        renderDashboard([nodeCheck, npmCheck, pnpmCheck, yarnCheck, gitCheck]);
      } catch (error) {
        spinner.fail('Doctor check failed');

        const errorMessage =
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred';

        logger.error(`Doctor diagnostics encountered an error: ${errorMessage}`);
        process.exit(1);
      }
    });
}