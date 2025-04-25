import { Command } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import { logger } from '../utils/logger';
import { Manifest } from '../types';
import { startSandbox } from '../utils/sandbox';

export interface DevOptions {
  port?: string;
  open?: boolean;
}

export function devCommand(program: Command): void {
  program
    .command('dev')
    .description('Start development server')
    .option('-p, --port <port>', 'Port to use', '3000')
    .option('-o, --open', 'Open in browser', false)
    .action(async (options: DevOptions) => {
      logger.log('Starting development server...', 'info');
      
      try {
        // Check if current directory is a vibe project
        const manifestPath = path.resolve(process.cwd(), 'manifest.json');
        if (!fs.existsSync(manifestPath)) {
          logger.log('Not a vibe project directory. Make sure you\'re in a project folder with a manifest.json file.', 'error');
          return;
        }
        
        // Read manifest to determine project type
        const manifest = await fs.readJson(manifestPath) as Manifest;
        
        logger.startSpinner('Initializing sandbox environment...');
        
        // Start sandbox server (implementation in sandbox.ts)
        const port = parseInt(options.port || '3000', 10);
        const server = await startSandbox({
          projectDir: process.cwd(),
          manifest,
          port,
          openBrowser: options.open || false
        });
        
        logger.stopSpinner(true, 'Sandbox environment initialized');
        
        logger.log(`Project: ${manifest.name} (${manifest.type})`, 'info');
        logger.log(`Server running at: http://localhost:${port}`, 'success');
        logger.log('Press Ctrl+C to stop', 'info');
        
        // Handle server shutdown
        const shutdown = () => {
          logger.startSpinner('Shutting down server...');
          server.close(() => {
            logger.stopSpinner(true, 'Server stopped');
            process.exit(0);
          });
        };
        
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
        
      } catch (error) {
        logger.stopSpinner(false, 'Failed to start development server');
        logger.log((error as Error).message, 'error');
      }
    });
}
