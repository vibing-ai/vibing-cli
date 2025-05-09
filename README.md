# Vibing AI CLI

The official command-line interface for developing and managing applications for the Vibing AI Marketplace.

## About Vibing AI

Vibing AI is a platform that enables developers to build, deploy, and monetize AI-powered applications. Our marketplace provides a unified space for creators to share their innovations and for users to discover tools that enhance their AI experience.

## Installation

### NPM Installation
```bash
npm install -g vibing-cli
```

### Binary Installation

You can also download pre-built binaries for your platform from the [releases page](https://github.com/vibing-ai/cli/releases).

#### macOS
```bash
# Using Homebrew
brew install vibing-ai/tap/vibe

# Manual installation
curl -fsSL https://github.com/vibing-ai/cli/releases/latest/download/vibe-macos -o /usr/local/bin/vibe
chmod +x /usr/local/bin/vibe
```

#### Linux
```bash
# Using apt (Debian/Ubuntu)
curl -fsSL https://github.com/vibing-ai/cli/releases/latest/download/vibe-linux -o /usr/local/bin/vibe
chmod +x /usr/local/bin/vibe
```

#### Windows
```powershell
# Using Scoop
scoop bucket add vibing-ai https://github.com/vibing-ai/scoop-bucket.git
scoop install vibe

# Manual installation - download from releases page and add to your PATH
```

## Usage

```bash
# Create a new project
vibe init my-app

# Start the development server
vibe dev

# Validate your project
vibe validate

# Run tests
vibe test

# Build for production
vibe build

# Publish to the Vibing AI marketplace
vibe publish
```

## Project Types

The Vibing AI CLI supports different project types:

- `app` - Full-featured applications with dedicated UIs
- `plugin` - Extensions that enhance platform capabilities
- `agent` - Specialized AI entities for specific domains

## Commands

### `vibe init [name]`

Create a new Vibing AI project.

Options:
- `-t, --type <type>` - Project type (app, plugin, agent) (default: "app")
- `-y, --yes` - Skip prompts and use defaults
- `--template <template>` - Use a specific template
- `-d, --dir <directory>` - Target directory
- `--skip-install` - Skip npm package installation

### `vibe dev`

Start the development server for local testing.

Options:
- `-p, --port <port>` - Port to use (default: "3000")
- `-o, --open` - Open in browser

### `vibe validate`

Validate project for Vibing AI marketplace submission.

Options:
- `--fix` - Automatically fix issues when possible
- `--json` - Output results as JSON

### `vibe test`

Run tests for your Vibing AI project.

Options:
- `--unit` - Run unit tests
- `--integration` - Run integration tests
- `--e2e` - Run end-to-end tests
- `--a11y` - Run accessibility tests
- `--all` - Run all tests
- `--coverage` - Generate coverage report
- `--watch` - Watch for changes
- `--json` - Output results as JSON

### `vibe build`

Build your project for production deployment.

Options:
- `--clean` - Clean before building
- `--production` - Build for production (default: true)

### `vibe publish`

Publish your project to the Vibing AI marketplace.

Options:
- `--skip-validation` - Skip validation checks
- `--dry-run` - Simulate publishing without actually submitting

## For Developers

If you're contributing to the CLI itself, here are some useful development commands:

```bash
# Install dependencies
npm install

# Build the TypeScript source
npm run build

# Run tests
npm test

# Bundle into standalone binaries
npm run bundle        # For current platform
npm run bundle:all    # For all platforms
```

## Resources

- [Vibing AI Website](https://vibing.ai)
- [Developer Documentation](https://docs.vibing.ai)
- [API Reference](https://api.vibing.ai)
- [Community Forums](https://community.vibing.ai)

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 