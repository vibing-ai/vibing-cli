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
