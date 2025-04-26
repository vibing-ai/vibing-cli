import path from 'path';
import fs from 'fs-extra';
import { Manifest, ValidationResult, ValidationWarning, Permission } from '../types';

// Default validation result
const defaultResult: ValidationResult = {
  valid: true,
  errors: [],
  warnings: []
};

/**
 * Validates the manifest file
 */
export function validateManifest(
  manifest: Manifest, 
  fix = false
): ValidationResult {
  const result: ValidationResult = { ...defaultResult };
  
  // Check required fields
  validateRequiredFields(manifest, result);
  
  // Check recommended fields
  validateRecommendedFields(manifest, result);
  
  result.valid = result.errors.length === 0;
  return result;
}

/**
 * Validate required manifest fields
 */
function validateRequiredFields(manifest: Manifest, result: ValidationResult): void {
  // Validate ID field
  if (!manifest.id) {
    result.errors.push({
      code: 'manifest-missing-id',
      message: 'Manifest is missing required field: id'
    });
  } else if (!/^[a-z][a-z0-9_]{0,63}(\.[a-z0-9_]{1,63}){1,10}$/i.test(manifest.id)) {
    // Safer regex with bounds on repetition to prevent ReDoS
    result.errors.push({
      code: 'manifest-invalid-id',
      message: 'Manifest id must be in reverse domain format (e.g., com.example.myapp)'
    });
  }
  
  // Validate name field
  if (!manifest.name) {
    result.errors.push({
      code: 'manifest-missing-name',
      message: 'Manifest is missing required field: name'
    });
  }
  
  // Validate version field
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
  
  // Validate type field
  if (manifest.type === undefined) {
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
}

/**
 * Validate recommended manifest fields
 */
function validateRecommendedFields(manifest: Manifest, result: ValidationResult): void {
  // Check description field
  if (!manifest.description) {
    result.warnings.push({
      code: 'manifest-missing-description',
      message: 'Manifest is missing recommended field: description'
    });
  }
  
  // Check author field
  if (!manifest.author) {
    result.warnings.push({
      code: 'manifest-missing-author',
      message: 'Manifest is missing recommended field: author'
    });
  }
}

/**
 * Validates the permissions in the manifest
 */
export function validatePermissions(
  manifest: Manifest, 
  fix = false
): ValidationResult {
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
        validateSinglePermission(permission, index, result);
      });
    }
  }
  
  result.valid = result.errors.length === 0;
  return result;
}

/**
 * Validate a single permission entry
 */
function validateSinglePermission(permission: Permission, index: number, result: ValidationResult): void {
  // Check for required type field
  if (!permission.type) {
    result.errors.push({
      code: 'permission-missing-type',
      message: `Permission at index ${index} is missing required field: type`,
      path: `permissions[${index}].type`
    });
  }
  
  // Check for memory permission requirements
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
}

/**
 * Validates security aspects of the project
 */
export async function validateSecurity(
  projectDir: string
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
 * Helper function to find files with specific extensions
 */
async function findFiles(dir: string, extensions: string[]): Promise<string[]> {
  const files: string[] = [];
  
  // Validate and normalize the directory path
  const normalizedDir = path.normalize(dir);
  
  // Ensure the directory path is absolute and exists
  if (!path.isAbsolute(normalizedDir)) {
    console.error(`Directory path must be absolute: ${normalizedDir}`);
    return files;
  }
  
  if (!await fs.pathExists(normalizedDir)) {
    console.error(`Directory does not exist: ${normalizedDir}`);
    return files;
  }
  
  try {
    const items = await fs.readdir(normalizedDir);
    
    for (const item of items) {
      // Skip items that start with . to avoid hidden files/directories
      if (item.startsWith('.')) {
        continue;
      }
      
      // Construct and validate full path
      const fullPath = path.join(normalizedDir, item);
      
      // Ensure the path is still within the original directory (prevent path traversal)
      if (!fullPath.startsWith(normalizedDir)) {
        console.error(`Path traversal detected: ${fullPath}`);
        continue;
      }
      
      try {
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory()) {
          const subDirFiles = await findFiles(fullPath, extensions);
          files.push(...subDirFiles);
        } else if (stats.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      } catch (error) {
        // Log but continue processing other files
        console.error(`Error reading file stats for ${fullPath}:`, error);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${normalizedDir}:`, error);
  }
  
  return files;
}

// Helper to safely read a file within specified base path
async function safeReadFile(filePath: string, baseDir: string, encoding: BufferEncoding = 'utf8'): Promise<string | null> {
  // Normalize paths
  const normalizedFilePath = path.normalize(filePath);
  const normalizedBaseDir = path.normalize(baseDir);
  
  // Check for path traversal attempts
  if (!normalizedFilePath.startsWith(normalizedBaseDir)) {
    console.error(`Path traversal attempt detected: ${filePath}`);
    return null;
  }
  
  // Check if file exists
  if (!await fs.pathExists(normalizedFilePath)) {
    console.error(`File does not exist: ${filePath}`);
    return null;
  }
  
  try {
    return await fs.readFile(normalizedFilePath, encoding);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// Helper to safely check if file exists within specified base path
async function safePathExists(targetPath: string, baseDir: string): Promise<boolean> {
  // Normalize paths
  const normalizedPath = path.normalize(targetPath);
  const normalizedBaseDir = path.normalize(baseDir);
  
  // Check for path traversal attempts
  if (!normalizedPath.startsWith(normalizedBaseDir)) {
    console.error(`Path traversal attempt detected: ${targetPath}`);
    return false;
  }
  
  return await fs.pathExists(normalizedPath);
}

/**
 * Validates accessibility of the project
 */
export async function validateAccessibility(
  projectDir: string
): Promise<ValidationResult> {
  const result: ValidationResult = { ...defaultResult };
  
  // Validate and normalize the project directory path
  const normalizedProjectDir = path.normalize(projectDir);
  
  // Example check for demonstration
  const srcDir = path.join(normalizedProjectDir, 'src');
  
  try {
    // Check if src directory exists
    const srcExists = await safePathExists(srcDir, normalizedProjectDir);
    if (srcExists) {
      // Recursively find all .tsx and .jsx files
      const files = await findFiles(srcDir, ['.tsx', '.jsx']);
      
      // Check each file
      for (const file of files) {
        try {
          // Make sure file is within project directory
          if (!file.startsWith(normalizedProjectDir)) {
            continue;
          }
          
          const content = await safeReadFile(file, normalizedProjectDir);
          if (!content) continue;
          
          // Safely check for image tags without alt attributes using regex instead of includes
          const imgTagWithoutAlt = /<img\s+(?![^>]*\balt=)[^>]*\/?>/i;
          if (imgTagWithoutAlt.test(content)) {
            result.warnings.push({
              code: 'a11y-missing-alt',
              message: 'Found image tag without alt attribute',
              path: path.relative(normalizedProjectDir, file)
            });
          }
        } catch (error) {
          console.error(`Error reading file ${file}:`, error);
        }
      }
    }
  } catch (error) {
    result.errors.push({
      code: 'a11y-check-failed',
      message: `Accessibility check failed: ${(error as Error).message}`
    });
  }
  
  result.valid = result.errors.length === 0;
  return result;
}