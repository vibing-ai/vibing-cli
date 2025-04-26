import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { getConfigPath, loadConfig, saveConfig } from '../../utils/config';
import { logger } from '../../utils/logger';

/**
 * Create the delete command for configuration
 * Safely creates the command with proper validation
 */
export function createDeleteCommand(): Command {
  const deleteCommand = new Command('delete')
    .description('Delete a configuration key')
    .argument('<key>', 'Configuration key to delete')
    .action(async (key) => {
      try {
        // Load the current config
        const config = await loadConfig();
        
        // Check if the key exists
        if (!(key in config)) {
          logger.log(`Configuration key "${key}" does not exist`, 'error');
          return;
        }
        
        // Delete the key
        delete (config as any)[key];
        
        // Save the updated config
        await saveConfig(config);
        
        logger.log(`Configuration key "${key}" deleted successfully`, 'success');
      } catch (error) {
        logger.log((error as Error).message, 'error');
        process.exitCode = 1;
      }
    });
    
  return deleteCommand;
}

// Export the created command instance
export const deleteCommand = createDeleteCommand(); 