# Contributing to Vibing AI CLI

Thank you for your interest in contributing to the Vibing AI CLI! This document provides guidelines and instructions to help you get started with contributing to our official command-line tool for the Vibing AI platform.

## About Vibing AI

Vibing AI is a platform that enables developers to build, deploy, and monetize AI-powered applications. Our CLI tool is essential for developers interacting with the Vibing AI ecosystem, providing an efficient workflow for creating and managing projects.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) to understand what kind of behavior is expected.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/vibing-cli.git
   cd vibing-cli
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Set up development environment**
   ```bash
   npm run build
   npm link # Makes the Vibing AI CLI available globally as 'vibe'
   ```

## Development Workflow

1. **Create a new branch for your feature or bugfix**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-you-are-fixing
   ```

2. **Make your changes**
   - Follow the coding style and conventions used in the project
   - Write tests for your changes when applicable
   - Run tests to ensure everything works as expected: `npm test`

3. **Commit your changes**
   ```bash
   git commit -am "Add your detailed commit message"
   ```
   
   Please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages:
   - `feat: add new feature`
   - `fix: correct bug`
   - `docs: update documentation`
   - `style: formatting changes`
   - `refactor: code changes that neither fix nor add`
   - `test: add or update tests`
   - `chore: updates to build process, etc.`

4. **Push your changes**
   ```bash
   git push origin your-branch-name
   ```

5. **Submit a pull request**
   - Fill in the pull request template
   - Reference any relevant issues
   - Describe your changes in detail

## Development Guidelines

### Project Structure

The Vibing AI CLI is structured as follows:
- `src/` - Source code for the CLI
- `templates/` - Project templates used by the `init` command
- `dist/` - Compiled code (generated during build)
- `test/` - Test files

### Code Style

We use ESLint and Prettier to maintain code quality and consistency. Please ensure your code follows our style guidelines by running:

```bash
npm run lint
npm run format
```

### Testing

- Write tests for all new features and bug fixes
- Ensure all tests pass before submitting your pull request
- Run the test suite with: `npm test`

### Documentation

- Update documentation for any changed functionality
- Document new features, options, or commands
- Keep README.md and other documentation files up to date

## Pull Request Process

1. Update the README.md and documentation with details of changes if applicable
2. Update the version numbers in package.json and other files following [Semantic Versioning](https://semver.org/)
3. The PR will be merged once it receives approval from maintainers

## Release Process

Release management is handled by the Vibing AI team. We follow Semantic Versioning for releases.

## Questions?

If you have any questions or need help, please:
- Open an issue in the repository
- Reach out to the Vibing AI team via our [Community Forums](https://community.vibing.ai)
- Contact us at [developers@vibing.ai](mailto:developers@vibing.ai)

Thank you for contributing to the Vibing AI CLI! Your contributions help improve the experience for all developers using our platform. 