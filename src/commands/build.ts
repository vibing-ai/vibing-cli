import { Command } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import { logger } from '../utils/logger';
import { Manifest } from '../types';
import { execSync, exec } from 'child_process';

export interface BuildOptions {
  clean?: boolean;
  production?: boolean;
}

export function buildCommand(program: Command): void {
  program
    .command('build')
    .description('Build the project for production')
    .option('-c, --clean', 'Clean the build directory before building', false)
    .action(async (options: BuildOptions) => {
      try {
        await runBuildProcess(options);
      } catch (error) {
        logger.log((error as Error).message, 'error');
        process.exitCode = 1;
      }
    });
}

/**
 * Run the main build process
 */
async function runBuildProcess(options: BuildOptions): Promise<void> {
  logger.log('Building project for production...', 'info');
        
  // Check if current directory is a vibe project
  const projectDir = validateProjectDirectory();
  if (!projectDir) return;
  
  // Clean the build directory if requested
  if (options.clean) {
    await cleanBuildDirectory();
  }
  
  // Read the manifest file
  const manifest = await readManifest();
  if (!manifest) return;
  
  // Determine build steps based on project type
  await buildProjectByType(manifest);
  
  logger.log('Build completed successfully!', 'success');
}

/**
 * Validates that the current directory is a valid vibe project
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
 * Clean the build directory
 */
async function cleanBuildDirectory(): Promise<void> {
  logger.startSpinner('Cleaning build directory...');
  const distDir = path.resolve(process.cwd(), 'dist');
  
  if (fs.existsSync(distDir)) {
    await fs.remove(distDir);
  }
  
  logger.stopSpinner(true, 'Build directory cleaned');
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
 * Build the project based on its type
 */
async function buildProjectByType(manifest: Manifest): Promise<void> {
  logger.startSpinner(`Building ${manifest.type} project...`);
  
  // Create dist directory
  const distDir = path.resolve(process.cwd(), 'dist');
  await fs.ensureDir(distDir);
  
  // Copy manifest to dist
  await fs.copyFile(
    path.resolve(process.cwd(), 'manifest.json'), 
    path.resolve(distDir, 'manifest.json')
  );
  
  // Specific build steps based on project type
  switch (manifest.type) {
    case 'app':
      await buildAppProject();
      break;
    case 'plugin':
      await buildPluginProject();
      break;
    case 'agent':
      await buildAgentProject();
      break;
    default:
      logger.stopSpinner(false, `Unknown project type: ${manifest.type}`);
      return;
  }
  
  logger.stopSpinner(true, 'Build completed');
}

/**
 * Build an app project
 */
async function buildAppProject(): Promise<void> {
  try {
    // Create package using webpack (simplified here)
    await executeCommand('npx webpack --mode production');
    
    // Copy necessary files
    await fs.copy(
      path.resolve(process.cwd(), 'public'), 
      path.resolve(process.cwd(), 'dist/public'),
      { filter: (src) => !src.includes('node_modules') }
    );
  } catch (error) {
    throw new Error(`Failed to build app: ${(error as Error).message}`);
  }
}

/**
 * Build a plugin project
 */
async function buildPluginProject(): Promise<void> {
  try {
    // Create package using webpack (simplified here)
    await executeCommand('npx webpack --mode production');
    
    // Copy necessary files
    const metadataPath = path.resolve(process.cwd(), 'metadata.json');
    if (fs.existsSync(metadataPath)) {
      await fs.copyFile(
        metadataPath, 
        path.resolve(process.cwd(), 'dist/metadata.json')
      );
    }
  } catch (error) {
    throw new Error(`Failed to build plugin: ${(error as Error).message}`);
  }
}

/**
 * Build an agent project
 */
async function buildAgentProject(): Promise<void> {
  try {
    // Create package using webpack/rollup (simplified here)
    await executeCommand('npx webpack --mode production');
    
    // Copy necessary files
    const knowledgeDir = path.resolve(process.cwd(), 'knowledge');
    if (fs.existsSync(knowledgeDir)) {
      await fs.copy(
        knowledgeDir, 
        path.resolve(process.cwd(), 'dist/knowledge')
      );
    }
  } catch (error) {
    throw new Error(`Failed to build agent: ${(error as Error).message}`);
  }
}

/**
 * Execute a shell command
 */
async function executeCommand(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Validate command against a whitelist of allowed commands to prevent command injection
    const allowedCommands = [
      'npx webpack --mode production',
      'npm run build'
    ];
    
    if (!allowedCommands.includes(command)) {
      reject(new Error(`Command not allowed: ${command}`));
      return;
    }
    
    exec(command, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
