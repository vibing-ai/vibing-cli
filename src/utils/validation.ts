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