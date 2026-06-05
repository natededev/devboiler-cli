import chalk from 'chalk';

/**
 * Logger utility for clean, minimal terminal output
 * Uses chalk for color but avoids emojis for a professional aesthetic
 */
export const logger = {
  success(message: string): void {
    console.log(`${chalk.green('ok')}  ${message}`);
  },

  error(message: string): void {
    console.error(`${chalk.red('ERROR')}  ${message}`);
  },

  warning(message: string): void {
    console.log(`${chalk.yellow('WARN')}  ${message}`);
  },

  info(message: string): void {
    console.log(`${chalk.blue('>')}  ${message}`);
  },

  log(message: string): void {
    console.log(message);
  },

  step(step: number, total: number, message: string): void {
    console.log(`  ${chalk.dim(`[${step}/${total}]`)} ${message}`);
  },

  header(message: string): void {
    console.log('');
    console.log(chalk.bold(message));
    console.log(chalk.dim('─'.repeat(40)));
  },

  command(command: string): void {
    console.log(`  ${chalk.whiteBright(command)}`);
  },

  link(url: string): void {
    console.log(`  ${chalk.dim(url)}`);
  },
};