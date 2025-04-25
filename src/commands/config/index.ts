import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { Config, loadConfig, saveConfig, getConfigPath } from '../../utils/config';
import { getCommand } from './get';
import { setCommand } from './set';
import { listCommand } from './list';
import { deleteCommand } from './delete';

/**
 * Config command and subcommands for managing configuration
 */
export const configCommand = new Command('config')
  .description('Manage configuration and settings')
  .addCommand(getCommand)
  .addCommand(setCommand)
  .addCommand(listCommand)
  .addCommand(deleteCommand);

/**
 * List the current configuration
 */
async function listConfig() {
  try {
    const config = await loadConfig();
    const configPath = getConfigPath();
    
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
    console.log(`AI_MARKETPLACE_URL: ${process.env.AI_MARKETPLACE_URL ?? chalk.italic('not set')}`);
    console.log();
  } catch (error) {
    console.error(chalk.red('Error listing configuration:'), error);
  }
}

/**
 * Reset configuration to defaults
 * Note: Currently unused, but kept for future use
 */
// async function resetConfig() {
//   try {
//     const { confirm } = await inquirer.prompt([
//       {
//         type: 'confirm',
//         name: 'confirm',
//         message: 'Are you sure you want to reset your configuration to defaults?',
//         default: false,
//       },
//     ]);
//     
//     if (!confirm) {
//       console.log(chalk.yellow('Reset cancelled.'));
//       return;
//     }
// 
//     const config: Config = {
//       apiKey: process.env.AI_MARKETPLACE_API_KEY ?? '',
//       apiUrl: process.env.AI_MARKETPLACE_URL ?? 'https://api.ai-marketplace.dev',
//       telemetry: true,
//       templates: {
//         defaultType: 'app',
//         customTemplatesPath: path.join(os.homedir(), '.ai-marketplace', 'templates')
//       },
//       storage: {
//         appDataPath: path.join(os.homedir(), '.ai-marketplace', 'apps'),
//         pluginDataPath: path.join(os.homedir(), '.ai-marketplace', 'plugins'),
//         agentDataPath: path.join(os.homedir(), '.ai-marketplace', 'agents')
//       },
//       developer: {
//         defaultAuthorName: '',
//         defaultAuthorEmail: '',
//         githubUsername: ''
//       }
//     };
//     
//     await saveConfig(config);
//     console.log(chalk.green('Configuration has been reset to defaults.'));
//     
//     // Display the new configuration
//     await listConfig();
//   } catch (error) {
//     console.error(chalk.red('Error resetting configuration:'), error);
//   }
// }

/**
 * Interactive configuration wizard
 */
async function configureInteractive() {
  try {
    const config = await loadConfig();
    
    console.log(chalk.bold('\nAI Marketplace CLI Configuration Wizard'));
    console.log(chalk.dim('Press Enter to keep current values.'));
    
    // Configure API settings
    const apiResponses = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: 'API Key:',
        default: config.apiKey,
        mask: '*',
      },
      {
        type: 'input',
        name: 'apiUrl',
        message: 'API URL:',
        default: config.apiUrl,
      },
      {
        type: 'confirm',
        name: 'telemetry',
        message: 'Enable telemetry to help us improve the CLI?',
        default: config.telemetry,
      },
    ]);
    
    // Configure developer information
    const developerResponses = await inquirer.prompt([
      {
        type: 'input',
        name: 'defaultAuthorName',
        message: 'Your name (for new projects):',
        default: config.developer.defaultAuthorName,
      },
      {
        type: 'input',
        name: 'defaultAuthorEmail',
        message: 'Your email (for new projects):',
        default: config.developer.defaultAuthorEmail,
      },
      {
        type: 'input',
        name: 'githubUsername',
        message: 'Your GitHub username:',
        default: config.developer.githubUsername,
      },
    ]);
    
    // Configure template settings
    const templateResponses = await inquirer.prompt([
      {
        type: 'list',
        name: 'defaultType',
        message: 'Default template type:',
        choices: ['app', 'plugin', 'agent'],
        default: config.templates.defaultType,
      },
      {
        type: 'input',
        name: 'customTemplatesPath',
        message: 'Custom templates path:',
        default: config.templates.customTemplatesPath,
      },
    ]);
    
    // Configure storage settings
    const storageResponses = await inquirer.prompt([
      {
        type: 'input',
        name: 'appDataPath',
        message: 'App data path:',
        default: config.storage.appDataPath,
      },
      {
        type: 'input',
        name: 'pluginDataPath',
        message: 'Plugin data path:',
        default: config.storage.pluginDataPath,
      },
      {
        type: 'input',
        name: 'agentDataPath',
        message: 'Agent data path:',
        default: config.storage.agentDataPath,
      },
    ]);
    
    // Update the configuration
    const updatedConfig: Config = {
      apiKey: apiResponses.apiKey,
      apiUrl: apiResponses.apiUrl,
      telemetry: apiResponses.telemetry,
      templates: {
        defaultType: templateResponses.defaultType as 'app' | 'plugin' | 'agent',
        customTemplatesPath: templateResponses.customTemplatesPath,
      },
      storage: {
        appDataPath: storageResponses.appDataPath,
        pluginDataPath: storageResponses.pluginDataPath,
        agentDataPath: storageResponses.agentDataPath,
      },
      developer: {
        defaultAuthorName: developerResponses.defaultAuthorName,
        defaultAuthorEmail: developerResponses.defaultAuthorEmail,
        githubUsername: developerResponses.githubUsername,
      },
    };
    
    // Create directories if they don't exist
    await fs.ensureDir(updatedConfig.templates.customTemplatesPath);
    await fs.ensureDir(updatedConfig.storage.appDataPath);
    await fs.ensureDir(updatedConfig.storage.pluginDataPath);
    await fs.ensureDir(updatedConfig.storage.agentDataPath);
    
    // Save the updated configuration
    await saveConfig(updatedConfig);
    
    console.log(chalk.green('\nConfiguration has been updated successfully!'));
    
    // Show the new configuration
    await listConfig();
  } catch (error) {
    console.error(chalk.red('Error during configuration:'), error);
  }
} 