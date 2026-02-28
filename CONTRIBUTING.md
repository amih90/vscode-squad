# Contributing to VS Code Squad

Thanks for considering contributing to VS Code Squad! Every contribution helps make AI agent team management better for everyone.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/<your-username>/vscode-squad.git
   cd vscode-squad
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Compile:**
   ```bash
   npm run compile
   ```
5. **Run** the extension in development mode:
   - Open the project in VS Code
   - Press `F5` to launch the Extension Development Host

## Development Workflow

### Project Structure

```
src/
├── extension.ts          # Extension entry point
├── commands/             # All 33 registered commands
├── core/                 # EventBus, types, registry
├── monitoring/           # Log store, stats, command queue
├── team/                 # Parser, serializer, team state
├── utils/                # Logger, error handling
├── views/                # Tree data providers (sidebar)
└── webview/              # Dashboard & agent detail panels
media/                    # Icons, webview HTML/CSS/JS
```

### Build & Test

```bash
npm run compile          # Compile TypeScript
npm run watch            # Compile in watch mode
npm run lint             # Run ESLint
npm run test             # Run tests
```

### Code Style

- **TypeScript** — strict mode enabled
- **No external runtime dependencies** — the extension runs on VS Code APIs only
- Keep things simple. Avoid over-engineering.

## How to Contribute

### Reporting Bugs

Open an [issue](https://github.com/amih90/vscode-squad/issues/new?template=bug_report.md) with:
- Steps to reproduce
- Expected vs. actual behavior
- VS Code version and OS

### Suggesting Features

Open an [issue](https://github.com/amih90/vscode-squad/issues/new?template=feature_request.md) describing:
- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

### Submitting Pull Requests

1. Create a branch from `main`:
   ```bash
   git checkout -b feature/my-feature
   ```
2. Make your changes — keep commits focused and descriptive
3. Run `npm run compile` to verify no TypeScript errors
4. Push and open a PR against `main`

**PR guidelines:**
- Reference any related issues (`Fixes #123`)
- Keep PRs focused — one feature or fix per PR
- Add a clear description of what changed and why

## First-Time Contributors

Look for issues labeled [`good first issue`](https://github.com/amih90/vscode-squad/labels/good%20first%20issue) — these are scoped, well-described tasks ideal for getting started.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
