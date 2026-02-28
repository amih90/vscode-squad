# VS Code Squad

> Manage AI agent teams directly from VS Code. Define roles, assign tasks, track decisions, and run ceremonies — all from a human-readable Markdown protocol.

![VS Code](https://img.shields.io/badge/VS%20Code-%5E1.96.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)

## What is Squad?

Squad turns your VS Code workspace into a command center for AI agent teams. Each squad lives in a `.squad/` directory as plain Markdown files — no databases, no servers, no lock-in. You define agents, their roles, and what they own. Squad handles the rest: dashboards, health scores, task queues, ceremonies, and cross-squad search.

**Key principles:**
- **File-first** — Everything is Markdown. `team.md`, `charter.md`, `decisions.md`, `routing.md`. Version control friendly.
- **Multi-squad** — Run multiple squads in a single workspace, each with its own roster and protocol.
- **Chat-native** — Use `@squad` in the VS Code chat to switch squads, assign tasks, and query agents.
- **Zero config** — Create a squad from a template and start working immediately.

## Quick Start

1. **Install** the extension
2. **Open the Command Palette** → `Squad: Create New Squad`
3. **Pick a template** (Full-Stack, Code Review, Solo + Copilot, Full Squad, or Empty)
4. Your squad is ready — check the **Squad** panel in the Activity Bar

Or in chat: `@squad /status`

## Features

### Squad Management
- **Create squads** from 5 built-in templates with pre-configured agents and charters
- **Multiple squads** per workspace — switch between them instantly
- **Search across squads** for agents, roles, and skills
- **Delete squads** when they're no longer needed

### Agent Roster
- **Add/remove/edit** agents with roles, charters, and status
- **Agent charters** — auto-generated role-specific Markdown files defining scope, owned files, and boundaries
- **Status tracking** — Active, Working, Idle, Error, Offline
- **Alumni archive** — removed agents are preserved, not deleted
- **Who Owns This File?** — right-click any file to find the responsible agent

### Task Queue
- **Enqueue commands** for individual agents or the entire squad
- **Track status** — queued → running → completed / failed
- **View and clear** the command queue from the Activity panel

### Decisions & Ceremonies
- **Record decisions** with author, reasoning, and timestamps
- **Run ceremonies** — Standup, Sprint Planning, Retrospective, Design Review
- **Generated ceremony notes** with per-agent sections, saved as dated Markdown files

### Dashboard & Views
- **Squad Dashboard** — webview panel with health score, agent grid, activity feed
- **Agent Detail** — deep-dive into any agent's charter, stats, and task queue
- **Activity panel** — real-time log stream with filtering
- **Status bar** — squad name, health score, quick actions

### Chat Participant (`@squad`)
- `/status` — squad overview with health and agent table
- `/switch [name]` — switch active squad
- `/assign [task]` — assign to whole squad or `@agent`
- `/roster` — detailed roster view
- `/agents [name]` — list agents or drill into one

### Squad Protocol Files
- **`routing.md`** — file pattern → agent routing rules
- **`ceremonies.md`** — ceremony templates and schedules
- **`decisions.md`** — shared decision log

## Squad Directory Structure

```
.squad/
└── squads/
    └── my-squad/
        ├── team.md               # Agent roster (Markdown table)
        ├── decisions.md          # Decision log
        ├── ceremonies.md         # Ceremony templates
        ├── routing.md            # Task routing rules
        ├── agents/
        │   ├── lead/
        │   │   ├── charter.md    # Role, scope, owned files
        │   │   └── history.md    # Session learnings
        │   ├── backend/
        │   │   ├── charter.md
        │   │   └── history.md
        │   └── _alumni/          # Archived agents
        ├── decisions/
        │   └── inbox/            # Agent decision drops
        ├── casting/              # Identity policy & registry
        ├── log/                  # Session archives
        ├── orchestration-log/    # Spawn & execution records
        ├── ceremonies/           # Generated ceremony notes
        └── skills/               # (reserved)
```

## Templates

| Template | Agents | Best For |
|----------|--------|----------|
| **Full-Stack AI Team** | Lead, Backend, Frontend, Tester, Scribe, Ralph, @copilot | Web applications |
| **Code Review Squad** | Lead, Security, Tester, Scribe, @copilot | Code quality pipelines |
| **Solo + Copilot** | Lead, Scribe, @copilot | Individual developers |
| **Full Squad** | Lead, Backend, Frontend, Tester, Designer, Architect, Scribe, Ralph | Complex projects |
| **Empty Squad** | (none) | Custom setup |

## Commands

33 commands available — see [docs/commands.md](docs/commands.md) for the full reference.

**Most used:**
| Command | Description |
|---------|-------------|
| `Squad: Create New Squad` | Create from template |
| `Squad: Switch Active Squad` | Switch between squads |
| `Squad: Add Member` | Add an agent |
| `Squad: Enqueue Agent Command` | Assign a task |
| `Squad: Open Dashboard` | Open squad dashboard |
| `Squad: Run Ceremony` | Run standup/retro/planning |
| `Squad: Who Owns This File?` | Find the owning agent |
| `Squad: Getting Started` | Open the walkthrough |

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `squad.logBufferSize` | `1000` | Max log entries in memory |
| `squad.autoOpenDashboard` | `false` | Auto-open dashboard on squad detection |
| `squad.notifications.enabled` | `true` | Show agent event notifications |
| `squad.notifications.errors` | `true` | Show agent error notifications |
| `squad.healthScore.enabled` | `true` | Show health score in status bar |

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](docs/getting-started.md) | First-time setup and walkthrough |
| [Commands Reference](docs/commands.md) | All 33 commands with usage |
| [Chat Participant](docs/chat-participant.md) | Using `@squad` in VS Code Chat |
| [Multi-Squad Workflow](docs/multi-squad.md) | Running multiple squads |
| [Dashboard & Views](docs/dashboard-and-views.md) | UI panels and sidebar |
| [Squad Protocol](docs/squad-protocol.md) | File format and directory structure |

## Requirements

- VS Code ^1.96.0
- No additional dependencies

## License

See [LICENSE](LICENSE) for details.
