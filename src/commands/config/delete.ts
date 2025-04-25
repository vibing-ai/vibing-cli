import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig, saveConfig } from '../../utils/config';
import { get, unset } from 'lodash';
import readline from 'readline';

/**
 * Command for deleting specific configuration values
 */
export const deleteCommand = new Command('delete')
  .description('Delete a specific configuration value')
  .alias('del')
  .alias('rm')
  .argument('<key>', 'Configuration key to delete (e.g., "apiUrl", "templates.defaultType")')
  .option('-f, --force', 'Skip confirmation prompt')
  .action(async (key, options) => {
    try {
      // Load the current config
      const config = await loadConfig();
      
      // Check if the key exists
      const valueToDelete = get(config, key);
      if (valueToDelete === undefined) {
        console.log(chalk.yellow(`Configuration key "${key}" does not exist.`));
        return;
      }
      
      // Show value to be deleted
      console.log(chalk.yellow('Value to be deleted:'));
      console.log(typeof valueToDelete === 'object' ? 
        JSON.stringify(valueToDelete, null, 2) : valueToDelete);
      
      // Get confirmation unless --force flag is used
      if (!options.force) {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const answer = await new Promise<string>(resolve => {
          rl.question(chalk.yellow(`Are you sure you want to delete "${key}"? (y/N) `), resolve);
        });
        
        rl.close();
        
        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
          console.log(chalk.blue('Deletion cancelled.'));
          return;
        }
      }
      
      // Delete the configuration value
      unset(config, key);
      
      // Save the updated config
      await saveConfig(config);
      
      console.log(chalk.green(`Successfully deleted configuration key "${key}"`));
    } catch (error) {
      console.error(chalk.red(`Error deleting configuration value for "${key}":`, error));
    }
  }); 