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
        // Check if this is a valid project directory
        const manifestPath = checkProjectDirectory();
        if (!manifestPath) return;
        
        // Read manifest
        const manifest = await fs.readJson(manifestPath) as Manifest;
        
        // Perform validation if not skipped
        if (!options.skipValidation) {
          const isValid = await validateProject(manifest);
          if (!isValid) return;
        }
        
        // Check if build exists
        if (!checkBuildDirectory()) return;
        
        // Confirm publication
        if (!options.dryRun && !(await confirmPublication(manifest))) return;
        
        // Perform publication
        await publishToMarketplace(manifest, options.dryRun);
        
      } catch (error) {
        logger.stopSpinner(false, 'Publication failed');
        logger.log((error as Error).message, 'error');
        process.exitCode = 1;
      }
    });
}

/**
 * Check if current directory is a valid project directory
 */
function checkProjectDirectory(): string | null {
  const manifestPath = path.resolve(process.cwd(), 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    logger.log('Not a vibe project directory. Make sure you\'re in a project folder with a manifest.json file.', 'error');
    return null;
  }
  return manifestPath;
}

/**
 * Check if build directory exists
 */
function checkBuildDirectory(): boolean {
  const distDir = path.resolve(process.cwd(), 'dist');
  if (!fs.existsSync(distDir)) {
    logger.log('Build directory does not exist. Run "vibe build" first.', 'error');
    return false;
  }
  return true;
}

/**
 * Validate the project and report errors/warnings
 */
async function validateProject(manifest: Manifest): Promise<boolean> {
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
  
  // Report errors
  if (!result.valid) {
    reportValidationErrors(result.errors);
    return false;
  }
  
  // Report warnings
  if (result.warnings.length > 0) {
    return await handleValidationWarnings(result.warnings);
  }
  
  return true;
}

/**
 * Report validation errors to the console
 */
function reportValidationErrors(errors: any[]): void {
  logger.log(`Found ${errors.length} error(s):`, 'error');
  errors.forEach((error, index) => {
    logger.log(`  ${index + 1}. ${error.message}${error.path ? ` (${error.path})` : ''}`, 'error');
  });
  
  logger.log('Please fix the errors before publishing', 'info');
}

/**
 * Handle validation warnings and prompt for continuation
 */
async function handleValidationWarnings(warnings: any[]): Promise<boolean> {
  logger.log(`Found ${warnings.length} warning(s):`, 'warning');
  warnings.forEach((warning, index) => {
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
    return false;
  }
  
  return true;
}

/**
 * Confirm publication with the user
 */
async function confirmPublication(manifest: Manifest): Promise<boolean> {
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
    return false;
  }
  
  return true;
}

/**
 * Publish to marketplace (or simulate publication)
 */
async function publishToMarketplace(manifest: Manifest, isDryRun: boolean): Promise<void> {
  logger.startSpinner(isDryRun ? 'Simulating publication...' : 'Publishing to marketplace...');
  
  // In a real implementation, this would:
  // 1. Build the package if not already built
  // 2. Authenticate with the marketplace API
  // 3. Upload the package
  // 4. Submit for review
  
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  if (isDryRun) {
    logger.stopSpinner(true, 'Dry run completed successfully');
    logger.log('No changes were made to the marketplace', 'info');
  } else {
    logger.stopSpinner(true, `${manifest.name} v${manifest.version} successfully published to the marketplace`);
    logger.log('Your submission has been sent for review', 'info');
    logger.log('You will be notified when the review is complete', 'info');
  }
}
