# Getting Started

This guide walks you through setting up your first AI agent squad in VS Code.

## Prerequisites

- VS Code ^1.96.0
- A workspace folder open

## Step 1: Create Your Squad

Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and run:

```
Squad: Create New Squad
```

You'll be prompted to:

1. **Choose a workspace folder** (if multiple are open)
2. **Pick a template:**
   - **Full-Stack AI Team** — 7 agents for web app development
   - **Code Review Squad** — 5 agents focused on code quality
   - **Solo + Copilot** — Minimal 3-agent team
   - **Full Squad** — 8 specialized agents for complex projects
   - **Empty Squad** — Blank slate, add your own agents
3. **Name your squad** — alphanumeric characters, hyphens, and underscores

The extension creates the full directory structure under `.squad/squads/<your-squad-name>/` with a `team.md` roster, agent charters, routing rules, and ceremony templates.

## Step 2: Explore the Sidebar

Click the **Squad** icon in the Activity Bar (left side). You'll see three panels:

### Squads Panel
Lists all squads in your workspace. The active squad is highlighted. Use the toolbar buttons to:
- **+** Create a new squad
- **Search** across all squads
- **Initialize** from an existing `.squad` directory

### Team Roster Panel
Shows agents in the active squad with their roles and status. Right-click an agent to:
- Open agent detail panel
- Edit the agent's charter
- Send a command
- View history
- Set status
- Remove from squad

### Activity Panel
Real-time log stream of agent events. Filter by level or agent, view the command queue, and check statistics.

## Step 3: Define Agent Charters

Each agent can have a charter — a Markdown file that defines their responsibilities, owned files, and boundaries.

```
Squad: Edit Agent Charter
```

Select an agent. If no charter exists, one is auto-generated based on the agent's role. Charters look like this:

```markdown
# Backend — Backend Dev

## Role
Backend developer responsible for server-side logic, APIs, and data layer.

## Owned Files
- src/server/**
- src/api/**
- src/models/**

## Boundaries
- Do not modify frontend components
- All API changes require Lead review
```

The `## Owned Files` section powers the **Who Owns This File?** feature.

## Step 4: Open the Dashboard

```
Squad: Open Dashboard
```

The dashboard shows:
- **Health score** (0–100) based on agent activity and task completion
- **Agent grid** with status indicators
- **Activity feed** with recent events
- **Command queue** status

## Step 5: Assign Tasks

### From the Command Palette
```
Squad: Enqueue Agent Command
```
Pick a target (individual agent or entire squad) and type the task.

### From the Chat
```
@squad /assign review the authentication module
@squad /assign @backend fix the database connection pooling
```

## Step 6: Use the Chat

Type `@squad` in the VS Code Chat panel to access your squad:

| Command | Example |
|---------|---------|
| `/status` | `@squad /status` |
| `/switch` | `@squad /switch my-squad` |
| `/assign` | `@squad /assign write unit tests` |
| `/agents` | `@squad /agents backend` |
| `/roster` | `@squad /roster` |

## What's Next?

- [Run a ceremony](squad-protocol.md#ceremonies) (standup, retro, sprint planning)
- [Record decisions](squad-protocol.md#decisions) for your team
- [Set up routing rules](squad-protocol.md#routing) to auto-assign files to agents
- [Add more squads](multi-squad.md) to the same workspace
- Browse the [full command reference](commands.md)

## Re-Opening This Guide

If you close the Getting Started walkthrough, you can reopen it:
- Click the **mortar board** icon in the Squads panel overflow menu (`...`)
- Or run: `Squad: Getting Started` from the Command Palette
