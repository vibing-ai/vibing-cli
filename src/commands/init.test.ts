import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import { initCommand } from './init';
import { logger } from '../utils/logger';
import { ProjectType } from '../types';

// Mock dependencies
jest.mock('fs-extra');
jest.mock('../utils/logger');

// Mock inquirer with proper type handling
jest.mock('inquirer');
const mockedInquirer = inquirer as unknown as { prompt: jest.Mock };

describe('init command', () => {
  let program: Command;
  const originalCwd = process.cwd.bind(process);
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a fresh Command instance for each test
    program = new Command();
    
    // Initialize the command
    initCommand(program);
    
    // Mock logging functions
    (logger.log as jest.Mock).mockImplementation((message: string) => {
      // Do nothing in tests, but this is a proper mock implementation
      return; 
    });
    (logger.startSpinner as jest.Mock).mockImplementation((message: string) => {
      // Do nothing in tests, but this is a proper mock implementation
      return;
    });
    (logger.stopSpinner as jest.Mock).mockImplementation((success: boolean, message: string) => {
      // Do nothing in tests, but this is a proper mock implementation
      return;
    });
    
    // Mock fs-extra functions
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.ensureDirSync as jest.Mock).mockImplementation(() => undefined);
    (fs.ensureDir as jest.Mock).mockImplementation(() => Promise.resolve());
    ((fs.copyFile as unknown) as jest.Mock).mockImplementation(() => Promise.resolve());
    ((fs.readdir as unknown) as jest.Mock).mockImplementation(() => Promise.resolve([
      { name: 'file1.txt', isDirectory: () => false },
      { name: 'folder1', isDirectory: () => true }
    ]));
    (fs.readJson as jest.Mock).mockResolvedValue({});
    (fs.writeJson as jest.Mock).mockResolvedValue(undefined);
    (fs.removeSync as jest.Mock).mockImplementation(() => undefined);
  });
  
  // Ensure process.cwd is always restored after each test
  afterEach(() => {
    process.cwd = originalCwd;
  });
  
  test.only('should register the init command', () => {
    // Find the init command in the program
    const initCmd = program.commands.find(cmd => cmd.name() === 'init');
    
    // Verify the command was registered
    expect(initCmd).toBeDefined();
    if (initCmd) {
      const name = initCmd.name.bind(initCmd);
      const description = initCmd.description.bind(initCmd);
      const usage = initCmd.usage.bind(initCmd);
      
      expect(name()).toBe('init');
      expect(description()).toBe('Create a new project');
      expect(usage()).toContain('[name]');
    }
  });
  
  test('should create a project with specified name and default options', async () => {
    // Mock process.cwd()
    process.cwd = jest.fn().mockReturnValue('/test');
    
    // Force all existsSync calls to return false to simplify the flow
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    
    // Mock inquirer to return a type
    mockedInquirer.prompt.mockResolvedValueOnce({ type: 'app' });
    
    // Create a spy to check that the logger was used 
    const startSpinnerSpy = jest.spyOn(logger, 'startSpinner');
    
    // Execute the command
    await program.parseAsync(['node', 'test', 'init', 'test-project']);
    
    // Verify logs were called
    expect(startSpinnerSpy).toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith('Creating new project...', 'info');
    
    // Verify directory existence check
    expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining('/test/test-project'));
  });
  
  test('should prompt for name if not provided', async () => {
    // Mock process.cwd()
    process.cwd = jest.fn().mockReturnValue('/test');
    
    // Add a spy on fs methods
    const existsSpy = jest.fn();
    (fs.existsSync as jest.Mock).mockImplementation((path) => {
      existsSpy(path);
      return path.includes('templates'); // Only template exists
    });
    
    // Mock the inquirer to return responses
    mockedInquirer.prompt = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({ name: 'prompted-name' }))
      .mockImplementationOnce(() => Promise.resolve({ type: 'app' }));
    
    // Execute the command without name
    await program.parseAsync(['node', 'test', 'init']);
    
    // Verify prompt was called
    expect(mockedInquirer.prompt).toHaveBeenNthCalledWith(1, expect.arrayContaining([
      expect.objectContaining({ name: 'name' })
    ]));
    
    // Verify existsSync was called with the prompted name
    expect(existsSpy).toHaveBeenCalledWith('/test/prompted-name');
  });
  
  test('should handle directory already exists', async () => {
    // Mock process.cwd()
    process.cwd = jest.fn().mockReturnValue('/test');
    
    // Add a spy on fs methods
    const existsSpy = jest.fn();
    (fs.existsSync as jest.Mock).mockImplementation((path) => {
      existsSpy(path);
      if (path.includes('templates')) return true; // Template exists
      if (path.includes('/test/existing-project')) return true; // Target exists
      return false; // Default
    });
    
    const removeSpy = jest.fn();
    (fs.removeSync as jest.Mock).mockImplementation(removeSpy);
    
    // Mock the inquirer to return responses
    mockedInquirer.prompt = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({ type: 'app' }))
      .mockImplementationOnce(() => Promise.resolve({ overwrite: true }));
    
    // Execute the command
    await program.parseAsync(['node', 'test', 'init', 'existing-project']);
    
    // Verify directory was checked
    expect(existsSpy).toHaveBeenCalledWith('/test/existing-project');
  });
  
  test('should cancel if user declines overwrite', async () => {
    // Mock process.cwd()
    process.cwd = jest.fn().mockReturnValue('/test');
    
    // Add a spy on fs methods
    const existsSpy = jest.fn();
    (fs.existsSync as jest.Mock).mockImplementation((path) => {
      existsSpy(path);
      if (path.includes('templates')) return true; // Template exists
      if (path.includes('/test/existing-project')) return true; // Target exists
      return false; // Default
    });
    
    const removeSpy = jest.fn();
    (fs.removeSync as jest.Mock).mockImplementation(removeSpy);
    
    // Mock the inquirer to return responses
    mockedInquirer.prompt = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({ type: 'app' }))
      .mockImplementationOnce(() => Promise.resolve({ overwrite: false }));
    
    const logSpy = jest.spyOn(logger, 'log');
    
    // Execute the command
    await program.parseAsync(['node', 'test', 'init', 'existing-project']);
    
    // Verify directory was NOT removed
    expect(removeSpy).not.toHaveBeenCalled();
    
    // Verify cancellation message was shown
    expect(logSpy).toHaveBeenCalledWith('Project creation cancelled.', 'info');
  });
});