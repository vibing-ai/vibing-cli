import { Command } from 'commander';
import { getConfigValue } from '../../utils/config';
import { logger } from '../../utils/logger';

/**
 * Create the get command for configuration
 * Safely creates the command with proper validation
 */
export function createGetCommand(): Command {
  const getCommand = new Command('get')
    .description('Get a configuration value')
    .argument('<key>', 'Configuration key to get')
    .action(async (key) => {
      try {
        const value = await getConfigValue(key as any);
        logger.log(`${key}:`, 'info');
        console.log(typeof value === 'object' ? JSON.stringify(value, null, 2) : value);
      } catch (error) {
        logger.log((error as Error).message, 'error');
        process.exitCode = 1;
      }
    });
    
  return getCommand;
}

// Export the created command instance
export const getCommand = createGetCommand(); 