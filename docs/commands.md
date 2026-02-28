# Commands Reference

All 33 commands available in VS Code Squad. Access them via the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`).

## Squad Management

| Command | Title | Description |
|---------|-------|-------------|
| `squad.createSquad` | Squad: Create New Squad | Create a squad from a template with full directory scaffold |
| `squad.deleteSquad` | Squad: Delete Squad | Delete a squad and its directory |
| `squad.switchSquad` | Squad: Switch Active Squad | Switch between squads in the workspace |
| `squad.searchSquads` | Squad: Search Across Squads | Search all squads for agents, roles, or keywords |
| `squad.initialize` | Squad: Initialize Team | Initialize from an existing `.squad` directory |
| `squad.browseTemplates` | Squad: Browse Templates | Preview available squad templates |
| `squad.openGettingStarted` | Squad: Getting Started | Open the Getting Started walkthrough |

## Agent Roster

| Command | Title | Description |
|---------|-------|-------------|
| `squad.addMember` | Squad: Add Member | Add a new agent to the active squad |
| `squad.removeMember` | Squad: Remove Member | Remove an agent (moves to alumni archive) |
| `squad.editMember` | Squad: Edit Member | Edit an agent's name, role, or details |
| `squad.openRoster` | Squad: Open Roster | Focus the roster view in the sidebar |
| `squad.refreshRoster` | Squad: Refresh Roster | Reload the roster from disk |
| `squad.openTeamFile` | Squad: Open Team File | Open `team.md` in the editor |

## Agent Actions

| Command | Title | Description |
|---------|-------|-------------|
| `squad.agentActions` | Squad: Agent Actions | Quick action menu for an agent |
| `squad.setAgentStatus` | Squad: Set Agent Status | Change agent status (Active/Working/Idle/Error/Offline) |
| `squad.editCharter` | Squad: Edit Agent Charter | Open or generate an agent's charter file |
| `squad.viewHistory` | Squad: View Agent History | Open an agent's history file |
| `squad.openAgentDetail` | Squad: Open Agent Detail | Open the agent detail webview panel |
| `squad.whoOwns` | Squad: Who Owns This File? | Find which agent owns the current file |

### Agent Actions Menu

When you run `Squad: Agent Actions` or click the actions icon on a roster item, you get:

1. **View Details** → Opens agent detail panel
2. **Edit Charter** → Opens charter.md
3. **View History** → Opens history.md
4. **Send Command** → Enqueue a task
5. **Set Status** → Change agent status
6. **Remove from Squad** → Move to alumni

### Agent Status Options

| Status | Icon | Meaning |
|--------|------|---------|
| Active | $(circle-filled) | Agent is available |
| Working | $(tools) | Agent is processing a task |
| Idle | $(clock) | Agent is paused |
| Error | $(error) | Agent has encountered a problem |
| Offline | $(circle-slash) | Agent is not available |

## Task Queue

| Command | Title | Description |
|---------|-------|-------------|
| `squad.enqueueCommand` | Squad: Enqueue Agent Command | Queue a task for an agent or the entire squad |
| `squad.viewQueue` | Squad: View Command Queue | View all queued, running, and completed tasks |
| `squad.clearQueue` | Squad: Clear Completed Queue Items | Remove completed tasks from the queue |

### Enqueue Flow

1. Select target: **Entire Squad** or a specific agent
2. Type the command/task (e.g., `review src/index.ts`)
3. Task is queued with a unique ID

Task lifecycle: `queued` → `running` → `completed` / `failed`

## Dashboard & Views

| Command | Title | Description |
|---------|-------|-------------|
| `squad.openDashboard` | Squad: Open Dashboard | Open the squad dashboard webview |
| `squad.showHealthScore` | Squad: Show Health Score | Display health metrics in a notification |
| `squad.showStats` | Squad: Show Statistics | Show aggregate statistics |

## Monitoring

| Command | Title | Description |
|---------|-------|-------------|
| `squad.showLogs` | Squad: Show Agent Logs | Open the log output channel |
| `squad.clearLogs` | Squad: Clear Logs | Clear all log entries |
| `squad.filterLogs` | Squad: Filter Logs | Filter logs by agent or level |

## Decisions & Ceremonies

| Command | Title | Description |
|---------|-------|-------------|
| `squad.addDecision` | Squad: Add Decision | Record a team decision |
| `squad.viewDecisions` | Squad: View Decision Timeline | Open `decisions.md` |
| `squad.runCeremony` | Squad: Run Ceremony | Generate ceremony notes (Standup/Retro/Planning/Design Review) |

### Ceremony Types

| Ceremony | Output |
|----------|--------|
| **Standup** | Per-agent: yesterday, today, blockers |
| **Sprint Planning** | Sprint goal + per-agent task assignments |
| **Retrospective** | What went well, improvements, action items |
| **Design Review** | Reviewer, description, per-agent feedback, approval |

Output is saved to `.squad/squads/<name>/ceremonies/<ceremony>-<date>.md`.

## Squad Protocol Files

| Command | Title | Description |
|---------|-------|-------------|
| `squad.openRouting` | Squad: Open Routing Rules | Open `routing.md` |
| `squad.openCeremonies` | Squad: Open Ceremonies | Open `ceremonies.md` |

## Where Commands Appear

### Squad Selector Toolbar
Create Squad, Search, Initialize, Browse Templates, Getting Started (overflow)

### Roster Toolbar
Add Member, Open Dashboard, Refresh + overflow: Open Team File, Health Score, Run Ceremony, Decisions, Add Decision, Routing, Ceremonies

### Roster Context Menu (right-click agent)
Open Detail, Edit, Actions (inline) + Enqueue Command, Show Logs, Set Status, View History, Edit Charter, Remove

### Activity Toolbar
Show Stats, Filter Logs, Clear Logs + overflow: View Queue, Clear Queue

### Editor Context Menu
Who Owns This File?

### Status Bar
Squad name (click to switch), Health score (click for dashboard), Agent actions button
