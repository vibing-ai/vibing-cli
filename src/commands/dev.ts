import { Command } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import { logger } from '../utils/logger';
import { Manifest } from '../types';
import { startSandbox } from '../utils/sandbox';

/**
 * Configure and register the dev command
 */
export function devCommand(program: Command): void {
  // Create command with proper input validation
  program
    .command('dev')
    .description('Start development server')
    .option('-p, --port <port>', 'Port to run the dev server on', '3000')
    .option('--no-open', 'Do not open browser automatically')
    .action(async (options) => {
      try {
        // Validate port number
        const port = parseInt(options.port, 10);
        if (isNaN(port) || port < 1 || port > 65535) {
          logger.log('Invalid port number. Must be between 1 and 65535.', 'error');
          process.exitCode = 1;
          return;
        }
        
        await startDevServer(port, !options['no-open']);
      } catch (error) {
        logger.log((error as Error).message, 'error');
        process.exitCode = 1;
      }
    });
}

/**
 * Start the development server
 */
async function startDevServer(port: number, openBrowser: boolean): Promise<void> {
  logger.log(`Starting development server on port ${port}...`, 'info');
  
  // Validate we're in a project directory
  const projectDir = process.cwd();
  const manifestPath = path.join(projectDir, 'manifest.json');
  
  if (!fs.existsSync(manifestPath)) {
    logger.log('Not a project directory. Make sure you are in a directory with a manifest.json file.', 'error');
    return;
  }
  
  try {
    // Read the manifest
    const manifest = await fs.readJson(manifestPath) as Manifest;
    
    // Start the sandbox
    const server = await startSandbox({
      projectDir,
      manifest,
      port,
      openBrowser
    });
    
    logger.log(`Development server running at http://localhost:${port}`, 'success');
    logger.log('Press Ctrl+C to stop', 'info');
    
    // Handle shutdown
    process.on('SIGINT', () => {
      logger.log('\nShutting down development server...', 'info');
      server.close(() => {
        logger.log('Development server stopped', 'success');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.log(`Failed to start development server: ${(error as Error).message}`, 'error');
  }
}
