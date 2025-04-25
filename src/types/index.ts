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

// Development server options
export interface DevOptions {
  port?: string;
  open?: boolean;
}

// Initialization options
export interface InitOptions {
  type?: ProjectType;
  yes?: boolean;
  template?: string;
}

// Validation options
export interface ValidateOptions {
  fix?: boolean;
  json?: boolean;
}

// Test options
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

// Build options
export interface BuildOptions {
  clean?: boolean;
  production?: boolean;
}

// Publish options
export interface PublishOptions {
  skipValidation?: boolean;
  dryRun?: boolean;
} 