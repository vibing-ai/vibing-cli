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
    .description('Validate the project')
    .option('--fix', 'Attempt to fix issues automatically', false)
    .action(async (options: ValidateOptions) => {
      try {
        await runValidation(options);
      } catch (error) {
        logger.log((error as Error).message, 'error');
        process.exitCode = 1;
      }
    });
}

/**
 * Run the validation process
 */
async function runValidation(options: ValidateOptions): Promise<void> {
  logger.log('Validating project...', 'info');
  
  // Check if current directory is a valid project
  const projectDir = validateProjectDirectory();
  if (!projectDir) return;
  
  // Read manifest file
  const manifest = await readManifest();
  if (!manifest) return;
  
  // Run validations
  const results = await runAllValidations(manifest, projectDir, options.fix ?? false);
  
  // Display results
  displayValidationResults(results);
}

/**
 * Check if current directory is a valid project directory
 */
function validateProjectDirectory(): string | null {
  const manifestPath = path.resolve(process.cwd(), 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    logger.log('Not a vibe project directory. Make sure you\'re in a project folder with a manifest.json file.', 'error');
    return null;
  }
  return process.cwd();
}

/**
 * Read the manifest file
 */
async function readManifest(): Promise<Manifest | null> {
  try {
    const manifestPath = path.resolve(process.cwd(), 'manifest.json');
    return await fs.readJson(manifestPath) as Manifest;
  } catch (error) {
    logger.log('Failed to read manifest.json', 'error');
    return null;
  }
}

/**
 * Run all validation checks
 */
async function runAllValidations(
  manifest: Manifest, 
  projectDir: string, 
  fix: boolean
): Promise<{
  manifestResult: ValidationResult;
  permissionsResult: ValidationResult;
  securityResult: ValidationResult;
  accessibilityResult: ValidationResult;
}> {
  logger.startSpinner('Running validation checks...');
  
  // Run various validation checks
  const manifestResult = await validateManifest(manifest, fix);
  const permissionsResult = await validatePermissions(manifest, fix);
  const securityResult = await validateSecurity(projectDir);
  const accessibilityResult = await validateAccessibility(projectDir);
  
  logger.stopSpinner(true, 'Validation checks completed');
  
  return {
    manifestResult,
    permissionsResult,
    securityResult,
    accessibilityResult
  };
}

/**
 * Display validation results
 */
function displayValidationResults(results: {
  manifestResult: ValidationResult;
  permissionsResult: ValidationResult;
  securityResult: ValidationResult;
  accessibilityResult: ValidationResult;
}): void {
  const { manifestResult, permissionsResult, securityResult, accessibilityResult } = results;
  
  // Count total errors and warnings
  const totalErrors = [
    ...manifestResult.errors,
    ...permissionsResult.errors,
    ...securityResult.errors,
    ...accessibilityResult.errors
  ];
  
  const totalWarnings = [
    ...manifestResult.warnings,
    ...permissionsResult.warnings,
    ...securityResult.warnings,
    ...accessibilityResult.warnings
  ];
  
  // Overall valid status
  const allValid = 
    manifestResult.valid && 
    permissionsResult.valid && 
    securityResult.valid && 
    accessibilityResult.valid;
  
  // Display summary
  if (allValid) {
    logger.log('✅ Validation passed!', 'success');
  } else {
    logger.log('❌ Validation failed', 'error');
  }
  
  logger.log(`Found ${totalErrors.length} error(s) and ${totalWarnings.length} warning(s)`, 
    totalErrors.length > 0 ? 'error' : 'info');
  
  // Display errors
  if (totalErrors.length > 0) {
    logger.log('\nErrors:', 'error');
    displayValidationItems(totalErrors);
  }
  
  // Display warnings
  if (totalWarnings.length > 0) {
    logger.log('\nWarnings:', 'warning');
    displayValidationItems(totalWarnings);
  }
  
  // Display next steps
  if (!allValid) {
    logger.log('\nPlease fix the errors before building or publishing your project.', 'info');
  } else if (totalWarnings.length > 0) {
    logger.log('\nConsider addressing the warnings to improve your project.', 'info');
  }
}

/**
 * Display validation items (errors or warnings)
 */
function displayValidationItems(items: {code: string; message: string; path?: string}[]): void {
  items.forEach((item, index) => {
    const prefix = `  ${index + 1}. `;
    const message = item.path 
      ? `${item.message} (${item.path})` 
      : item.message;
    
    logger.log(`${prefix}${message}`, item.code.includes('error') ? 'error' : 'warning');
  });
}
