import { Command } from 'commander';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs-extra';
import { logger } from '../utils/logger';
import { ProjectType, Manifest } from '../types';
import { withErrorHandling } from '../utils/errorHandling';

export interface InitOptions {
  type?: ProjectType;
  yes?: boolean;
  template?: string;
  name?: string;
  dir?: string;
  skipInstall?: boolean;
}

// Files that should never be copied to the target project
const IGNORED_FILES = [
  '.git',
  '.DS_Store',
  'node_modules',
  '.env',
  '.env.local',
  '.env.development',
  '.env.test',
  '.env.production',
  '.env.example',
  'secrets.json',
  'credentials.json'
];

/**
 * Configure and register the init command
 */
export function initCommand(program: Command): void {
  // Create command with proper input validation
  program
    .command('init')
    .description('Create a new project')
    .argument('[name]', 'Project name')
    .option('-t, --type <type>', 'Project type (app, plugin, agent)', 'app')
    .option('-d, --dir <directory>', 'Target directory')
    .option('-y, --yes', 'Skip prompts and use defaults', false)
    .option('--template <template>', 'Template to use')
    .option('--skip-install', 'Skip npm package installation', false)
    .action(withErrorHandling(async (name, options) => {
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
    }));
}

/**
 * Create a new project with the given name and options
 */
async function createProject(name: string | undefined, options: InitOptions): Promise<void> {
  logger.log('Creating new project...', 'info');
  
  // If --yes flag is provided but no name, we still need to prompt for name
  if (!name && !options.yes) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Project name:',
        default: 'my-project',
        validate: (input) => {
          if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
            return 'Project name can only contain letters, numbers, hyphens, and underscores';
          }
          return true;
        }
      }
    ]);
    name = answers.name;
  } else if (!name) {
    // If --yes is provided but no name, use default
    name = 'my-project';
    logger.log(`No project name provided. Using default: ${name}`, 'info');
  }
  
  // If --yes flag is not provided, prompt for project type
  let type = options.type ?? 'app';
  if (!options.yes && !options.type) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Project type:',
        choices: [
          { name: 'Application', value: 'app' },
          { name: 'Plugin', value: 'plugin' },
          { name: 'Agent', value: 'agent' }
        ],
        default: 'app'
      }
    ]);
    type = answers.type;
  }
  
  logger.startSpinner('Creating project files...');
  
  try {
    // Determine which template to use
    const templateName = options.template ?? type;
    
    // Get template directory
    const templateDir = path.resolve(__dirname, '../../templates', templateName);
    
    // Determine target directory
    const targetDir = options.dir 
      ? path.resolve(process.cwd(), options.dir) 
      : name ? path.resolve(process.cwd(), name) : path.resolve(process.cwd(), 'my-project');
    
    // Check if directory already exists
    if (fs.existsSync(targetDir)) {
      logger.stopSpinner(false, 'Directory already exists');
      
      // If --yes is provided, exit
      if (options.yes) {
        logger.log('Project creation cancelled. Choose a different name or directory.', 'warning');
        return;
      }
      
      // Prompt for overwrite
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: 'Directory already exists. Overwrite?',
          default: false
        }
      ]);
      
      if (!answers.overwrite) {
        logger.log('Project creation cancelled.', 'info');
        return;
      }
      
      // Remove existing directory for overwrite
      fs.removeSync(targetDir);
    }
    
    // Verify template exists
    if (!fs.existsSync(templateDir)) {
      logger.stopSpinner(false, 'Template not found');
      logger.log(`Template ${templateName} does not exist.`, 'error');
      return;
    }
    
    // Create target directory
    fs.ensureDirSync(targetDir);
    
    // Copy template to target directory securely
    await secureCopyTemplate(templateDir, targetDir);
    
    // Update package.json with project info
    const packageJsonPath = path.join(targetDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson: Record<string, string | number | object> = await fs.readJson(packageJsonPath);
      packageJson.name = name || 'my-project';
      packageJson.version = '0.1.0';
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }
    
    // Update manifest.json with project name
    const manifestPath = path.join(targetDir, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifest: Partial<Manifest> = await fs.readJson(manifestPath);
      manifest.name = name || 'my-project';
      // Create a safe ID from the name
      const projectName = name || 'my-project';
      const safeId = projectName.toLowerCase().replace(/[^a-z0-9]/g, '');
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

/**
 * Securely copy template files to target directory
 * Filters out sensitive files and respects .gitignore
 */
async function secureCopyTemplate(src: string, dest: string): Promise<void> {
  // Read all files and directories
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  // Check if entries is valid before iterating
  if (!entries || entries.length === 0) {
    logger.log(`No files found in template directory: ${src}`, 'warning');
    return;
  }
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    // Skip ignored files
    if (IGNORED_FILES.includes(entry.name)) {
      continue;
    }
    
    if (entry.isDirectory()) {
      // Recursively copy directories
      await fs.ensureDir(destPath);
      await secureCopyTemplate(srcPath, destPath);
    } else {
      // Copy files
      await fs.copyFile(srcPath, destPath);
    }
  }
}
