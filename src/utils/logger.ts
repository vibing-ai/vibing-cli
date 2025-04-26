import chalk from 'chalk';
import ora, { Ora } from 'ora';

export type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'debug';

type Primitive = string | number | boolean;
type TableRow = Record<string, Primitive>;

class Logger {
  private spinner: Ora | null = null;

  log(message: string, level: LogLevel = 'info'): void {
    if (this.spinner) {
      this.spinner.stop();
    }

    switch (level) {
      case 'info':
        console.log(chalk.blue('ℹ'), message);
        break;
      case 'success':
        console.log(chalk.green('✔'), message);
        break;
      case 'warning':
        console.log(chalk.yellow('⚠'), message);
        break;
      case 'error':
        console.log(chalk.red('✖'), message);
        break;
      case 'debug':
        if (process.env.DEBUG) {
          console.log(chalk.gray('🔍'), message);
        }
        break;
    }

    if (this.spinner) {
      this.spinner.start();
    }
  }

  startSpinner(text: string): void {
    if (this.spinner) {
      this.spinner.stop();
    }
    this.spinner = ora(text).start();
  }

  stopSpinner(success = true, text?: string): void {
    if (!this.spinner) return;

    if (success) {
      this.spinner.succeed(text);
    } else {
      this.spinner.fail(text);
    }
    this.spinner = null;
  }

  updateSpinner(text: string): void {
    if (this.spinner) {
      this.spinner.text = text;
    }
  }

  // Group related log messages
  group(title: string, fn: () => void): void {
    console.group(chalk.bold(title));
    fn();
    console.groupEnd();
  }

  // Create a table from data
  table(data: TableRow[]): void {
    if (this.spinner) {
      this.spinner.stop();
    }
    
    console.table(data);
    
    if (this.spinner) {
      this.spinner.start();
    }
  }

  // Clear the console
  clear(): void {
    console.clear();
  }
}

export const logger = new Logger(); 