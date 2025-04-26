import { Command } from 'commander';
import { updateConfigValue } from '../../utils/config';
import { logger } from '../../utils/logger';

/**
 * Create the set command for configuration
 * Safely creates the command with proper validation
 */
export function createSetCommand(): Command {
  const setCommand = new Command('set')
    .description('Set a configuration value')
    .argument('<key>', 'Configuration key to set')
    .argument('<value>', 'Value to set')
    .action(async (key, value) => {
      try {
        const parsedValue = parseInputValue(value);
        await updateConfigValue(key as any, parsedValue);
        logger.log(`Configuration ${key} updated to: ${JSON.stringify(parsedValue)}`, 'success');
      } catch (error) {
        logger.log((error as Error).message, 'error');
        process.exitCode = 1;
      }
    });
    
  return setCommand;
}

// Export the created command instance
export const setCommand = createSetCommand();

/**
 * Parse input value from string to appropriate type
 */
function parseInputValue(value: string): string | number | boolean | null | undefined | object {
  // Handle special values
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (value === 'undefined') return undefined;
  
  // Handle numbers
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);
  
  // Handle JSON objects/arrays if the value starts with { or [
  if ((value.startsWith('{') && value.endsWith('}')) || 
      (value.startsWith('[') && value.endsWith(']'))) {
    try {
      return JSON.parse(value);
    } catch (e) {
      // If JSON parsing fails, treat as string
      return value;
    }
  }
  
  // Default to string
  return value;
} 