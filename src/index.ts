import { Command } from 'commander';
import chalk from 'chalk';

// Import commands
import { initCommand } from './commands/init';
import { devCommand } from './commands/dev';
import { validateCommand } from './commands/validate';
import { testCommand } from './commands/test';
import { buildCommand } from './commands/build';
import { publishCommand } from './commands/publish';

const program = new Command();

program
  .name('vibe')
  .description('CLI tool for creating and managing AI Marketplace offerings')
  .version('0.1.0');

// Register commands
initCommand(program);
devCommand(program);
validateCommand(program);
testCommand(program);
buildCommand(program);
publishCommand(program);

// Parse arguments
program.parse(process.argv);

// Display help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 