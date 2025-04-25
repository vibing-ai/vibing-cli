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
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a fresh Command instance for each test
    program = new Command();
    
    // Initialize the command
    initCommand(program);
    
    // Mock logging functions
    (logger.log as jest.Mock).mockImplementation(() => {});
    (logger.startSpinner as jest.Mock).mockImplementation(() => {});
    (logger.stopSpinner as jest.Mock).mockImplementation(() => {});
    
    // Mock fs-extra functions
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.copy as jest.Mock).mockResolvedValue(undefined);
    (fs.readJson as jest.Mock).mockResolvedValue({});
    (fs.writeJson as jest.Mock).mockResolvedValue(undefined);
    (fs.removeSync as jest.Mock).mockImplementation(() => {});
  });
  
  test('should register the init command', () => {
    // Find the init command in the program
    const initCmd = program.commands.find(cmd => cmd.name() === 'init');
    
    // Verify the command was registered
    expect(initCmd).toBeDefined();
    expect(initCmd?.description()).toBe('Create a new project');
    expect(initCmd?.usage()).toContain('[name]');
  });
  
  test('should create a project with specified name and default options', async () => {
    // Mock process.cwd()
    const originalCwd = process.cwd;
    process.cwd = jest.fn().mockReturnValue('/test');
    
    // Mock inquirer to return a type (needed because we're not using --yes option)
    mockedInquirer.prompt.mockResolvedValueOnce({ type: 'app' as ProjectType });
    
    // Execute the command
    await program.parseAsync(['node', 'test', 'init', 'test-project']);
    
    // Check if the project directory was created
    expect(fs.copy).toHaveBeenCalledWith(
      expect.stringContaining(path.join('templates', 'app')),
      '/test/test-project'
    );
    
    // Check if files were updated
    expect(fs.writeJson).toHaveBeenCalledTimes(2);
    
    // Restore original cwd
    process.cwd = originalCwd;
  });
  
  test('should prompt for name if not provided', async () => {
    // Mock process.cwd()
    const originalCwd = process.cwd;
    process.cwd = jest.fn().mockReturnValue('/test');
    
    // Mock inquirer to return a name and a type
    mockedInquirer.prompt.mockResolvedValueOnce({ name: 'prompted-name' });
    mockedInquirer.prompt.mockResolvedValueOnce({ type: 'app' as ProjectType });
    
    // Execute the command without name
    await program.parseAsync(['node', 'test', 'init']);
    
    // Verify prompt was called
    expect(mockedInquirer.prompt).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ name: 'name' })
    ]));
    
    // Check if project was created with prompted name
    expect(fs.copy).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('prompted-name')
    );
    
    // Restore original cwd
    process.cwd = originalCwd;
  });
  
  test('should handle directory already exists', async () => {
    // Mock process.cwd()
    const originalCwd = process.cwd;
    process.cwd = jest.fn().mockReturnValue('/test');
    
    // Mock fs.existsSync to return true
    (fs.existsSync as jest.Mock).mockReturnValueOnce(false)  // First check for manifest
                               .mockReturnValueOnce(true);   // Check for directory exists
    
    // Mock inquirer for type selection and overwrite confirmation
    mockedInquirer.prompt.mockResolvedValueOnce({ type: 'app' as ProjectType });
    mockedInquirer.prompt.mockResolvedValueOnce({ overwrite: true });
    
    // Execute the command
    await program.parseAsync(['node', 'test', 'init', 'existing-project']);
    
    // Verify existing directory was removed
    expect(fs.removeSync).toHaveBeenCalled();
    expect(fs.copy).toHaveBeenCalled();
    
    // Restore original cwd
    process.cwd = originalCwd;
  });
  
  test('should cancel if user declines overwrite', async () => {
    // Mock process.cwd()
    const originalCwd = process.cwd;
    process.cwd = jest.fn().mockReturnValue('/test');
    
    // Mock fs.existsSync to return true
    (fs.existsSync as jest.Mock).mockReturnValueOnce(false)  // First check for manifest
                               .mockReturnValueOnce(true);   // Check for directory exists
    
    // Mock inquirer to select type and decline overwrite
    mockedInquirer.prompt.mockResolvedValueOnce({ type: 'app' as ProjectType });
    mockedInquirer.prompt.mockResolvedValueOnce({ overwrite: false });
    
    // Execute the command
    await program.parseAsync(['node', 'test', 'init', 'existing-project']);
    
    // Verify copy was not called
    expect(fs.removeSync).not.toHaveBeenCalled();
    expect(fs.copy).not.toHaveBeenCalled();
    
    // Restore original cwd
    process.cwd = originalCwd;
  });
});