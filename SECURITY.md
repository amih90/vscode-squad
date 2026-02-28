# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in VS Code Squad, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email:  
📧 **amih90@github.com**

Include:
- A description of the vulnerability
- Steps to reproduce (if applicable)
- Your assessment of the impact
- Any suggested fixes

### What to Expect

1. **Acknowledgment** — We'll acknowledge receipt within 48 hours
2. **Investigation** — We'll investigate and determine the impact
3. **Fix timeline** — For confirmed issues, we'll work on a fix and coordinate disclosure
4. **Credit** — We'll credit you in the release notes (unless you prefer to remain anonymous)

## Scope

This security policy applies to the VS Code Squad extension source code in this repository.

For vulnerabilities in VS Code itself, please report to [Microsoft's security team](https://msrc.microsoft.com/create-report).

## Security Best Practices

VS Code Squad is designed with security in mind:

- **No network calls** — The extension operates entirely locally
- **No external dependencies** — Zero runtime dependencies beyond VS Code APIs
- **File-system only** — All data is stored in human-readable Markdown files in your workspace
- **No telemetry** — We don't collect any usage data

Thank you for helping keep VS Code Squad secure!
