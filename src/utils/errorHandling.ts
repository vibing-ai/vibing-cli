import { logger } from './logger';

/**
 * Standard error handler for CLI commands
 * This ensures consistent error handling and cleanup across all commands
 * 
 * @param error The error to handle
 * @param cleanupFn Optional cleanup function to run before exiting
 */
export function handleCommandError(error: unknown, cleanupFn?: () => void): never {
  try {
    // Stop any running spinners
    logger.stopSpinner(false, 'Operation failed');
    
    // Log the error message
    const message = error instanceof Error 
      ? error.message 
      : String(error);
    
    logger.log(message, 'error');
    
    // Run cleanup function if provided
    if (cleanupFn) {
      cleanupFn();
    }
  } catch (cleanupError) {
    // If cleanup fails, log it but continue with exit
    logger.log('Cleanup failed: ' + String(cleanupError), 'error');
  } finally {
    // Set exit code and exit
    process.exitCode = 1;
  }
  
  // This is just to satisfy TypeScript, the process will exit
  throw error;
}

/**
 * Wraps an async command function with standardized error handling
 * 
 * @param fn The async command function to wrap
 * @param cleanupFn Optional cleanup function to run in case of error
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  cleanupFn?: () => void
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleCommandError(error, cleanupFn);
    }
  };
} 