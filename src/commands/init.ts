import { Command } from 'commander';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs-extra';
import { logger } from '../utils/logger';
import { ProjectType, Manifest } from '../types';

export interface InitOptions {
  type?: ProjectType;
  yes?: boolean;
  template?: string;
  name?: string;
}

/**
 * Configure and register the init command
 */
export function initCommand(program: Command): void {
  // Create command with proper input validation
  program
    .command('init')
    .description('Initialize a new project')
    .argument('[name]', 'Project name')
    .option('-t, --type <type>', 'Project type (app, plugin, agent)', 'app')
    .option('-d, --dir <directory>', 'Target directory')
    .option('--template <template>', 'Template to use')
    .option('--skip-install', 'Skip npm package installation', false)
    .action(async (name, options) => {
      try {
        // Validate project name
        if (name && !/^[a-zA-Z0-9-_]+$/.test(name)) {
          logger.log('Project name can only contain letters, numbers, hyphens, and underscores', 'error');
          process.exitCode = 1;
          return;
        }
        
        // Validate project type
        const validTypes = ['app', 'plugin', 'agent'];
        if (options.type && !validTypes.includes(options.type)) {
          logger.log(`Invalid project type. Must be one of: ${validTypes.join(', ')}`, 'error');
          process.exitCode = 1;
          return;
        }
        
        await createProject(name, options);
      } catch (error) {
        logger.log((error as Error).message, 'error');
        process.exitCode = 1;
      }
    });
}

/**
 * Create a new project with the given name and options
 */
async function createProject(name: string | undefined, options: any): Promise<void> {
  logger.log('Creating new project...', 'info');
  
  // If name not provided, use a default
  if (!name) {
    name = 'my-project';
    logger.log(`No project name provided. Using default: ${name}`, 'info');
  }
  
  // Determine project type
  const type = options.type ?? 'app';
  
  logger.startSpinner('Creating project files...');
  
  try {
    // Determine which template to use
    const templateName = options.template ?? type;
    
    // Get template directory
    const templateDir = path.resolve(__dirname, '../../templates', templateName);
    
    // Determine target directory
    const targetDir = options.dir 
      ? path.resolve(process.cwd(), options.dir) 
      : path.resolve(process.cwd(), name);
    
    // Check if directory already exists
    if (fs.existsSync(targetDir)) {
      logger.stopSpinner(false, 'Directory already exists');
      logger.log('Project creation cancelled. Choose a different name or directory.', 'warning');
      return;
    }
    
    // Verify template exists
    if (!fs.existsSync(templateDir)) {
      logger.stopSpinner(false, 'Template not found');
      logger.log(`Template ${templateName} does not exist.`, 'error');
      return;
    }
    
    // Copy template to target directory
    await fs.copy(templateDir, targetDir);
    
    // Update package.json with project info
    const packageJsonPath = path.join(targetDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson: Record<string, string | number | object> = await fs.readJson(packageJsonPath);
      packageJson.name = name;
      packageJson.version = '0.1.0';
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }
    
    // Update manifest.json with project name
    const manifestPath = path.join(targetDir, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifest: Partial<Manifest> = await fs.readJson(manifestPath);
      manifest.name = name;
      // Create a safe ID from the name
      const safeId = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      manifest.id = `com.example.${safeId}`;
      manifest.description = manifest.description ?? 'A new project';
      await fs.writeJson(manifestPath, manifest, { spaces: 2 });
    }
    
    logger.stopSpinner(true, `Project created at ${targetDir}`);
    
    // Install dependencies unless skipped
    if (!options.skipInstall) {
      logger.startSpinner('Installing dependencies...');
      try {
        // Use a child process to run npm install
        const { execSync } = require('child_process');
        execSync('npm install', { cwd: targetDir, stdio: 'ignore' });
        logger.stopSpinner(true, 'Dependencies installed');
      } catch (error) {
        logger.stopSpinner(false, 'Failed to install dependencies');
        logger.log('You can install dependencies manually by running "npm install"', 'warning');
      }
    }
    
    logger.log('\nNext steps:', 'info');
    logger.log(`  cd ${options.dir || name}`, 'info');
    if (options.skipInstall) {
      logger.log('  npm install', 'info');
    }
    logger.log('  npm start', 'info');
  } catch (error) {
    logger.stopSpinner(false, 'Failed to create project');
    throw error;
  }
}
