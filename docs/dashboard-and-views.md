# Dashboard & Views

VS Code Squad provides a rich set of visual panels for monitoring and interacting with your AI agent squad.

## Sidebar Panels

The Squad activity bar (left side) contains three panels:

### Squads (Squad Selector)

Lists every squad in the workspace. The active squad is highlighted with a ★ star icon and an `(active)` label. Each entry shows the agent count.

- **Click a squad** to switch to it
- **Right-click** for context menu actions (Delete Squad, Open Team File)
- **Overflow menu** (top-right `⋯`) has:
  - Create New Squad
  - Search Across Squads
  - Getting Started walkthrough
  - View Decisions

When no squad exists, a **welcome view** is shown with "Create your first squad" and "Getting Started" buttons.

### Team Roster

Shows the active squad's members organized into three collapsible sections:

| Section | Contents |
|---------|----------|
| **Coordinator** | The squad coordinator agent |
| **Members** | All regular member agents |
| **Coding Agent** | The designated coding agent |

Each agent row displays:
- Emoji icon + name (e.g. `🎯 Designer`)
- Current status as description (`idle`, `busy`, `error`)
- Role in the tooltip

**Right-click any agent** to access:
- Edit Member
- Remove Member
- Enqueue Command
- Edit Charter
- Open Agent Detail
- View History

Use the toolbar buttons at the top:
- **Add Member** — add a new agent to the roster
- **Refresh** — reload from disk

### Activity

A chronological feed of recent events across the squad, mixing:
- **Log entries** — tagged with level icons (info, warning, error, debug)
- **Queued commands** — tagged with status icons (clock, spinning, check, x)

Activity items are sorted newest-first and limited to the 50 most recent entries.

## Dashboard (Webview)

Open with `Squad: Open Dashboard` or `Ctrl/Cmd+Shift+P → Squad: Open Dashboard`.

The dashboard is a full webview panel showing:

### Squad Overview
- Squad name and path
- Health score gauge
- Agent count and status summary

### Agent Cards
Each agent gets a card showing:
- Name, role, emoji
- Current status with color indicator
- Statistics (tasks completed, errors, uptime)
- Click to open Agent Detail

### Log Feed
- Live-updating log stream
- Filter by agent or severity level
- Clear logs button

### Command Queue
- Pending, running, and completed tasks
- Enqueue new commands directly from the dashboard

### Real-Time Updates
The dashboard listens to events and updates automatically:
- New log entries appear instantly
- Agent status changes reflect immediately
- Statistics refresh on updates
- Theme changes apply without reload

## Agent Detail (Webview)

Open by clicking an agent in the roster or running `Squad: Open Agent Detail`.

Each agent gets its own panel (multiple can be open simultaneously). The panel shows:

### Agent Profile
- Name, role, emoji, current status
- Full statistics from the stats engine

### Agent Logs
- Filtered to only this agent's entries
- Switchable severity levels
- Clear agent-specific logs

### Charter
- Displays the contents of `agents/<name>/charter.md`
- The agent's mission statement and operating rules

### History
- Displays the contents of `agents/<name>/history.md`
- Record of past tasks and decisions

### Command Queue
- Tasks queued specifically for this agent
- Current task status

### Actions
- Run Command, Edit Charter, Edit Member, Remove Member
- Available via the webview message bridge

## Status Bar

Three status bar items appear on the left side when a squad is active:

| Item | Display | Click Action |
|------|---------|--------------|
| **Squad Name** | `$(people) Squad Name` | Opens squad picker |
| **Health Score** | `$(pass) 85` or `$(warning) 50` or `$(error) 20` | Shows health details |
| **Actions** | Quick actions button | Opens action menu |

Health score thresholds:
- **80+** → green pass icon
- **50–79** → yellow warning icon
- **Below 50** → red error icon

When no squad is active, all three items are hidden.

## Tips

- **Pin the dashboard** to a side editor group for always-visible monitoring
- **Open multiple agent detail** panels side-by-side for comparing agents
- The dashboard and agent detail panels survive VS Code window reloads
- Use `Squad: Refresh Roster` if the sidebar doesn't pick up external file changes
