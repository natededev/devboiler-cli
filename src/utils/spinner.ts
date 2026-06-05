import ora, { Ora } from 'ora';

/**
 * Spinner utility for displaying loading states
 * Wraps ora with a consistent interface
 */
export class Spinner {
  private spinner: Ora | null = null;

  /**
   * Start a spinner with a message
   */
  start(message: string): void {
    this.spinner = ora({
      text: message,
      color: 'cyan',
      spinner: 'dots',
    }).start();
  }

  /**
   * Update the spinner message
   */
  update(message: string): void {
    if (this.spinner) {
      this.spinner.text = message;
    }
  }

  /**
   * Succeed the spinner with a message
   */
  succeed(message?: string): void {
    if (this.spinner) {
      this.spinner.succeed(message);
      this.spinner = null;
    }
  }

  /**
   * Fail the spinner with a message
   */
  fail(message?: string): void {
    if (this.spinner) {
      this.spinner.fail(message);
      this.spinner = null;
    }
  }

  /**
   * Stop the spinner without any indicator
   */
  stop(): void {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
  }

  /**
   * Check if spinner is currently active
   */
  isActive(): boolean {
    return this.spinner !== null;
  }
}

/**
 * Create a new spinner instance
 */
export function createSpinner(): Spinner {
  return new Spinner();
}