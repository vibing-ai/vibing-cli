# Vibing-CLI Implementation Plan

This document outlines the implementation plan for `vibing-cli`, a comprehensive CLI tool for developing applications for the AI Marketplace. Each section includes Cursor Agent prompts for easy implementation.

## Project Structure

```
vibing-cli/
├── bin/
│   └── vibe.js               # CLI entry point
├── src/
│   ├── commands/             # Command implementations
│   │   ├── init.ts
│   │   ├── dev.ts
│   │   ├── validate.ts
│   │   ├── test.ts
│   │   ├── build.ts
│   │   └── publish.ts
│   ├── templates/            # Project templates
│   │   ├── app/
│   │   ├── plugin/
│   │   └── agent/
│   ├── utils/                # Utility functions
│   │   ├── validation.ts
│   │   ├── sandbox.ts
│   │   ├── testing.ts
│   │   └── logger.ts
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts
│   └── index.ts              # Main entry point
├── package.json
└── tsconfig.json
```

## Implementation Steps

### Step 1: Project Setup

**Cursor Agent Prompt:**
```
Create a new TypeScript project for a CLI tool called vibing-cli with the following structure:

1. Initialize package.json with these dependencies:
   - commander (for CLI commands)
   - chalk (for colored output)
   - inquirer (for interactive prompts)
   - ora (for spinners)
   - fs-extra (for file operations)
   - typescript, ts-node, @types/node (for TypeScript)

2. Set up the basic directory structure:
   - bin/ directory with vibe.js entry point
   - src/ directory with index.ts entry point
   - src/commands/ directory for command implementations

3. Configure tsconfig.json for a Node.js CLI application
4. Set up the bin entry in package.json
```

### Step 2: CLI Entry Point

**Cursor Agent Prompt:**
```
Create the CLI entry point files:

1. Create bin/vibe.js with:
```javascript
#!/usr/bin/env node

require('../dist/index.js');
```

2. Create src/index.ts to set up the command structure using Commander:
```typescript
import { Command } from 'commander';
import chalk from 'chalk';

// Import commands
import { initCommand } from './commands/init';
import { devCommand } from './commands/dev';
import { validateCommand } from './commands/validate';
import { testCommand } from './commands/test';
import { buildCommand } from './commands/build';
import { publishCommand } from './commands/publish';

const program = new Command();

program
  .name('vibe')
  .description('CLI tool for creating and managing AI Marketplace offerings')
  .version('0.1.0');

// Register commands
initCommand(program);
devCommand(program);
validateCommand(program);
testCommand(program);
buildCommand(program);
publishCommand(program);

// Parse arguments
program.parse(process.argv);

// Display help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
```
```

### Step 3: Logger Utility

**Cursor Agent Prompt:**
```
Create a logger utility in src/utils/logger.ts with the following features:

1. Different log levels (info, success, warning, error)
2. Support for spinners using ora
3. Colorful output using chalk
4. Utility functions for common logging patterns

Example:
```typescript
import chalk from 'chalk';
import ora, { Ora } from 'ora';

export type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'debug';

class Logger {
  private spinner: Ora | null = null;

  log(message: string, level: LogLevel = 'info'): void {
    if (this.spinner) {
      this.spinner.stop();
    }

    switch (level) {
      case 'info':
        console.log(chalk.blue('ℹ'), message);
        break;
      case 'success':
        console.log(chalk.green('✔'), message);
        break;
      case 'warning':
        console.log(chalk.yellow('⚠'), message);
        break;
      case 'error':
        console.log(chalk.red('✖'), message);
        break;
      case 'debug':
        if (process.env.DEBUG) {
          console.log(chalk.gray('🔍'), message);
        }
        break;
    }

    if (this.spinner) {
      this.spinner.start();
    }
  }

  startSpinner(text: string): void {
    if (this.spinner) {
      this.spinner.stop();
    }
    this.spinner = ora(text).start();
  }

  stopSpinner(success = true, text?: string): void {
    if (!this.spinner) return;

    if (success) {
      this.spinner.succeed(text);
    } else {
      this.spinner.fail(text);
    }
    this.spinner = null;
  }

  updateSpinner(text: string): void {
    if (this.spinner) {
      this.spinner.text = text;
    }
  }
}

export const logger = new Logger();
```
```

### Step 4: Types Definition

**Cursor Agent Prompt:**
```
Create type definitions in src/types/index.ts for the project:

```typescript
// Project types
export type ProjectType = 'app' | 'plugin' | 'agent';

// Manifest file interface
export interface Manifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: {
    name: string;
    email?: string;
    url?: string;
  };
  type: ProjectType;
  permissions?: Permission[];
  surfaces?: Record<string, Surface>;
  ai?: {
    hasOwnAgent?: boolean;
    useSuperAgent?: boolean;
    capabilities?: string[];
  };
  pricing?: {
    model: 'free' | 'one-time' | 'subscription' | 'credit-based' | 'freemium';
    plans?: PricingPlan[];
  };
}

// Permission type
export interface Permission {
  type: string;
  access?: string[];
  scope?: string;
  purpose?: string;
}

// Interface surfaces
export interface Surface {
  entryPoint: string;
  title?: string;
  icon?: string;
  defaultRoute?: string;
}

// Pricing plan
export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval?: 'month' | 'year';
  features?: string[];
}

// Validation result type
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code: string;
  message: string;
  path?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  path?: string;
}

// Test result type
export interface TestResult {
  success: boolean;
  stats: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  testFiles: TestFile[];
}

export interface TestFile {
  name: string;
  success: boolean;
  tests: {
    name: string;
    status: 'passed' | 'failed' | 'skipped';
    error?: string;
  }[];
}
```
```

### Step 5: Init Command Implementation

**Cursor Agent Prompt:**
```
Implement the init command in src/commands/init.ts:

```typescript
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
    .action(async (name?: string, options?: InitOptions) => {
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
        const templateName = options?.template || type;
        
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
        
        // Update package.json with project name
        const packageJsonPath = path.join(targetDir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          const packageJson = await fs.readJson(packageJsonPath);
          packageJson.name = name;
          await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
        }
        
        // Update manifest.json with project name
        const manifestPath = path.join(targetDir, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
          const manifest = await fs.readJson(manifestPath);
          manifest.name = name;
          manifest.id = `com.example.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
          await fs.writeJson(manifestPath, manifest, { spaces: 2 });
        }
        
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
```
```

### Step 6: Dev Command Implementation

**Cursor Agent Prompt:**
```
Implement the development server command in src/commands/dev.ts:

```typescript
import { Command } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import { logger } from '../utils/logger';
import { Manifest } from '../types';
import { startSandbox } from '../utils/sandbox';

export interface DevOptions {
  port?: string;
  open?: boolean;
}

export function devCommand(program: Command): void {
  program
    .command('dev')
    .description('Start development server')
    .option('-p, --port <port>', 'Port to use', '3000')
    .option('-o, --open', 'Open in browser', false)
    .action(async (options: DevOptions) => {
      logger.log('Starting development server...', 'info');
      
      try {
        // Check if current directory is a vibe project
        const manifestPath = path.resolve(process.cwd(), 'manifest.json');
        if (!fs.existsSync(manifestPath)) {
          logger.log('Not a vibe project directory. Make sure you\'re in a project folder with a manifest.json file.', 'error');
          return;
        }
        
        // Read manifest to determine project type
        const manifest = await fs.readJson(manifestPath) as Manifest;
        
        logger.startSpinner('Initializing sandbox environment...');
        
        // Start sandbox server (implementation in sandbox.ts)
        const port = parseInt(options.port || '3000', 10);
        const server = await startSandbox({
          projectDir: process.cwd(),
          manifest,
          port,
          openBrowser: options.open || false
        });
        
        logger.stopSpinner(true, 'Sandbox environment initialized');
        
        logger.log(`Project: ${manifest.name} (${manifest.type})`, 'info');
        logger.log(`Server running at: http://localhost:${port}`, 'success');
        logger.log('Press Ctrl+C to stop', 'info');
        
        // Handle server shutdown
        const shutdown = () => {
          logger.startSpinner('Shutting down server...');
          server.close(() => {
            logger.stopSpinner(true, 'Server stopped');
            process.exit(0);
          });
        };
        
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
        
      } catch (error) {
        logger.stopSpinner(false, 'Failed to start development server');
        logger.log((error as Error).message, 'error');
      }
    });
}
```
```

### Step 7: Validate Command Implementation

**Cursor Agent Prompt:**
```
Implement the validation command in src/commands/validate.ts:

```typescript
import { Command } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import { logger } from '../utils/logger';
import { Manifest, ValidationResult } from '../types';
import { validateManifest, validatePermissions, validateSecurity, validateAccessibility } from '../utils/validation';

export interface ValidateOptions {
  fix?: boolean;
  json?: boolean;
}

export function validateCommand(program: Command): void {
  program
    .command('validate')
    .description('Validate project for marketplace submission')
    .option('--fix', 'Automatically fix issues when possible', false)
    .option('--json', 'Output results as JSON', false)
    .action(async (options: ValidateOptions) => {
      logger.log('Validating project...', 'info');
      
      try {
        // Check if current directory is a vibe project
        const manifestPath = path.resolve(process.cwd(), 'manifest.json');
        if (!fs.existsSync(manifestPath)) {
          logger.log('Not a vibe project directory. Make sure you\'re in a project folder with a manifest.json file.', 'error');
          return;
        }
        
        // Read manifest
        const manifest = await fs.readJson(manifestPath) as Manifest;
        
        logger.startSpinner('Running validation checks...');
        
        // Run validation checks
        const manifestResult = await validateManifest(manifest, options.fix);
        const permissionsResult = await validatePermissions(manifest, options.fix);
        const securityResult = await validateSecurity(process.cwd(), options.fix);
        const accessibilityResult = await validateAccessibility(process.cwd(), options.fix);
        
        // Combine results
        const result: ValidationResult = {
          valid: 
            manifestResult.valid && 
            permissionsResult.valid && 
            securityResult.valid && 
            accessibilityResult.valid,
          errors: [
            ...manifestResult.errors,
            ...permissionsResult.errors,
            ...securityResult.errors,
            ...accessibilityResult.errors
          ],
          warnings: [
            ...manifestResult.warnings,
            ...permissionsResult.warnings,
            ...securityResult.warnings,
            ...accessibilityResult.warnings
          ]
        };
        
        logger.stopSpinner(result.valid, result.valid ? 'Validation passed' : 'Validation failed');
        
        // Output results
        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          if (result.errors.length > 0) {
            logger.log(`Found ${result.errors.length} error(s):`, 'error');
            result.errors.forEach((error, index) => {
              logger.log(`  ${index + 1}. ${error.message}${error.path ? ` (${error.path})` : ''}`, 'error');
            });
          }
          
          if (result.warnings.length > 0) {
            logger.log(`Found ${result.warnings.length} warning(s):`, 'warning');
            result.warnings.forEach((warning, index) => {
              logger.log(`  ${index + 1}. ${warning.message}${warning.path ? ` (${warning.path})` : ''}`, 'warning');
            });
          }
          
          if (result.valid) {
            logger.log('All validation checks passed', 'success');
          } else {
            logger.log('Please fix the errors before publishing', 'info');
          }
        }
        
        // Return exit code based on validation result
        if (!result.valid) {
          process.exitCode = 1;
        }
      } catch (error) {
        logger.stopSpinner(false, 'Validation process failed');
        logger.log((error as Error).message, 'error');
        process.exitCode = 1;
      }
    });
}
```
```

### Step 8: Test Command Implementation

**Cursor Agent Prompt:**
```
Implement the test command in src/commands/test.ts:

```typescript
import { Command } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import { logger } from '../utils/logger';
import { Manifest, TestResult } from '../types';
import { runUnitTests, runIntegrationTests, runE2ETests, runA11yTests } from '../utils/testing';

export interface TestOptions {
  unit?: boolean;
  integration?: boolean;
  e2e?: boolean;
  a11y?: boolean;
  all?: boolean;
  coverage?: boolean;
  watch?: boolean;
  json?: boolean;
}

export function testCommand(program: Command): void {
  program
    .command('test')
    .description('Run tests')
    .option('--unit', 'Run unit tests')
    .option('--integration', 'Run integration tests')
    .option('--e2e', 'Run end-to-end tests')
    .option('--a11y', 'Run accessibility tests')
    .option('--all', 'Run all tests')
    .option('--coverage', 'Generate coverage report')
    .option('--watch', 'Watch for changes')
    .option('--json', 'Output results as JSON')
    .action(async (options: TestOptions) => {
      logger.log('Running tests...', 'info');
      
      try {
        // Check if current directory is a vibe project
        const manifestPath = path.resolve(process.cwd(), 'manifest.json');
        if (!fs.existsSync(manifestPath)) {
          logger.log('Not a vibe project directory. Make sure you\'re in a project folder with a manifest.json file.', 'error');
          return;
        }
        
        // Read manifest
        const manifest = await fs.readJson(manifestPath) as Manifest;
        
        // Determine which tests to run
        const runAll = options.all || 
          (!options.unit && !options.integration && !options.e2e && !options.a11y);
        
        const results: Record<string, TestResult> = {};
        
        // Run unit tests
        if (runAll || options.unit) {
          logger.startSpinner('Running unit tests...');
          results.unit = await runUnitTests({
            projectDir: process.cwd(),
            coverage: options.coverage || false,
            watch: options.watch || false
          });
          logger.stopSpinner(
            results.unit.success, 
            `Unit tests: ${results.unit.stats.passed}/${results.unit.stats.total} passed`
          );
        }
        
        // Run integration tests
        if (runAll || options.integration) {
          logger.startSpinner('Running integration tests...');
          results.integration = await runIntegrationTests({
            projectDir: process.cwd(),
            coverage: options.coverage || false,
            watch: options.watch || false
          });
          logger.stopSpinner(
            results.integration.success, 
            `Integration tests: ${results.integration.stats.passed}/${results.integration.stats.total} passed`
          );
        }
        
        // Run end-to-end tests
        if (runAll || options.e2e) {
          logger.startSpinner('Running end-to-end tests...');
          results.e2e = await runE2ETests({
            projectDir: process.cwd(),
            watch: options.watch || false
          });
          logger.stopSpinner(
            results.e2e.success, 
            `E2E tests: ${results.e2e.stats.passed}/${results.e2e.stats.total} passed`
          );
        }
        
        // Run accessibility tests
        if (runAll || options.a11y) {
          logger.startSpinner('Running accessibility tests...');
          results.a11y = await runA11yTests({
            projectDir: process.cwd()
          });
          logger.stopSpinner(
            results.a11y.success, 
            `Accessibility tests: ${results.a11y.stats.passed}/${results.a11y.stats.total} passed`
          );
        }
        
        // Output results
        if (options.json) {
          console.log(JSON.stringify(results, null, 2));
        } else {
          const allTestsSucceeded = Object.values(results).every(result => result.success);
          
          if (allTestsSucceeded) {
            logger.log('All tests passed', 'success');
          } else {
            logger.log('Some tests failed', 'error');
            
            // Output failed tests
            Object.entries(results).forEach(([type, result]) => {
              if (!result.success) {
                logger.log(`\nFailed ${type} tests:`, 'error');
                
                result.testFiles.forEach(file => {
                  if (!file.success) {
                    logger.log(`  ${file.name}:`, 'error');
                    
                    file.tests.forEach(test => {
                      if (test.status === 'failed') {
                        logger.log(`    ✖ ${test.name}${test.error ? `: ${test.error}` : ''}`, 'error');
                      }
                    });
                  }
                });
              }
            });
          }
          
          // Show coverage info if generated
          if (options.coverage) {
            logger.log('\nCoverage summary:', 'info');
            // In a real implementation, this would show actual coverage data
            logger.log('  Coverage report generated at ./coverage/index.html', 'info');
          }
        }
        
        // Return exit code based on test results
        const allTestsSucceeded = Object.values(results).every(result => result.success);
        if (!allTestsSucceeded) {
          process.exitCode = 1;
        }
      } catch (error) {
        logger.stopSpinner(false, 'Test process failed');
        logger.log((error as Error).message, 'error');
        process.exitCode = 1;
      }
    });
}
```
```

### Step 9: Build Command Implementation

**Cursor Agent Prompt:**
```
Implement the build command in src/commands/build.ts:

```typescript
import { Command } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import { logger } from '../utils/logger';
import { Manifest } from '../types';
import { execSync } from 'child_process';

export interface BuildOptions {
  clean?: boolean;
  production?: boolean;
}

export function buildCommand(program: Command): void {
  program
    .command('build')
    .description('Build for production')
    .option('--clean', 'Clean before building', false)
    .option('--production', 'Build for production', true)
    .action(async (options: BuildOptions) => {
      logger.log('Building project...', 'info');
      
      try {
        // Check if current directory is a vibe project
        const manifestPath = path.resolve(process.cwd(), 'manifest.json');
        if (!fs.existsSync(manifestPath)) {
          logger.log('Not a vibe project directory. Make sure you\'re in a project folder with a manifest.json file.', 'error');
          return;
        }
        
        // Read manifest
        const manifest = await fs.readJson(manifestPath) as Manifest;
        
        // Clean if requested
        if (options.clean) {
          logger.startSpinner('Cleaning build directory...');
          const distDir = path.resolve(process.cwd(), 'dist');
          if (fs.existsSync(distDir)) {
            await fs.remove(distDir);
          }
          logger.stopSpinner(true, 'Build directory cleaned');
        }
        
        // Run build
        logger.startSpinner('Building project...');
        
        // Check if the project has a build script in package.json
        const packageJsonPath = path.resolve(process.cwd(), 'package.json');
        const packageJson = await fs.readJson(packageJsonPath);
        
        if (packageJson.scripts && packageJson.scripts.build) {
          // Run the project's build script
          try {
            execSync('npm run build', { 
              stdio: 'inherit',
              env: {
                ...process.env,
                NODE_ENV: options.production ? 'production' : 'development'
              }
            });
            logger.stopSpinner(true, 'Build completed successfully');
          } catch (err) {
            logger.stopSpinner(false, 'Build failed');
            return;
          }
        } else {
          // No build script found, create a default build
          logger.log('No build script found in package.json. Using default build process.', 'warning');
          
          // Create dist directory
          const distDir = path.resolve(process.cwd(), 'dist');
          await fs.ensureDir(distDir);
          
          // Copy manifest.json to dist
          await fs.copy(manifestPath, path.join(distDir, 'manifest.json'));
          
          // Copy package.json to dist
          await fs.copy(packageJsonPath, path.join(distDir, 'package.json'));
          
          // Copy src directory to dist
          const srcDir = path.resolve(process.cwd(), 'src');
          if (fs.existsSync(srcDir)) {
            await fs.copy(srcDir, path.join(distDir, 'src'));
          }
          
          logger.stopSpinner(true, 'Default build completed');
        }
        
        // Create build package
        logger.startSpinner('Creating package...');
        
        const buildDir = path.resolve(process.cwd(), 'build');
        await fs.ensureDir(buildDir);
        
        const packageFileName = `${manifest.id.replace(/\./g, '-')}-${manifest.version}.zip`;
        const packageFilePath = path.join(buildDir, packageFileName);
        
        // In a real implementation, this would use a library like archiver to create a zip file
        logger.log('Creating zip package (not implemented in this example)', 'info');
        
        logger.stopSpinner(true, `Package created at ${packageFilePath}`);
        
        logger.log('\nNext steps:', 'info');
        logger.log('  vibe validate    - Validate the package', 'info');
        logger.log('  vibe publish     - Publish to marketplace', 'info');
      } catch (error) {
        logger.stopSpinner(false, 'Build process failed');
        logger.log((error as Error).message, 'error');
        process.exitCode = 1;
      }
    });
}
```
```

### Step 10: Publish Command Implementation

**Cursor Agent Prompt:**
```
Implement the publish command in src/commands/publish.ts:

```typescript
import { Command } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import { logger } from '../utils/logger';
import { Manifest, ValidationResult } from '../types';
import { validateManifest, validatePermissions, validateSecurity, validateAccessibility } from '../utils/validation';

export interface PublishOptions {
  skipValidation?: boolean;
  dryRun?: boolean;
}

export function publishCommand(program: Command): void {
  program
    .command('publish')
    .description('Publish to the marketplace')
    .option('--skip-validation', 'Skip validation checks', false)
    .option('--dry-run', 'Simulate publishing without actually submitting', false)
    .action(async (options: PublishOptions) => {
      logger.log('Publishing to marketplace...', 'info');
      
      try {
        // Check if current directory is a vibe project
        const manifestPath = path.resolve(process.cwd(), 'manifest.json');
        if (!fs.existsSync(manifestPath)) {
          logger.log('Not a vibe project directory. Make sure you\'re in a project folder with a manifest.json file.', 'error');
          return;
        }
        
        // Read manifest
        const manifest = await fs.readJson(manifestPath) as Manifest;
        
        // Run validation unless skipped
        if (!options.skipValidation) {
          logger.startSpinner('Validating project...');
          
          // Run validation checks
          const manifestResult = await validateManifest(manifest, false);
          const permissionsResult = await validatePermissions(manifest, false);
          const securityResult = await validateSecurity(process.cwd(), false);
          const accessibilityResult = await validateAccessibility(process.cwd(), false);
          
          // Combine results
          const result: ValidationResult = {
            valid: 
              manifestResult.valid && 
              permissionsResult.valid && 
              securityResult.valid && 
              accessibilityResult.valid,
            errors: [
              ...manifestResult.errors,
              ...permissionsResult.errors,
              ...securityResult.errors,
              ...accessibilityResult.errors
            ],
            warnings: [
              ...manifestResult.warnings,
              ...permissionsResult.warnings,
              ...securityResult.warnings,
              ...accessibilityResult.warnings
            ]
          };
          
          logger.stopSpinner(result.valid, result.valid ? 'Validation passed' : 'Validation failed');
          
          if (!result.valid) {
            logger.log(`Found ${result.errors.length} error(s):`, 'error');
            result.errors.forEach((error, index) => {
              logger.log(`  ${index + 1}. ${error.message}${error.path ? ` (${error.path})` : ''}`, 'error');
            });
            
            logger.log('Please fix the errors before publishing', 'info');
            return;
          }
          
          if (result.warnings.length > 0) {
            logger.log(`Found ${result.warnings.length} warning(s):`, 'warning');
            result.warnings.forEach((warning, index) => {
              logger.log(`  ${index + 1}. ${warning.message}${warning.path ? ` (${warning.path})` : ''}`, 'warning');
            });
            
            const { proceed } = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'proceed',
                message: 'Do you want to proceed with warnings?',
                default: false
              }
            ]);
            
            if (!proceed) {
              logger.log('Publication cancelled', 'info');
              return;
            }
          }
        }
        
        // Check if build exists
        const distDir = path.resolve(process.cwd(), 'dist');
        if (!fs.existsSync(distDir)) {
          logger.log('Build directory does not exist. Run "vibe build" first.', 'error');
          return;
        }
        
        // Confirm publication
        if (!options.dryRun) {
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Publish ${manifest.name} v${manifest.version} to the marketplace?`,
              default: false
            }
          ]);
          
          if (!confirm) {
            logger.log('Publication cancelled', 'info');
            return;
          }
        }
        
        // Publish
        logger.startSpinner(options.dryRun ? 'Simulating publication...' : 'Publishing to marketplace...');
        
        // In a real implementation, this would:
        // 1. Build the package if not already built
        // 2. Authenticate with the marketplace API
        // 3. Upload the package
        // 4. Submit for review
        
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (options.dryRun) {
          logger.stopSpinner(true, 'Dry run completed successfully');
          logger.log('No changes were made to the marketplace', 'info');
        } else {
          logger.stopSpinner(true, `${manifest.name} v${manifest.version} successfully published to the marketplace`);
          logger.log('Your submission has been sent for review', 'info');
          logger.log('You will be notified when the review is complete', 'info');
        }
      } catch (error) {
        logger.stopSpinner(false, 'Publication failed');
        logger.log((error as Error).message, 'error');
        process.exitCode = 1;
      }
    });
}
```
```

### Step 11: Validation Utilities

**Cursor Agent Prompt:**
```
Create basic validation utilities in src/utils/validation.ts:

```typescript
import path from 'path';
import fs from 'fs-extra';
import { Manifest, ValidationResult, ValidationError, ValidationWarning } from '../types';

// Default validation result
const defaultResult: ValidationResult = {
  valid: true,
  errors: [],
  warnings: []
};

/**
 * Validates the manifest file
 */
export async function validateManifest(
  manifest: Manifest, 
  fix = false
): Promise<ValidationResult> {
  const result: ValidationResult = { ...defaultResult };
  
  // Check required fields
  if (!manifest.id) {
    result.errors.push({
      code: 'manifest-missing-id',
      message: 'Manifest is missing required field: id'
    });
  } else if (!/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+[0-9a-z_]$/i.test(manifest.id)) {
    result.errors.push({
      code: 'manifest-invalid-id',
      message: 'Manifest id must be in reverse domain format (e.g., com.example.myapp)'
    });
  }
  
  if (!manifest.name) {
    result.errors.push({
      code: 'manifest-missing-name',
      message: 'Manifest is missing required field: name'
    });
  }
  
  if (!manifest.version) {
    result.errors.push({
      code: 'manifest-missing-version',
      message: 'Manifest is missing required field: version'
    });
  } else if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
    result.errors.push({
      code: 'manifest-invalid-version',
      message: 'Manifest version must be in semver format (e.g., 1.0.0)'
    });
  }
  
  if (!manifest.type) {
    result.errors.push({
      code: 'manifest-missing-type',
      message: 'Manifest is missing required field: type'
    });
  } else if (!['app', 'plugin', 'agent'].includes(manifest.type)) {
    result.errors.push({
      code: 'manifest-invalid-type',
      message: 'Manifest type must be one of: app, plugin, agent'
    });
  }
  
  // Check recommended fields
  if (!manifest.description) {
    result.warnings.push({
      code: 'manifest-missing-description',
      message: 'Manifest is missing recommended field: description'
    });
  }
  
  if (!manifest.author) {
    result.warnings.push({
      code: 'manifest-missing-author',
      message: 'Manifest is missing recommended field: author'
    });
  }
  
  // Auto-fix if requested
  if (fix) {
    let fixed = false;
    
    // Add fixes here in a real implementation
    
    if (fixed) {
      // Save fixed manifest
      await fs.writeJson(path.resolve(process.cwd(), 'manifest.json'), manifest, { spaces: 2 });
    }
  }
  
  result.valid = result.errors.length === 0;
  return result;
}

/**
 * Validates the permissions in the manifest
 */
export async function validatePermissions(
  manifest: Manifest, 
  fix = false
): Promise<ValidationResult> {
  const result: ValidationResult = { ...defaultResult };
  
  // Check if permissions are defined when needed
  if (manifest.type === 'app' || manifest.type === 'plugin') {
    if (!manifest.permissions || manifest.permissions.length === 0) {
      result.warnings.push({
        code: 'permissions-empty',
        message: 'No permissions defined. Most apps/plugins require permissions.'
      });
    } else {
      // Validate each permission
      manifest.permissions.forEach((permission, index) => {
        if (!permission.type) {
          result.errors.push({
            code: 'permission-missing-type',
            message: `Permission at index ${index} is missing required field: type`,
            path: `permissions[${index}].type`
          });
        }
        
        if (permission.type === 'memory' && (!permission.access || permission.access.length === 0)) {
          result.errors.push({
            code: 'permission-missing-access',
            message: `Memory permission at index ${index} is missing required field: access`,
            path: `permissions[${index}].access`
          });
        }
        
        // Check for overly broad permissions
        if (
          permission.type === 'memory' && 
          permission.access?.includes('write') && 
          (!permission.scope || permission.scope === 'global')
        ) {
          result.warnings.push({
            code: 'permission-too-broad',
            message: 'Global write permission is very broad. Consider using a more specific scope.',
            path: `permissions[${index}].scope`
          });
        }
      });
    }
  }
  
  // Auto-fix if requested
  if (fix) {
    let fixed = false;
    
    // Add fixes here in a real implementation
    
    if (fixed) {
      // Save fixed manifest
      await fs.writeJson(path.resolve(process.cwd(), 'manifest.json'), manifest, { spaces: 2 });
    }
  }
  
  result.valid = result.errors.length === 0;
  return result;
}

/**
 * Validates security aspects of the project
 */
export async function validateSecurity(
  projectDir: string, 
  fix = false
): Promise<ValidationResult> {
  const result: ValidationResult = { ...defaultResult };
  
  // In a real implementation, this would:
  // 1. Check for vulnerable dependencies
  // 2. Run security linting rules
  // 3. Check for insecure patterns
  // 4. Validate CSP compliance
  
  // Example check for demonstration
  const packageJsonPath = path.join(projectDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    
    // Check for scripts that could be security risks
    if (packageJson.scripts) {
      Object.entries(packageJson.scripts).forEach(([name, script]) => {
        if (typeof script === 'string' && script.includes('sudo ')) {
          result.errors.push({
            code: 'security-sudo-in-script',
            message: `Script "${name}" contains sudo command which is a security risk`,
            path: `package.json > scripts.${name}`
          });
        }
      });
    }
  }
  
  result.valid = result.errors.length === 0;
  return result;
}

/**
 * Validates accessibility of the project
 */
export async function validateAccessibility(
  projectDir: string, 
  fix = false
): Promise<ValidationResult> {
  const result: ValidationResult = { ...defaultResult };
  
  // In a real implementation, this would:
  // 1. Check for aria attributes
  // 2. Verify color contrast
  // 3. Ensure keyboard navigation
  // 4. Check for alt text on images
  
  // Example check for demonstration
  const srcDir = path.join(projectDir, 'src');
  if (fs.existsSync(srcDir)) {
    try {
      // Recursively find all .tsx and .jsx files
      const files = await findFiles(srcDir, ['.tsx', '.jsx']);
      
      // Check each file
      for (const file of files) {
        const content = await fs.readFile(file, 'utf8');
        
        // Simple check for image tags without alt attributes
        if (content.includes('<img ') && !content.includes('alt=')) {
          result.warnings.push({
            code: 'a11y-missing-alt',
            message: 'Found image tag without alt attribute',
            path: path.relative(projectDir, file)
          });
        }
      }
    } catch (error) {
      result.errors.push({
        code: 'a11y-check-failed',
        message: `Accessibility check failed: ${(error as Error).message}`
      });
    }
  }
  
  result.valid = result.errors.length === 0;
  return result;
}

/**
 * Helper function to find files with specific extensions
 */
async function findFiles(dir: string, extensions: string[]): Promise<string[]> {
  const files: string[] = [];
  
  const items = await fs.readdir(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stats = await fs.stat(fullPath);
    
    if (stats.isDirectory()) {
      const subDirFiles = await findFiles(fullPath, extensions);
      files.push(...subDirFiles);
    } else if (stats.isFile() && extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}
```
```

### Step 12: Sandbox Utility

**Cursor Agent Prompt:**
```
Create a basic sandbox utility in src/utils/sandbox.ts for local development:

```typescript
import path from 'path';
import fs from 'fs-extra';
import { Manifest } from '../types';
import { createServer } from 'http';
import { Server } from 'http';
import { open } from 'open'; // You'll need to install this: npm install open

interface SandboxOptions {
  projectDir: string;
  manifest: Manifest;
  port: number;
  openBrowser: boolean;
}

export async function startSandbox(options: SandboxOptions): Promise<Server> {
  const { projectDir, manifest, port, openBrowser } = options;
  
  // In a real implementation, this would:
  // 1. Set up a local development server
  // 2. Configure sandboxed environment for the project
  // 3. Handle hot reloading
  // 4. Simulate platform APIs
  // 5. Provide development tools
  
  // For this example, we'll create a simple HTTP server
  const server = createServer(async (req, res) => {
    // Serve a simple HTML page
    if (req.url === '/' || req.url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${manifest.name} - Development Sandbox</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              h1 { color: #333; }
              .card {
                background: #f5f5f5;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
              }
              .info {
                display: grid;
                grid-template-columns: 150px 1fr;
                gap: 10px;
              }
              .info div:nth-child(odd) {
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <h1>${manifest.name} - Development Sandbox</h1>
            <div class="card">
              <h2>Project Information</h2>
              <div class="info">
                <div>ID:</div>
                <div>${manifest.id}</div>
                <div>Version:</div>
                <div>${manifest.version}</div>
                <div>Type:</div>
                <div>${manifest.type}</div>
                <div>Description:</div>
                <div>${manifest.description || 'No description'}</div>
              </div>
            </div>
            <div class="card">
              <h2>Development Tools</h2>
              <ul>
                <li><a href="/debug">Debug Console</a></li>
                <li><a href="/inspector">Component Inspector</a></li>
                <li><a href="/memory">Memory Inspector</a></li>
                <li><a href="/permissions">Permission Tester</a></li>
              </ul>
            </div>
            <div class="card">
              <h2>Preview</h2>
              <iframe 
                src="/preview" 
                style="width: 100%; height: 500px; border: 1px solid #ddd; border-radius: 4px;"
              ></iframe>
            </div>
          </body>
        </html>
      `);
      return;
    }
    
    // Serve project preview
    if (req.url === '/preview') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      
      // Create a simple preview based on project type
      let preview = '<h1>Project Preview</h1><p>Preview not available for this project type.</p>';
      
      if (manifest.type === 'app') {
        preview = `
          <div style="padding: 20px;">
            <h2>${manifest.name}</h2>
            <p>${manifest.description || 'No description'}</p>
            <div id="app-root">Loading app...</div>
            <script>
              // In a real implementation, this would load the actual app
              document.getElementById('app-root').innerHTML = '<div style="padding: 20px; background: #f9f9f9; border-radius: 4px;">App UI would render here</div>';
            </script>
          </div>
        `;
      } else if (manifest.type === 'plugin') {
        preview = `
          <div style="padding: 20px;">
            <h2>${manifest.name} Plugin</h2>
            <p>${manifest.description || 'No description'}</p>
            <div style="margin-top: 20px;">
              <h3>Conversation Card Preview</h3>
              <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: white; max-width: 400px;">
                <div id="conversation-card">Loading conversation card...</div>
              </div>
            </div>
            <div style="margin-top: 20px;">
              <h3>Context Panel Preview</h3>
              <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: white; width: 300px; height: 400px;">
                <div id="context-panel">Loading context panel...</div>
              </div>
            </div>
            <script>
              // In a real implementation, this would load the actual plugin components
              document.getElementById('conversation-card').innerHTML = '<div style="padding: 10px; background: #f5f5f5; border-radius: 4px;">Conversation Card would render here</div>';
              document.getElementById('context-panel').innerHTML = '<div style="padding: 10px; background: #f5f5f5; border-radius: 4px;">Context Panel would render here</div>';
            </script>
          </div>
        `;
      } else if (manifest.type === 'agent') {
        preview = `
          <div style="padding: 20px;">
            <h2>${manifest.name} Agent</h2>
            <p>${manifest.description || 'No description'}</p>
            <div style="margin-top: 20px; border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: white;">
              <div style="display: flex; align-items: flex-start;">
                <div style="width: 40px; height: 40px; background: #e0e0e0; border-radius: 50%; margin-right: 15px;"></div>
                <div>
                  <div style="font-weight: bold; margin-bottom: 5px;">${manifest.name}</div>
                  <div id="agent-response">Agent would respond here based on user query...</div>
                </div>
              </div>
              <div style="margin-top: 20px;">
                <input type="text" placeholder="Type your question..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
              </div>
            </div>
          </div>
        `;
      }
      
      res.end(preview);
      return;
    }
    
    // Serve mock API endpoints for development
    if (req.url?.startsWith('/api/')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      
      // Simple API responses based on endpoint
      if (req.url === '/api/manifest') {
        res.end(JSON.stringify(manifest));
      } else if (req.url === '/api/memory') {
        res.end(JSON.stringify({
          items: [
            { key: 'user.preferences', value: { theme: 'light', language: 'en-US' } },
            { key: 'project.notes', value: ['Example note 1', 'Example note 2'] }
          ]
        }));
      } else {
        res.end(JSON.stringify({ error: 'Not implemented' }));
      }
      return;
    }
    
    // Serve static files from project
    const staticPath = path.join(projectDir, 'src', req.url || '');
    if (fs.existsSync(staticPath) && fs.statSync(staticPath).isFile()) {
      const ext = path.extname(staticPath);
      const contentType = getContentType(ext);
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(fs.readFileSync(staticPath));
      return;
    }
    
    // 404 for everything else
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });
  
  // Start the server
  await new Promise<void>((resolve) => {
    server.listen(port, () => {
      resolve();
    });
  });
  
  // Open browser if requested
  if (openBrowser) {
    await open(`http://localhost:${port}`);
  }
  
  return server;
}

/**
 * Helper function to get content type from file extension
 */
function getContentType(ext: string): string {
  const contentTypes: Record<string, string> = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  
  return contentTypes[ext] || 'text/plain';
}
```
```

### Step 13: Testing Utility

**Cursor Agent Prompt:**
```
Create a basic testing utility in src/utils/testing.ts:

```typescript
import { TestResult, TestFile } from '../types';
import path from 'path';
import { execSync } from 'child_process';
import fs from 'fs-extra';

interface TestOptions {
  projectDir: string;
  coverage?: boolean;
  watch?: boolean;
}

/**
 * Run unit tests using Jest
 */
export async function runUnitTests(options: TestOptions): Promise<TestResult> {
  return runTests('unit', options);
}

/**
 * Run integration tests using Jest
 */
export async function runIntegrationTests(options: TestOptions): Promise<TestResult> {
  return runTests('integration', options);
}

/**
 * Run end-to-end tests using Cypress
 */
export async function runE2ETests(options: TestOptions): Promise<TestResult> {
  return runTests('e2e', options);
}

/**
 * Run accessibility tests
 */
export async function runA11yTests(options: TestOptions): Promise<TestResult> {
  return runTests('a11y', options);
}

/**
 * Run tests of a specific type
 */
async function runTests(
  testType: 'unit' | 'integration' | 'e2e' | 'a11y', 
  options: TestOptions
): Promise<TestResult> {
  const { projectDir, coverage, watch } = options;
  
  // Check if the project has the necessary testing setup
  const packageJsonPath = path.join(projectDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return {
      success: false,
      stats: { total: 0, passed: 0, failed: 1, skipped: 0 },
      testFiles: [
        {
          name: 'setup',
          success: false,
          tests: [
            {
              name: 'Test environment',
              status: 'failed',
              error: 'package.json not found'
            }
          ]
        }
      ]
    };
  }
  
  // In a real implementation, this would:
  // 1. Run the appropriate test command
  // 2. Parse the test results
  // 3. Generate coverage reports if requested
  
  // For this example, we'll simulate running tests
  try {
    const packageJson = await fs.readJson(packageJsonPath);
    const hasJest = packageJson.dependencies?.jest || packageJson.devDependencies?.jest;
    const hasCypress = packageJson.dependencies?.cypress || packageJson.devDependencies?.cypress;
    
    let testCommand: string;
    
    if (testType === 'unit' || testType === 'integration') {
      if (!hasJest) {
        return {
          success: false,
          stats: { total: 0, passed: 0, failed: 1, skipped: 0 },
          testFiles: [
            {
              name: 'setup',
              success: false,
              tests: [
                {
                  name: 'Jest setup',
                  status: 'failed',
                  error: 'Jest not found in dependencies'
                }
              ]
            }
          ]
        };
      }
      
      // Build Jest command
      const jestConfig = testType === 'unit' 
        ? 'jest.config.js'
        : 'jest.integration.config.js';
      
      testCommand = `jest --config ${jestConfig}`;
      
      if (coverage) {
        testCommand += ' --coverage';
      }
      
      if (watch) {
        testCommand += ' --watch';
      }
    } else if (testType === 'e2e') {
      if (!hasCypress) {
        return {
          success: false,
          stats: { total: 0, passed: 0, failed: 1, skipped: 0 },
          testFiles: [
            {
              name: 'setup',
              success: false,
              tests: [
                {
                  name: 'Cypress setup',
                  status: 'failed',
                  error: 'Cypress not found in dependencies'
                }
              ]
            }
          ]
        };
      }
      
      // Build Cypress command
      testCommand = watch 
        ? 'cypress open'
        : 'cypress run';
    } else if (testType === 'a11y') {
      // Build accessibility test command
      testCommand = 'jest --config jest.a11y.config.js';
      
      if (coverage) {
        testCommand += ' --coverage';
      }
      
      if (watch) {
        testCommand += ' --watch';
      }
    } else {
      return {
        success: false,
        stats: { total: 0, passed: 0, failed: 1, skipped: 0 },
        testFiles: [
          {
            name: 'setup',
            success: false,
            tests: [
              {
                name: 'Test type',
                status: 'failed',
                error: `Unknown test type: ${testType}`
              }
            ]
          }
        ]
      };
    }
    
    // In a real implementation, this would actually run the tests
    // For this example, we'll simulate test results
    console.log(`[Simulated] Running command: ${testCommand}`);
    
    // Simulate a successful test run
    return {
      success: true,
      stats: { total: 10, passed: 9, failed: 0, skipped: 1 },
      testFiles: [
        {
          name: 'example.test.js',
          success: true,
          tests: [
            { name: 'should pass test 1', status: 'passed' },
            { name: 'should pass test 2', status: 'passed' },
            { name: 'should skip this test', status: 'skipped' }
          ]
        },
        {
          name: 'another.test.js',
          success: true,
          tests: [
            { name: 'should pass test 3', status: 'passed' },
            { name: 'should pass test 4', status: 'passed' }
          ]
        }
      ]
    };
    
  } catch (error) {
    return {
      success: false,
      stats: { total: 0, passed: 0, failed: 1, skipped: 0 },
      testFiles: [
        {
          name: 'execution',
          success: false,
          tests: [
            {
              name: 'Test execution',
              status: 'failed',
              error: (error as Error).message
            }
          ]
        }
      ]
    };
  }
}
```
```

### Step 14: Project Templates

**Cursor Agent Prompt:**
```
Create the basic template structure for an app project in templates/app/

1. First, create templates/app/package.json:
```json
{
  "name": "vibe-app-template",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vibe dev",
    "build": "tsc --noEmit && vite build",
    "test": "jest",
    "test:e2e": "cypress run",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/node": "^18.15.11",
    "@types/react": "^18.0.33",
    "@types/react-dom": "^18.0.11",
    "@typescript-eslint/eslint-plugin": "^5.57.1",
    "@typescript-eslint/parser": "^5.57.1",
    "eslint": "^8.38.0",
    "eslint-plugin-react": "^7.32.2",
    "jest": "^29.5.0",
    "jest-environment-jsdom": "^29.5.0",
    "ts-jest": "^29.1.0",
    "typescript": "^5.0.4",
    "vite": "^4.2.1"
  }
}
```

2. Create templates/app/manifest.json:
```json
{
  "id": "com.example.apptemplate",
  "name": "App Template",
  "version": "0.1.0",
  "description": "A template for creating AI Marketplace apps",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "type": "app",
  "permissions": [
    {
      "type": "memory",
      "access": ["read", "write"],
      "scope": "project"
    }
  ],
  "surfaces": {
    "appTab": {
      "entryPoint": "./src/components/AppHome.tsx",
      "title": "App Template",
      "defaultRoute": "/home"
    }
  }
}
```

3. Create templates/app/README.md:
```markdown
# AI Marketplace App

This is a template for creating apps for the AI Marketplace.

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

4. Test your app:
   ```
   npm test
   ```

## Project Structure

- `src/` - Source code
  - `components/` - React components
  - `hooks/` - Custom hooks
  - `utils/` - Utility functions
  - `index.ts` - Entry point

## Documentation

For more information, see the [AI Marketplace documentation](https://example.com/docs).
```

4. Create templates/app/src/index.ts:
```typescript
import { createApp } from '@ai-marketplace/sdk/app';
import AppHome from './components/AppHome';

export default createApp({
  id: 'com.example.apptemplate',
  name: 'App Template',
  
  // Initialize when app is first loaded
  onInitialize: async (context) => {
    console.log('App initialized with context:', context);
  },
  
  // Render the app UI
  render: ({ mount, context }) => {
    // Create root element
    const root = document.createElement('div');
    root.className = 'app-container';
    mount.appendChild(root);
    
    // Render the app
    const app = document.createElement('div');
    app.innerHTML = '<div id="app-root"></div>';
    root.appendChild(app);
    
    // In a real app, you would use React.render or similar
    // This is a simplified example
    const appRoot = document.getElementById('app-root');
    if (appRoot) {
      appRoot.innerHTML = `
        <div class="app-home">
          <h1>App Template</h1>
          <p>Welcome to your new app!</p>
          <button id="memory-test">Test Memory</button>
        </div>
      `;
      
      // Add event listener for the button
      const button = document.getElementById('memory-test');
      if (button) {
        button.addEventListener('click', async () => {
          try {
            // Example of using memory API
            const memoryData = await window.memory.get('test-key');
            alert(memoryData ? `Found data: ${JSON.stringify(memoryData)}` : 'No data found');
            
            // Set some data
            await window.memory.set('test-key', { timestamp: Date.now() });
            alert('Data saved to memory!');
          } catch (error) {
            alert(`Error: ${error.message}`);
          }
        });
      }
    }
    
    // Return cleanup function
    return () => {
      // Clean up event listeners, subscriptions, etc.
      const button = document.getElementById('memory-test');
      if (button) {
        button.removeEventListener('click', () => {});
      }
    };
  }
});
```

5. Create templates/app/src/components/AppHome.tsx:
```tsx
import React, { useState, useEffect } from 'react';
import { useMemory } from '@ai-marketplace/sdk/common/memory';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const AppHome: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const { data, loading, error, update } = useMemory<Note[]>('project.notes', {
    fallback: [],
    scope: 'project'
  });
  
  useEffect(() => {
    if (data) {
      setNotes(data);
    }
  }, [data]);
  
  const handleAddNote = async () => {
    if (!newNote.title || !newNote.content) return;
    
    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      createdAt: new Date().toISOString()
    };
    
    await update(currentNotes => [...currentNotes, note]);
    setNewNote({ title: '', content: '' });
  };
  
  const handleDeleteNote = async (id: string) => {
    await update(currentNotes => currentNotes.filter(note => note.id !== id));
  };
  
  if (loading) return <div>Loading notes...</div>;
  if (error) return <div>Error loading notes: {error.message}</div>;
  
  return (
    <div className="app-home">
      <h1>My Notes</h1>
      
      <div className="note-form">
        <h2>Add New Note</h2>
        <div>
          <input
            type="text"
            placeholder="Title"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          />
        </div>
        <div>
          <textarea
            placeholder="Content"
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
          />
        </div>
        <button onClick={handleAddNote}>Add Note</button>
      </div>
      
      <div className="notes-list">
        <h2>Your Notes</h2>
        {notes.length === 0 ? (
          <p>No notes yet. Create your first note above.</p>
        ) : (
          notes.map(note => (
            <div key={note.id} className="note-card">
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              <div className="note-footer">
                <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
                <button onClick={() => handleDeleteNote(note.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AppHome;
```

6. Create templates/app/tsconfig.json:
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```
```

### Step 15: Final Configuration

**Cursor Agent Prompt:**
```
Create the final configuration files for the project:

1. Create package.json for the vibing-cli project:
```json
{
  "name": "vibing-cli",
  "version": "0.1.0",
  "description": "CLI tool for developing applications for the AI Marketplace",
  "main": "dist/index.js",
  "bin": {
    "vibe": "./bin/vibe.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "ts-node src/index.ts",
    "start": "node dist/index.js",
    "test": "jest",
    "prepare": "npm run build"
  },
  "files": [
    "dist",
    "bin",
    "templates"
  ],
  "keywords": [
    "cli",
    "ai",
    "marketplace",
    "vibe",
    "development"
  ],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "chalk": "^4.1.2",
    "commander": "^10.0.0",
    "fs-extra": "^11.1.1",
    "inquirer": "^8.2.5",
    "open": "^8.4.2",
    "ora": "^5.4.1"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.1",
    "@types/inquirer": "^8.2.6",
    "@types/jest": "^29.5.0",
    "@types/node": "^18.15.11",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "ts-node": "^10.9.1",
    "typescript": "^5.0.4"
  }
}
```

2. Create tsconfig.json for the CLI project:
```json
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "CommonJS",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts", "**/*.spec.ts"]
}
```

3. Create .gitignore file:
```
# Dependencies
node_modules/

# Build output
dist/
build/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Testing
coverage/

# Editor directories and files
.idea/
.vscode/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Temporary files
temp/
tmp/
```

4. Create README.md for the CLI project:
```markdown
# Vibing CLI

A comprehensive CLI tool for developing applications for the AI Marketplace.

## Installation

```bash
npm install -g vibing-cli
```

## Usage

```bash
# Create a new project
vibe init my-app

# Start the development server
vibe dev

# Validate your project
vibe validate

# Run tests
vibe test

# Build for production
vibe build

# Publish to the marketplace
vibe publish
```

## Project Types

The CLI supports different project types:

- `app` - Full-featured applications with dedicated UIs
- `plugin` - Extensions that enhance platform capabilities
- `agent` - Specialized AI entities for specific domains

## Commands

### `vibe init [name]`

Create a new project.

Options:
- `-t, --type <type>` - Project type (app, plugin, agent) (default: "app")
- `-y, --yes` - Skip prompts and use defaults
- `--template <template>` - Use a specific template

### `vibe dev`

Start the development server.

Options:
- `-p, --port <port>` - Port to use (default: "3000")
- `-o, --open` - Open in browser

### `vibe validate`

Validate project for marketplace submission.

Options:
- `--fix` - Automatically fix issues when possible
- `--json` - Output results as JSON

### `vibe test`

Run tests.

Options:
- `--unit` - Run unit tests
- `--integration` - Run integration tests
- `--e2e` - Run end-to-end tests
- `--a11y` - Run accessibility tests
- `--all` - Run all tests
- `--coverage` - Generate coverage report
- `--watch` - Watch for changes
- `--json` - Output results as JSON

### `vibe build`

Build for production.

Options:
- `--clean` - Clean before building
- `--production` - Build for production (default: true)

### `vibe publish`

Publish to the marketplace.

Options:
- `--skip-validation` - Skip validation checks
- `--dry-run` - Simulate publishing without actually submitting

## Documentation

For more information, see the [AI Marketplace documentation](https://example.com/docs).

## License

MIT
```
```

## Next Steps for Development

After implementing these initial components, you should focus on:

1. **Building out the templates**:
   - Create more detailed templates for plugins and agents
   - Add more examples and starter code

2. **Implementing sandbox environment**:
   - Build a more robust development server
   - Implement proper platform API simulation

3. **Creating validation system**:
   - Implement thorough validation rules
   - Add automated fixing capabilities

4. **Developing testing framework**:
   - Implement actual test runners
   - Create accessibility testing tools

5. **Building comprehensive documentation**:
   - Create detailed guides for each command
   - Provide examples for common scenarios

Remember to make iterative improvements and gather feedback from early users to continue refining the CLI tool.
