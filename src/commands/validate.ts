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
