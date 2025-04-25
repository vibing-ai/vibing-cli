import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig, saveConfig } from '../../utils/config';
import { set } from 'lodash';
import fs from 'fs-extra';
import path from 'path';

/**
 * Command for setting specific configuration values
 */
export const setCommand = new Command('set')
  .description('Set a specific configuration value')
  .argument('<key>', 'Configuration key to set (e.g., "apiUrl", "templates.defaultType")')
  .argument('<value>', 'Value to set for the specified key')
  .action(async (key, value) => {
    try {
      // Load the current config
      const config = await loadConfig();
      
      // Try to parse the value as JSON if it looks like an object or array
      let parsedValue = value;
      if ((value.startsWith('{') && value.endsWith('}')) || 
          (value.startsWith('[') && value.endsWith(']'))) {
        try {
          parsedValue = JSON.parse(value);
        } catch (e) {
          // If parsing fails, use the original string value
          console.log(chalk.yellow('Warning: Could not parse value as JSON. Using as string.'));
        }
      } else if (value === 'true' || value === 'false') {
        // Handle boolean values
        parsedValue = value === 'true';
      } else if (!isNaN(Number(value)) && value.trim() !== '') {
        // Handle numeric values
        parsedValue = Number(value);
      }
      
      // Set the value in the config using lodash
      set(config, key, parsedValue);
      
      // If we're updating storage paths, ensure they exist
      if (key.startsWith('storage.') && typeof parsedValue === 'string') {
        try {
          await fs.ensureDir(parsedValue);
          console.log(chalk.green(`Created directory: ${parsedValue}`));
        } catch (err) {
          console.warn(chalk.yellow(`Warning: Could not create directory: ${parsedValue}`));
        }
      }
      
      // Save the updated config
      await saveConfig(config);
      
      console.log(chalk.green(`Successfully set ${key} to:`), typeof parsedValue === 'object' ? 
        JSON.stringify(parsedValue, null, 2) : parsedValue);
    } catch (error) {
      console.error(chalk.red(`Error setting configuration value for "${key}":`, error));
    }
  }); 