import { Command } from 'commander';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs-extra';
import { logger } from '../utils/logger';
import { ProjectType } from '../types';

export interface InitOptions {
  type?: ProjectType;
  yes?: boolean;
  template?: string;
}

export function initCommand(program: Command): void {
  program
    .command('init [name]')
    .description('Create a new project')
    .option('-t, --type <type>', 'Project type (app, plugin, agent)', 'app')
    .option('-y, --yes', 'Skip prompts and use defaults')
    .option('--template <template>', 'Use a specific template')
    .action(async (name: string | undefined, options?: InitOptions) => {
      logger.log('Creating new project...', 'info');
      
      // If name not provided, prompt for it
      if (!name) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Project name:',
            validate: (input) => input.length > 0 || 'Name is required'
          }
        ]);
        name = answers.name;
      }
      
      // Ensure name is defined at this point
      if (!name) {
        logger.log('Project name is required', 'error');
        return;
      }
      
      // If not using --yes flag, prompt for project type
      let type = options?.type || 'app';
      if (!options?.yes) {
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'type',
            message: 'Select project type:',
            choices: [
              { name: 'App (Full application)', value: 'app' },
              { name: 'Plugin (Platform extension)', value: 'plugin' },
              { name: 'Agent (Specialized AI entity)', value: 'agent' }
            ],
            default: type
          }
        ]);
        type = answers.type as ProjectType;
      }
      
      // Create project
      logger.startSpinner('Creating project files...');
      
      try {
        // Determine which template to use
        const templateName = options?.template ?? type;
        
        // Get template directory (in production this would be relative to __dirname)
        // For development, we'll use a path relative to the project root
        const templateDir = path.resolve(__dirname, '../../templates', templateName);
        const targetDir = path.resolve(process.cwd(), name);
        
        // Check if directory already exists
        if (fs.existsSync(targetDir)) {
          logger.stopSpinner(false, 'Directory already exists');
          
          const { overwrite } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'overwrite',
              message: `Directory ${name} already exists. Overwrite?`,
              default: false
            }
          ]);
          
          if (!overwrite) {
            logger.log('Project creation cancelled', 'warning');
            return;
          }
          
          // Remove existing directory
          fs.removeSync(targetDir);
        }
        
        // Copy template to target directory
        await fs.copy(templateDir, targetDir);
        
        // Update package.json with project info
        const packageJsonPath = path.join(targetDir, 'package.json');
        let packageJson = {};
        if (fs.existsSync(packageJsonPath)) {
          packageJson = await fs.readJson(packageJsonPath);
          packageJson.name = name;
          packageJson.version = '0.1.0';
          await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
        }
        
        // Update manifest.json with project name
        const manifestPath = path.join(targetDir, 'manifest.json');
        let manifest = {};
        if (fs.existsSync(manifestPath)) {
          manifest = await fs.readJson(manifestPath);
          manifest.name = name;
          manifest.id = `com.example.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
          manifest.description = manifest.description ?? 'A Vibe Marketplace project';
          await fs.writeJson(manifestPath, manifest, { spaces: 2 });
          
          // Update package.json description with manifest description
          if (fs.existsSync(packageJsonPath)) {
            packageJson.description = manifest.description;
            await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
          }
        }
        
        // Use manifest or package.json for the project name
        const projectName = options.name ?? manifest.name ?? packageJson.name;
        
        logger.stopSpinner(true, `Project created at ${targetDir}`);
        
        logger.log('\nNext steps:', 'info');
        logger.log(`  cd ${name}`, 'info');
        logger.log('  npm install', 'info');
        logger.log('  vibe dev', 'info');
      } catch (error) {
        logger.stopSpinner(false, 'Failed to create project');
        logger.log((error as Error).message, 'error');
      }
    });
}
