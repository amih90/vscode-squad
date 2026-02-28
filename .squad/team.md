# Team Roster

> VS Code extension for Squad team setup and management with a Squad Desktop style UI.

## Coordinator

| Name | Role | Notes |
|------|------|-------|
| Squad | Coordinator | Routes work, enforces handoffs and reviewer gates. Does not generate domain artifacts. |

## Members

| Name | Role | Charter | Status |
|------|------|---------|--------|
| Neo | Lead / Architect | `.squad/agents/neo/charter.md` | ✅ Active |
| Trinity | Frontend Dev | `.squad/agents/trinity/charter.md` | ✅ Active |
| Morpheus | Backend / Integration Dev | `.squad/agents/morpheus/charter.md` | ✅ Active |
| Switch | Tester / Reviewer | `.squad/agents/switch/charter.md` | ✅ Active |
| Tank | VS Code Extension Dev | `.squad/agents/tank/charter.md` | ✅ Active |
| Scribe | Session Logger | `.squad/agents/scribe/charter.md` | 📋 Silent |
| Ralph | Work Monitor | — | 🔄 Monitor |

## Coding Agent

<!-- copilot-auto-assign: false -->

| Name | Role | Charter | Status |
|------|------|---------|--------|
| @copilot | Coding Agent | — | 🤖 Coding Agent |

### Capabilities

**🟢 Good fit — auto-route when enabled:**
- Bug fixes with clear reproduction steps
- Test coverage (adding missing tests, fixing flaky tests)
- Lint/format fixes and code style cleanup
- Dependency updates and version bumps
- Small isolated features with clear specs
- Boilerplate/scaffolding generation
- Documentation fixes and README updates

**🟡 Needs review — route to @copilot but flag for squad member PR review:**
- Medium features with clear specs and acceptance criteria
- Refactoring with existing test coverage
- API endpoint additions following established patterns
- Migration scripts with well-defined schemas

**🔴 Not suitable — route to squad member instead:**
- Architecture decisions and system design
- Multi-system integration requiring coordination
- Ambiguous requirements needing clarification
- Security-critical changes (auth, encryption, access control)
- Performance-critical paths requiring benchmarking
- Changes requiring cross-team discussion

## Project Context

- **Owner:** Ami Hollander
- **Stack:** TypeScript/JavaScript, VS Code Extension API, Node.js, HTML/CSS UI
- **Description:** Build a VS Code extension that lets users set up and manage Squad teams per repository with a desktop-like monitoring UI.
- **Created:** 2026-02-27T00:00:00Z
