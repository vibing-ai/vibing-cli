import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig, getConfigPath } from '../../utils/config';

/**
 * Command for listing the current configuration
 */
export const listCommand = new Command('list')
  .description('List all configuration values')
  .option('--json', 'Output configuration as JSON')
  .action(async (options) => {
    try {
      const config = await loadConfig();
      const configPath = getConfigPath();
      
      // Output as JSON if requested
      if (options.json) {
        // For API Key, replace with placeholder for security
        const safeConfig = { ...config };
        if (safeConfig.apiKey) {
          safeConfig.apiKey = '********';
        }
        console.log(JSON.stringify(safeConfig, null, 2));
        return;
      }
      
      // Otherwise, display a formatted view of the configuration
      console.log(chalk.bold('\nCurrent Configuration:'));
      console.log(chalk.dim(`Configuration file: ${configPath}`));
      console.log();
      
      // API settings
      console.log(chalk.blue('API Settings'));
      console.log(`API Key: ${config.apiKey ? '********' : chalk.italic('not set')}`);
      console.log(`API URL: ${config.apiUrl}`);
      console.log(`Telemetry: ${config.telemetry ? chalk.green('enabled') : chalk.red('disabled')}`);
      console.log();
      
      // Developer info
      console.log(chalk.blue('Developer Information'));
      console.log(`Author Name: ${config.developer.defaultAuthorName || chalk.italic('not set')}`);
      console.log(`Author Email: ${config.developer.defaultAuthorEmail || chalk.italic('not set')}`);
      console.log(`GitHub Username: ${config.developer.githubUsername || chalk.italic('not set')}`);
      console.log();
      
      // Template settings
      console.log(chalk.blue('Template Settings'));
      console.log(`Default Template Type: ${config.templates.defaultType}`);
      console.log(`Custom Templates Path: ${config.templates.customTemplatesPath}`);
      console.log();
      
      // Storage settings
      console.log(chalk.blue('Storage Settings'));
      console.log(`App Data Path: ${config.storage.appDataPath}`);
      console.log(`Plugin Data Path: ${config.storage.pluginDataPath}`);
      console.log(`Agent Data Path: ${config.storage.agentDataPath}`);
      console.log();
      
      // Environment variables
      console.log(chalk.blue('Environment Variables'));
      console.log(`AI_MARKETPLACE_API_KEY: ${process.env.AI_MARKETPLACE_API_KEY ? '********' : chalk.italic('not set')}`);
      console.log(`AI_MARKETPLACE_URL: ${process.env.AI_MARKETPLACE_URL || chalk.italic('not set')}`);
      console.log();
    } catch (error) {
      console.error(chalk.red('Error listing configuration:'), error);
    }
  }); 