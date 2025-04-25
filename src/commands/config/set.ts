import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig, saveConfig } from '../../utils/config';
import { set } from 'lodash';
import fs from 'fs-extra';

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
      
      // Parse the value and update config
      const parsedValue = parseInputValue(value);
      set(config, key, parsedValue);
      
      // Handle storage directory creation if needed
      await handleStoragePaths(key, parsedValue);
      
      // Save the updated config
      await saveConfig(config);
      
      console.log(chalk.green(`Successfully set ${key} to:`), typeof parsedValue === 'object' ? 
        JSON.stringify(parsedValue, null, 2) : parsedValue);
    } catch (error) {
      console.error(chalk.red(`Error setting configuration value for "${key}":`, error));
    }
  });

/**
 * Parse the input value into the appropriate type
 */
function parseInputValue(value: string): any {
  // Try to parse the value as JSON if it looks like an object or array
  if ((value.startsWith('{') && value.endsWith('}')) || 
      (value.startsWith('[') && value.endsWith(']'))) {
    try {
      return JSON.parse(value);
    } catch (e) {
      // If parsing fails, use the original string value
      console.log(chalk.yellow('Warning: Could not parse value as JSON. Using as string.'));
    }
  } else if (value === 'true' || value === 'false') {
    // Handle boolean values
    return value === 'true';
  } else if (!isNaN(Number(value)) && value.trim() !== '') {
    // Handle numeric values
    return Number(value);
  }
  
  // Default case: return as string
  return value;
}

/**
 * Handle storage path creation if needed
 */
async function handleStoragePaths(key: string, value: any): Promise<void> {
  if (key.startsWith('storage.') && typeof value === 'string') {
    try {
      await fs.ensureDir(value);
      console.log(chalk.green(`Created directory: ${value}`));
    } catch (err) {
      console.warn(chalk.yellow(`Warning: Could not create directory: ${value}`));
    }
  }
} 