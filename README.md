# Vibing CLI

A comprehensive CLI tool for developing applications for the AI Marketplace.

## Installation

```bash
npm install -g vibing-cli
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

# Publish to the marketplace
vibe publish
```

## Project Types

The CLI supports different project types:

- `app` - Full-featured applications with dedicated UIs
- `plugin` - Extensions that enhance platform capabilities
- `agent` - Specialized AI entities for specific domains

## Commands

### `vibe init [name]`

Create a new project.

Options:
- `-t, --type <type>` - Project type (app, plugin, agent) (default: "app")
- `-y, --yes` - Skip prompts and use defaults
- `--template <template>` - Use a specific template

### `vibe dev`

Start the development server.

Options:
- `-p, --port <port>` - Port to use (default: "3000")
- `-o, --open` - Open in browser

### `vibe validate`

Validate project for marketplace submission.

Options:
- `--fix` - Automatically fix issues when possible
- `--json` - Output results as JSON

### `vibe test`

Run tests.

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

Build for production.

Options:
- `--clean` - Clean before building
- `--production` - Build for production (default: true)

### `vibe publish`

Publish to the marketplace.

Options:
- `--skip-validation` - Skip validation checks
- `--dry-run` - Simulate publishing without actually submitting

## License

MIT 