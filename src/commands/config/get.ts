import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig, getConfigValue } from '../../utils/config';
import { get } from 'lodash';

/**
 * Command for getting specific configuration values
 */
export const getCommand = new Command('get')
  .description('Get a specific configuration value')
  .argument('<key>', 'Configuration key to retrieve (e.g., "apiUrl", "templates.defaultType")')
  .action(async (key) => {
    try {
      // Load the entire config first
      const config = await loadConfig();
      
      // Use lodash get to access nested properties
      const value = get(config, key);
      
      if (value === undefined) {
        console.log(chalk.yellow(`Configuration key "${key}" not found.`));
        console.log(chalk.dim('Run "ai-marketplace config --list" to see all available keys.'));
        return;
      }
      
      // Special handling for apiKey
      if (key === 'apiKey' && value) {
        console.log('********');
        return;
      }
      
      // Format output based on value type
      if (typeof value === 'object') {
        console.log(JSON.stringify(value, null, 2));
      } else {
        console.log(value);
      }
    } catch (error) {
      console.error(chalk.red(`Error getting configuration value for "${key}":`, error));
    }
  }); 