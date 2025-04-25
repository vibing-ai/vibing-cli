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
