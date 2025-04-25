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
