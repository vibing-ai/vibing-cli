import fs from 'fs-extra';
import path from 'path';
import os from 'os';

/**
 * Configuration structure for the AI Marketplace CLI
 */
export interface Config {
  apiKey: string;
  apiUrl: string;
  telemetry: boolean;
  templates: {
    defaultType: 'app' | 'plugin' | 'agent';
    customTemplatesPath: string;
  };
  storage: {
    appDataPath: string;
    pluginDataPath: string;
    agentDataPath: string;
  };
  developer: {
    defaultAuthorName: string;
    defaultAuthorEmail: string;
    githubUsername: string;
  };
}

const CONFIG_FOLDER = path.join(os.homedir(), '.ai-marketplace');
const CONFIG_FILE = 'config.json';

/**
 * Get the path to the configuration file
 */
export function getConfigPath(): string {
  return path.join(CONFIG_FOLDER, CONFIG_FILE);
}

/**
 * Load configuration from disk
 * If no configuration exists, creates a default one
 */
export async function loadConfig(): Promise<Config> {
  try {
    await fs.ensureDir(CONFIG_FOLDER);
    
    const configPath = getConfigPath();
    let config: Config;
    
    if (await fs.pathExists(configPath)) {
      const configData = await fs.readFile(configPath, 'utf8');
      config = JSON.parse(configData);
    } else {
      // Create default config
      config = {
        apiKey: process.env.AI_MARKETPLACE_API_KEY ?? '',
        apiUrl: process.env.AI_MARKETPLACE_URL ?? 'https://api.ai-marketplace.dev',
        telemetry: true,
        templates: {
          defaultType: 'app',
          customTemplatesPath: path.join(CONFIG_FOLDER, 'templates')
        },
        storage: {
          appDataPath: path.join(CONFIG_FOLDER, 'apps'),
          pluginDataPath: path.join(CONFIG_FOLDER, 'plugins'),
          agentDataPath: path.join(CONFIG_FOLDER, 'agents')
        },
        developer: {
          defaultAuthorName: '',
          defaultAuthorEmail: '',
          githubUsername: ''
        }
      };
      
      // Save the default config
      await saveConfig(config);
    }
    
    return config;
  } catch (error) {
    console.error('Error loading configuration:', error);
    throw error;
  }
}

/**
 * Save configuration to disk
 */
export async function saveConfig(config: Config): Promise<void> {
  try {
    await fs.ensureDir(CONFIG_FOLDER);
    const configPath = getConfigPath();
    
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving configuration:', error);
    throw error;
  }
}

/**
 * Get a specific configuration value
 */
export async function getConfigValue<K extends keyof Config>(key: K): Promise<Config[K]> {
  const config = await loadConfig();
  if (key in config) {
    return config[key];
  }
  throw new Error(`Invalid configuration key: ${key}`);
}

/**
 * Update a specific configuration value
 */
export async function updateConfigValue<K extends keyof Config>(key: K, value: Config[K]): Promise<void> {
  const config = await loadConfig();
  if (key in config) {
    config[key] = value;
    await saveConfig(config);
  } else {
    throw new Error(`Invalid configuration key: ${key}`);
  }
}

/**
 * Get effective API key (from config or environment variable)
 */
export async function getEffectiveApiKey(): Promise<string> {
  const config = await loadConfig();
  return process.env.AI_MARKETPLACE_API_KEY ?? config.apiKey;
}

/**
 * Get effective API URL (from config or environment variable)
 */
export async function getEffectiveApiUrl(): Promise<string> {
  const config = await loadConfig();
  return process.env.AI_MARKETPLACE_URL ?? config.apiUrl;
} 