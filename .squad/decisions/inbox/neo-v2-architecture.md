# VS Code Squad v2 — Architecture Design

**Author:** Neo (Lead / Architect)
**Date:** 2026-02-28
**Requested by:** Ami Hollander
**Status:** PROPOSED — awaiting team review

---

## 1. Feature Manifest

### P0 — Must-Have (v2.0 Release Gate)

| # | Feature | Category | Description |
|---|---------|----------|-------------|
| F01 | **Agent Monitoring Dashboard** | Monitoring | Webview panel with agent cards, status badges (IDLE/WORKING/DONE/ERROR), live output streams |
| F02 | **Activity Log Terminal** | Monitoring | Terminal-style log view with timestamped, color-coded entries; filterable by agent/severity |
| F03 | **Command Queue View** | Monitoring | Visual queue showing pending/active/completed commands per agent with enqueue/dequeue events |
| F04 | **Agent Statistics Panel** | Statistics | Tasks completed, errors, time-in-status, utilization % per agent and aggregate |
| F05 | **Multi-Squad Workspace Support** | Multi-Squad | Detect `.squad/` in all workspace folders; unified squad picker in sidebar |
| F06 | **Squad Switcher** | Multi-Squad | Quick-pick or tree view node to switch active squad context |
| F07 | **Unified Dashboard** | Multi-Squad | Single webview showing all squads, their members, statuses side-by-side |

### P1 — High Value (v2.1)

| # | Feature | Category | Description |
|---|---------|----------|-------------|
| F08 | **Decision Timeline** | Insights | Chronological view of `.squad/decisions.md` entries with search/filter |
| F09 | **Agent History Viewer** | Insights | Read-only webview rendering agent `history.md` with collapsible sessions |
| F10 | **Squad Health Score** | Insights | Computed metric: decision velocity, error rate, agent utilization, staleness |
| F11 | **Quick Actions Status Bar** | UX | Status bar item showing active squad name, agent count, click for quick actions |
| F12 | **Smart Notifications** | UX | Toast notifications for agent errors, reviewer rejections, completed milestones |
| F13 | **Git Integration** | Automation | Show git branches per agent, link PRs to agent work, branch status in dashboard |
| F14 | **Ceremony Scheduler** | Automation | UI to trigger ceremonies from `ceremonies.md`; countdown to next auto-ceremony |
| F15 | **Agent Charter Editor** | Editing | Custom editor provider for `charter.md` files with structured form + preview |
| F16 | **Initialize Wizard** | Onboarding | Multi-step webview wizard for `squad.initialize` (team name, members, universe) |
| F17 | **Cross-Squad Search** | Multi-Squad | Search members, decisions, logs across all workspace squads |

### P2 — Nice-to-Have (v2.2+)

| # | Feature | Category | Description |
|---|---------|----------|-------------|
| F18 | **Export/Share Reports** | Reporting | Export squad stats, decision log, agent history as Markdown/HTML/PDF |
| F19 | **Agent Dependency Graph** | Visualization | Mermaid-rendered graph showing which agents depend on each other's outputs |
| F20 | **Template Gallery** | Onboarding | Browse and apply pre-built team templates (web app, API, ML pipeline) |
| F21 | **Diff Viewer for Decisions** | Insights | Side-by-side diff of decision changes over time (git-backed) |
| F22 | **Plugin/Skill Browser** | Extensibility | Browse `.squad/skills/` and marketplace plugins with install UI |
| F23 | **Ralph Board View** | Automation | Kanban-style board showing Ralph's work queue (untriaged → in progress → done) |
| F24 | **Keyboard Shortcuts** | UX | Configurable keybindings for all squad commands |
| F25 | **Theme Sync** | UX | Dashboard auto-inherits VS Code color theme (light/dark/high-contrast) |
| F26 | **Workspace Recommendations** | Insights | Suggest team composition changes based on file types and project structure |
| F27 | **Inline Annotations** | UX | FileDecorationProvider showing which agent last modified each file |

---

## 2. Architecture Design

### 2.1 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    VS Code Extension Host                    │
│                                                             │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │ Commands  │  │ Tree Views   │  │ Status Bar Items   │    │
│  │ (25+)     │  │ (3 providers)│  │ (2 items)          │    │
│  └─────┬─────┘  └──────┬───────┘  └────────┬───────────┘    │
│        │               │                    │               │
│  ┌─────▼───────────────▼────────────────────▼──────────┐    │
│  │              State Management Layer                  │    │
│  │  ┌─────────────┐  ┌────────────┐  ┌──────────────┐  │    │
│  │  │ SquadStore  │  │ LogStore   │  │ StatsEngine  │  │    │
│  │  │ (per squad) │  │ (ring buf) │  │ (aggregator) │  │    │
│  │  └──────┬──────┘  └─────┬──────┘  └──────┬───────┘  │    │
│  │         │               │                │          │    │
│  │  ┌──────▼───────────────▼────────────────▼──────┐   │    │
│  │  │           EventBus (typed events)             │   │    │
│  │  └──────────────────┬───────────────────────────┘   │    │
│  └─────────────────────┼───────────────────────────────┘    │
│                        │                                    │
│  ┌─────────────────────▼───────────────────────────────┐    │
│  │              I/O Layer                               │    │
│  │  ┌───────────┐  ┌────────────┐  ┌────────────────┐  │    │
│  │  │FileWatcher│  │Git Monitor │  │Process Monitor │  │    │
│  │  │(.squad/*) │  │(branches)  │  │(agent procs)   │  │    │
│  │  └───────────┘  └────────────┘  └────────────────┘  │    │
│  └──────────────────────────────────────────────────────┘    │
│                        │                                    │
│  ┌─────────────────────▼───────────────────────────────┐    │
│  │         Webview Communication Bridge                  │    │
│  │   postMessage()  ←→  acquireVsCodeApi().postMessage() │    │
│  └─────────────────────┬───────────────────────────────┘    │
│                        │                                    │
│  ┌─────────────────────▼───────────────────────────────┐    │
│  │              Webview Panels                          │    │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐   │    │
│  │  │ Dashboard  │  │  Agent     │  │  Initialize  │   │    │
│  │  │ (main)     │  │  Detail    │  │  Wizard      │   │    │
│  │  └────────────┘  └────────────┘  └──────────────┘   │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Multi-Squad Architecture

Multi-root workspace support is the foundation. Each workspace folder may contain its own `.squad/` directory, making it an independent "squad context."

```
Workspace
├── /project-alpha/.squad/    →  SquadContext("alpha")
├── /project-beta/.squad/     →  SquadContext("beta")
└── /project-gamma/           →  (no squad)

SquadRegistry
├── contexts: Map<workspaceFolderUri, SquadContext>
├── activeContext: SquadContext | null
├── onContextChanged: Event<SquadContext>
└── scanWorkspace(): void   // Discovers all .squad/ directories
```

The `SquadRegistry` is the singleton that manages all squad contexts. Every feature that touches squad state goes through the registry to resolve the active context. The tree view, dashboard, and commands all query the registry for the current squad.

### 2.3 State Management Pattern

**Event-driven, unidirectional data flow:**

```
Disk (.squad/*) → FileWatcher → Parser → SquadStore → EventBus → UI (Tree/Webview/StatusBar)
                                                  ↑
User Action → Command Handler → Serializer → Disk write (triggers cycle)
```

All state changes go through disk → FileWatcher round-trip to ensure consistency. Never update in-memory state directly from a command; always write-then-read. This means external edits (git pull, manual file edit, agent writes) and extension edits share the same codepath.

### 2.4 Webview Strategy

**Use `vscode.WebviewPanel`** for rich dashboard and detail views. The webview runs in an iframe sandbox — it cannot access the extension host directly. All communication is via `postMessage()`.

**Why webview over tree views for monitoring:** Tree views are great for hierarchical navigation but cannot render charts, live-streaming logs, status badges with animations, or tabbed interfaces. The monitoring dashboard requires all of these.

**Webview lifecycle:** Panels serialize their state via `getState()`/`setState()`. When a user closes and reopens the dashboard, it restores from serialized state instead of doing a full re-fetch.

**Content Security Policy:** All webview HTML includes a strict CSP. No inline scripts, no external resources. Styles and scripts are bundled as local extension resources.

---

## 3. Data Model

```typescript
// ─── Core Types ─────────────────────────────────────────────

/** Identifies which squad context we're operating in */
interface SquadContext {
  id: string;                          // Stable hash of workspaceFolderUri
  name: string;                        // Derived from team.md or folder name
  workspaceFolder: vscode.WorkspaceFolder;
  squadRoot: string;                   // Absolute path to .squad/
  teamState: TeamState;                // Parsed roster
  isActive: boolean;                   // Currently selected squad
}

/** Extended member with runtime monitoring state */
interface AgentRuntime extends Member {
  id: string;                          // Stable identifier (name-based hash)
  status: AgentStatus;
  currentTask: string | null;
  lastActivity: number;                // Unix timestamp
  outputBuffer: RingBuffer<LogEntry>;  // Last N output lines
  commandQueue: CommandQueueItem[];
  statistics: AgentStatistics;
  branchName: string | null;           // Current git branch if known
  processId: number | null;            // PID if agent is a running process
}

type AgentStatus = 'IDLE' | 'WORKING' | 'DONE' | 'ERROR' | 'OFFLINE';

// ─── Logging ────────────────────────────────────────────────

interface LogEntry {
  id: string;                          // UUID
  timestamp: number;
  agentId: string;
  agentName: string;
  agentEmoji: string;
  message: string;
  level: LogLevel;
  source: LogSource;
  metadata?: Record<string, unknown>;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';
type LogSource = 'agent-output' | 'file-change' | 'git-event' | 'command' | 'system';

// ─── Command Queue ──────────────────────────────────────────

interface CommandQueueItem {
  id: string;
  agentId: string;
  command: string;
  status: CommandStatus;
  enqueuedAt: number;
  startedAt: number | null;
  completedAt: number | null;
  result: string | null;
  error: string | null;
}

type CommandStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

// ─── Statistics ─────────────────────────────────────────────

interface AgentStatistics {
  tasksCompleted: number;
  tasksFailed: number;
  totalTimeWorking: number;            // Milliseconds
  totalTimeIdle: number;
  avgTaskDuration: number;
  errorRate: number;                   // 0-1
  lastTaskAt: number | null;
  statusHistory: StatusTransition[];   // For utilization charts
}

interface StatusTransition {
  from: AgentStatus;
  to: AgentStatus;
  at: number;
}

interface SquadStatistics {
  squadId: string;
  totalTasks: number;
  totalErrors: number;
  activeAgents: number;
  avgUtilization: number;              // 0-1
  decisionsCount: number;
  lastActivity: number;
  healthScore: number;                 // 0-100
}

// ─── Multi-Squad ────────────────────────────────────────────

interface SquadRegistryState {
  contexts: SquadContext[];
  activeContextId: string | null;
}

// ─── Decision Timeline ─────────────────────────────────────

interface DecisionEntry {
  date: string;
  content: string;
  agents: string[];                    // Mentioned agents
  tags: string[];                      // Auto-extracted: architecture, scope, tech
}

// ─── Git Integration ────────────────────────────────────────

interface AgentGitState {
  agentId: string;
  branches: string[];                  // Branches containing agent name
  activePRs: PRSummary[];
  recentCommits: CommitSummary[];
}

interface PRSummary {
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  reviewDecision: string | null;
}

interface CommitSummary {
  sha: string;
  message: string;
  date: number;
}

// ─── Webview Messaging Protocol ─────────────────────────────

/** Extension Host → Webview */
type HostToWebviewMessage =
  | { type: 'state-update'; payload: DashboardState }
  | { type: 'log-entry'; payload: LogEntry }
  | { type: 'agent-status'; payload: { agentId: string; status: AgentStatus; output: string[] } }
  | { type: 'queue-update'; payload: { agentId: string; item: CommandQueueItem } }
  | { type: 'stats-update'; payload: AgentStatistics | SquadStatistics }
  | { type: 'squad-switched'; payload: SquadContext }
  | { type: 'theme-changed'; payload: { kind: 'light' | 'dark' | 'high-contrast' } };

/** Webview → Extension Host */
type WebviewToHostMessage =
  | { type: 'ready' }
  | { type: 'enqueue-command'; payload: { agentId: string; command: string } }
  | { type: 'switch-squad'; payload: { squadId: string } }
  | { type: 'open-file'; payload: { filePath: string } }
  | { type: 'open-agent-detail'; payload: { agentId: string } }
  | { type: 'run-ceremony'; payload: { ceremonyName: string } }
  | { type: 'refresh' }
  | { type: 'filter-logs'; payload: { agentId?: string; level?: LogLevel } }
  | { type: 'export-stats'; payload: { format: 'markdown' | 'json' } };

/** Full dashboard state snapshot sent on init and major changes */
interface DashboardState {
  squads: SquadContext[];
  activeSquadId: string | null;
  agents: AgentRuntime[];
  recentLogs: LogEntry[];
  squadStats: SquadStatistics;
  agentStats: Record<string, AgentStatistics>;
  commandQueues: Record<string, CommandQueueItem[]>;
}

// ─── Internal Utilities ─────────────────────────────────────

/** Fixed-size circular buffer for log entries and output lines */
class RingBuffer<T> {
  private buffer: T[];
  private head: number = 0;
  private count: number = 0;
  
  constructor(private capacity: number) {
    this.buffer = new Array(capacity);
  }
  
  push(item: T): void {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    if (this.count < this.capacity) this.count++;
  }
  
  toArray(): T[] {
    if (this.count < this.capacity) return this.buffer.slice(0, this.count);
    return [...this.buffer.slice(this.head), ...this.buffer.slice(0, this.head)];
  }
  
  get length(): number { return this.count; }
}
```

---

## 4. View Architecture

### 4.1 Tree Views (Sidebar)

```
Squad Explorer (Activity Bar)
├── 🏠 Squad Selector              ← SquadSelectorProvider (new)
│   ├── ✅ project-alpha (active)
│   ├── ○  project-beta
│   └── ○  project-gamma
│
├── 👥 Team Roster                  ← TeamRosterProvider (enhanced)
│   ├── Coordinator
│   │   └── Squad — Coordinator
│   ├── Members
│   │   ├── Neo — Lead / Architect ✅
│   │   ├── Tank — Extension Dev 🔧
│   │   └── Trinity — Frontend Dev ⚛️
│   └── Coding Agent
│       └── @copilot — Coding Agent 🤖
│
└── 📊 Activity                     ← ActivityProvider (new)
    ├── Recent Decisions (3)
    │   ├── Architecture v2 approved
    │   ├── Use webview for dashboard
    │   └── Multi-root support required
    └── Recent Logs (5)
        ├── Neo: Design complete
        ├── Tank: Build succeeded
        └── ...
```

**Three tree view providers** registered under the `squadExplorer` view container:
1. `SquadSelectorProvider` — multi-squad navigation (P0)
2. `TeamRosterProvider` — enhanced existing provider with status indicators (existing, enhanced)
3. `ActivityProvider` — recent decisions and logs for quick glance (P1)

### 4.2 Webview Panels

| Panel | ID | Trigger | Content |
|-------|----|---------|---------|
| **Dashboard** | `squad.dashboard` | Command / Activity Bar button | Main monitoring view: agent cards + log terminal + command queue + stats (3-column layout inspired by Squad Desktop) |
| **Agent Detail** | `squad.agentDetail` | Click agent in tree or dashboard | Full-page view of single agent: charter, history, output log, stats, git branches/PRs |
| **Initialize Wizard** | `squad.initWizard` | `squad.initialize` command | Multi-step wizard: project scan → team proposal → universe selection → confirm |

All webview panels:
- Use `ViewColumn.One` (dashboard), `ViewColumn.Beside` (agent detail)
- Implement `WebviewPanelSerializer` for restore-on-reopen
- Include a strict `Content-Security-Policy` meta tag
- Load CSS/JS from extension's `media/` directory via `webview.asWebviewUri()`
- Respect `vscode.window.activeColorTheme` and listen to `onDidChangeActiveColorTheme`

### 4.3 Status Bar Items

| Item | Position | Content | Click Action |
|------|----------|---------|-------------|
| **Squad Name** | Left, priority 100 | `$(people) Alpha Squad · 5 agents` | Open squad switcher quick pick |
| **Squad Health** | Left, priority 99 | `$(pulse) 92%` or `$(warning) 3 errors` | Open dashboard |

### 4.4 Other VS Code Integration Points

| API | Usage |
|-----|-------|
| `OutputChannel` | `Squad` output channel for extension-level debug logs (not agent logs) |
| `FileDecorationProvider` | P2: Show agent emoji overlay on files they last modified |
| `CustomTextEditorProvider` | P1: Structured editor for `charter.md` files |
| `DiagnosticCollection` | Surface agent errors as VS Code diagnostics in the Problems panel |

---

## 5. Command Surface

### New Commands (18 total new + 7 existing = 25)

#### Monitoring (P0)
| Command ID | Title | UI Trigger |
|-----------|-------|------------|
| `squad.openDashboard` | Squad: Open Dashboard | Activity bar button, command palette |
| `squad.openAgentDetail` | Squad: View Agent Details | Tree item context menu, dashboard click |
| `squad.showLogs` | Squad: Show Activity Logs | Command palette |
| `squad.clearLogs` | Squad: Clear Logs | Dashboard button |
| `squad.filterLogs` | Squad: Filter Logs | Dashboard filter controls |

#### Command Queue (P0)
| Command ID | Title | UI Trigger |
|-----------|-------|------------|
| `squad.enqueueCommand` | Squad: Send Command to Agent | Dashboard input, command palette |
| `squad.cancelCommand` | Squad: Cancel Queued Command | Queue item context menu |
| `squad.retryCommand` | Squad: Retry Failed Command | Queue item context menu |

#### Multi-Squad (P0)
| Command ID | Title | UI Trigger |
|-----------|-------|------------|
| `squad.switchSquad` | Squad: Switch Active Squad | Status bar click, command palette quick pick |
| `squad.createSquad` | Squad: Create New Squad | Command palette, tree view |
| `squad.removeSquad` | Squad: Remove Squad from Workspace | Tree view context menu |

#### Insights (P1)
| Command ID | Title | UI Trigger |
|-----------|-------|------------|
| `squad.showDecisionTimeline` | Squad: Show Decision Timeline | Dashboard tab, command palette |
| `squad.showStatistics` | Squad: Show Statistics | Dashboard tab |
| `squad.showHealthReport` | Squad: Health Report | Status bar click |

#### Automation (P1)
| Command ID | Title | UI Trigger |
|-----------|-------|------------|
| `squad.runCeremony` | Squad: Run Ceremony | Command palette, dashboard |
| `squad.showGitActivity` | Squad: Show Git Activity | Dashboard tab |

#### Onboarding (P1)
| Command ID | Title | UI Trigger |
|-----------|-------|------------|
| `squad.initializeWizard` | Squad: Initialize (Wizard) | Command palette (replaces basic `squad.initialize`) |

#### Search (P1)
| Command ID | Title | UI Trigger |
|-----------|-------|------------|
| `squad.search` | Squad: Search Across Squads | Command palette |

### Context Menu Contributions

```jsonc
{
  "menus": {
    "view/item/context": [
      { "command": "squad.openAgentDetail", "when": "view == squad.rosterView && viewItem == member" },
      { "command": "squad.removeMember",    "when": "view == squad.rosterView && viewItem == member" },
      { "command": "squad.editMember",      "when": "view == squad.rosterView && viewItem == member" },
      { "command": "squad.removeSquad",     "when": "view == squad.squadSelector && viewItem == squad" },
      { "command": "squad.switchSquad",     "when": "view == squad.squadSelector && viewItem == squad" }
    ],
    "view/title": [
      { "command": "squad.openDashboard",  "when": "view == squad.rosterView", "group": "navigation" },
      { "command": "squad.refreshRoster",  "when": "view == squad.rosterView", "group": "navigation" },
      { "command": "squad.addMember",      "when": "view == squad.rosterView", "group": "navigation" }
    ]
  }
}
```

---

## 6. Communication Protocol

### 6.1 Extension Host ↔ Webview Messaging

**Pattern:** Typed message passing via `postMessage()`. All messages have a `type` discriminator and typed `payload`. See `HostToWebviewMessage` and `WebviewToHostMessage` in the data model.

**Initialization handshake:**
```
Webview loads → sends { type: 'ready' }
                ← Host sends { type: 'state-update', payload: DashboardState }
                ← Host sends { type: 'theme-changed', payload: { kind: 'dark' } }
```

**Ongoing updates (push from host):**
```
File change detected → SquadStore updates → EventBus fires
  → DashboardPanel.postMessage({ type: 'agent-status', payload: {...} })
```

**User actions (push from webview):**
```
User clicks "Send Command" → Webview sends { type: 'enqueue-command', payload: {...} }
  → Host receives, validates, writes to agent queue
  → File change triggers update cycle
  → Host sends { type: 'queue-update', payload: {...} }
```

### 6.2 EventBus (Internal)

The `EventBus` is a typed event emitter within the extension host. All state mutations emit events; all UI consumers subscribe.

```typescript
interface SquadEvents {
  'team-changed':      (context: SquadContext) => void;
  'agent-status':      (agentId: string, status: AgentStatus) => void;
  'log-entry':         (entry: LogEntry) => void;
  'queue-changed':     (agentId: string, queue: CommandQueueItem[]) => void;
  'stats-updated':     (stats: SquadStatistics) => void;
  'context-switched':  (context: SquadContext) => void;
  'decision-added':    (entry: DecisionEntry) => void;
  'file-changed':      (path: string, type: 'created' | 'changed' | 'deleted') => void;
}
```

### 6.3 Multi-Squad State Sync

Each `SquadContext` has its own `FileWatcher` scoped to its `.squad/` directory. When the user switches active squad, the dashboard receives a `squad-switched` message and re-renders with the new context's state. Background squads still accumulate log entries and fire events (for cross-squad notifications).

---

## 7. File Structure

### New Directories and Files

```
src/
├── extension.ts                        ← Enhanced: multi-squad activation
│
├── core/                               ← NEW: Core infrastructure
│   ├── eventBus.ts                     ← Typed event emitter
│   ├── squadRegistry.ts               ← Multi-squad context manager
│   ├── squadContext.ts                 ← Per-squad state container
│   └── ringBuffer.ts                  ← Circular buffer utility
│
├── team/                               ← EXISTING: Enhanced
│   ├── parser.ts                       ← Implement real markdown parsing
│   ├── serializer.ts                   ← Implement real markdown serialization
│   ├── teamState.ts                    ← Enhanced with AgentRuntime
│   └── watcher.ts                      ← Enhanced for multi-squad
│
├── monitoring/                         ← NEW: Agent monitoring
│   ├── logStore.ts                     ← Ring buffer log storage with filtering
│   ├── agentMonitor.ts                 ← Process/file monitoring for agent status
│   ├── commandQueue.ts                 ← Queue management with persistence
│   └── statsEngine.ts                  ← Statistics calculation and aggregation
│
├── git/                                ← NEW: Git integration
│   ├── gitMonitor.ts                   ← Watch branches, detect agent-related activity
│   └── gitTypes.ts                     ← PR/commit/branch interfaces
│
├── commands/                           ← EXISTING: Extended
│   ├── index.ts                        ← Register all 25 commands
│   ├── initialize.ts                   ← Enhanced: delegate to wizard
│   ├── addMember.ts                    ← Existing
│   ├── removeMember.ts                 ← Existing
│   ├── editMember.ts                   ← Existing
│   ├── openRoster.ts                   ← Existing
│   ├── openTeamFile.ts                 ← Existing
│   ├── refreshRoster.ts               ← Existing
│   ├── openDashboard.ts               ← NEW: Create/reveal dashboard panel
│   ├── openAgentDetail.ts             ← NEW: Create/reveal agent detail panel
│   ├── switchSquad.ts                  ← NEW: Quick pick for squad context
│   ├── createSquad.ts                  ← NEW: Initialize squad in folder
│   ├── enqueueCommand.ts              ← NEW: Send command to agent
│   ├── showLogs.ts                     ← NEW: Open log view
│   ├── search.ts                       ← NEW: Cross-squad search
│   └── runCeremony.ts                  ← NEW: Trigger ceremony
│
├── views/                              ← EXISTING: Extended
│   ├── rosterTreeProvider.ts           ← Enhanced: status badges, context menus
│   ├── squadSelectorProvider.ts        ← NEW: Multi-squad tree view
│   ├── activityProvider.ts             ← NEW: Recent decisions + logs tree
│   └── statusBar.ts                    ← NEW: Status bar items
│
├── webview/                            ← NEW: Webview panel management
│   ├── dashboardPanel.ts              ← Dashboard webview lifecycle + messaging
│   ├── agentDetailPanel.ts            ← Agent detail webview
│   ├── initWizardPanel.ts             ← Initialize wizard webview
│   ├── webviewBridge.ts               ← Shared message handling utilities
│   └── contentProvider.ts             ← HTML generation with CSP, theme, nonces
│
├── utils/                              ← EXISTING: Extended
│   ├── errors.ts                       ← Existing
│   ├── logger.ts                       ← Existing
│   └── config.ts                       ← NEW: Extension configuration wrapper
│
└── test/                               ← NEW: Test infrastructure
    ├── suite/
    │   ├── parser.test.ts
    │   ├── squadRegistry.test.ts
    │   ├── logStore.test.ts
    │   ├── statsEngine.test.ts
    │   └── eventBus.test.ts
    └── runTest.ts

media/                                  ← NEW: Webview assets
├── dashboard/
│   ├── dashboard.html                 ← Dashboard template
│   ├── dashboard.css                  ← Styles (VS Code theme variables)
│   └── dashboard.js                   ← Client-side logic
├── agentDetail/
│   ├── agentDetail.html
│   ├── agentDetail.css
│   └── agentDetail.js
├── wizard/
│   ├── wizard.html
│   ├── wizard.css
│   └── wizard.js
└── shared/
    ├── theme.css                      ← VS Code CSS variable mappings
    ├── components.css                 ← Shared UI components
    └── messaging.js                   ← Shared postMessage utilities
```

### Package.json Additions

Updated `contributes` section for new views, commands, menus, and configuration:

```jsonc
{
  "activationEvents": [
    "workspaceContains:.squad/team.md",
    "workspaceContains:**/.squad/team.md",   // Multi-root support
    "onCommand:squad.initialize",
    "onCommand:squad.openDashboard"
  ],
  "contributes": {
    "views": {
      "squadExplorer": [
        { "id": "squad.squadSelector", "name": "Squads" },
        { "id": "squad.rosterView",    "name": "Team Roster" },
        { "id": "squad.activityView",  "name": "Activity" }
      ]
    },
    "configuration": {
      "title": "Squad",
      "properties": {
        "squad.dashboard.logBufferSize": {
          "type": "number",
          "default": 1000,
          "description": "Maximum number of log entries to keep in memory"
        },
        "squad.dashboard.autoOpen": {
          "type": "boolean",
          "default": false,
          "description": "Automatically open dashboard on squad detection"
        },
        "squad.notifications.enabled": {
          "type": "boolean",
          "default": true,
          "description": "Show notifications for agent errors and milestones"
        },
        "squad.multiSquad.showInactive": {
          "type": "boolean",
          "default": true,
          "description": "Show inactive squads in the selector"
        }
      }
    }
  }
}
```

---

## 8. Implementation Sequence

### Phase 1: Foundation (Weeks 1-3) — P0 Core

**Goal:** Core infrastructure that everything else builds on.

```
Week 1: Core Infrastructure
├── [core/eventBus.ts]          — Typed event emitter (0 dependencies)
├── [core/ringBuffer.ts]        — Circular buffer (0 dependencies)
├── [core/squadContext.ts]      — Per-squad container (depends: eventBus)
├── [core/squadRegistry.ts]    — Multi-squad manager (depends: squadContext)
├── [team/parser.ts]            — Real markdown parsing (blocks Trinity/Morpheus v1 work)
├── [team/serializer.ts]        — Real markdown serialization
└── [test/suite/]               — Unit tests for all core modules

Week 2: Monitoring Infrastructure
├── [monitoring/logStore.ts]    — Log storage with ring buffer + filtering
├── [monitoring/agentMonitor.ts] — Detect agent status from file changes
├── [monitoring/commandQueue.ts] — Queue data model + persistence
├── [monitoring/statsEngine.ts] — Statistics aggregation
├── [views/statusBar.ts]        — Status bar items
└── [commands/switchSquad.ts]   — Squad context switching

Week 3: Dashboard Webview
├── [webview/contentProvider.ts] — HTML generation, CSP, nonce, theme
├── [webview/webviewBridge.ts]  — Shared messaging utilities
├── [webview/dashboardPanel.ts] — Dashboard panel lifecycle
├── [media/dashboard/]          — HTML + CSS + JS for dashboard
├── [media/shared/]             — Shared theme + component styles
├── [commands/openDashboard.ts] — Command to open/reveal dashboard
└── Integration: wire eventBus → dashboardPanel.postMessage
```

**Dependency chain:**
```
eventBus → squadContext → squadRegistry → everything else
ringBuffer → logStore → dashboardPanel
parser/serializer → squadContext (real data instead of stubs)
```

### Phase 2: Full Monitoring (Weeks 4-5) — P0 Complete

```
Week 4: Dashboard Features
├── Agent status cards with live badges
├── Terminal-style log view with filtering
├── Command queue with enqueue/cancel
├── Statistics panel with utilization charts
├── Multi-squad selector in tree view
├── [views/squadSelectorProvider.ts]
└── [commands/enqueueCommand.ts, cancelCommand.ts]

Week 5: Polish & Integration
├── [webview/agentDetailPanel.ts] — Agent detail view
├── [media/agentDetail/]          — Agent detail UI
├── Theme sync (light/dark/high-contrast)
├── Webview state serialization (restore on reopen)
├── End-to-end testing with real .squad/ data
└── Status bar click handlers
```

### Phase 3: Insights & Automation (Weeks 6-8) — P1

```
Week 6: Insights
├── [views/activityProvider.ts]   — Decisions + logs tree view
├── Decision timeline in dashboard
├── Agent history viewer
├── Squad health score calculation
└── Smart notifications (error toasts, milestone toasts)

Week 7: Git & Automation
├── [git/gitMonitor.ts]           — Branch/PR monitoring
├── Git activity tab in dashboard
├── Ceremony trigger UI
├── [commands/runCeremony.ts]
└── Cross-squad search

Week 8: Onboarding
├── [webview/initWizardPanel.ts]  — Initialize wizard
├── [media/wizard/]               — Wizard UI
├── Charter custom editor (basic)
└── Template gallery (basic)
```

### Phase 4: Advanced Features (Weeks 9-12) — P2

```
Weeks 9-10: Advanced UX
├── File decoration provider (agent indicators)
├── Export reports (Markdown/JSON)
├── Keyboard shortcuts
├── Ralph board view (Kanban)

Weeks 11-12: Visualization & Polish
├── Agent dependency graph (Mermaid rendering)
├── Decision diff viewer
├── Plugin/skill browser
├── Workspace recommendations
├── Performance optimization and memory profiling
```

---

## 9. The 10 Additional Features (Requirement 3)

Here are the 10 high-value features designed based on real Squad usage pain points:

### 1. **Squad Health Score** (F10)
**Pain point:** No way to know at a glance if a squad is functioning well.
**Design:** Composite score (0-100) based on: decision velocity (decisions/day), agent utilization (% time working vs idle), error rate, staleness (time since last activity), roster completeness (are key roles filled?). Displayed in status bar and dashboard header. Color-coded: 🟢70-100, 🟡40-69, 🔴0-39.

### 2. **Decision Timeline** (F08)
**Pain point:** `decisions.md` is a flat append-only file; hard to find specific decisions or see patterns.
**Design:** Parse `decisions.md` into structured entries. Render as a chronological timeline with search, agent filtering, and tag-based grouping (architecture, scope, tech, process). Clicking an entry shows full context.

### 3. **Smart Notifications** (F12)
**Pain point:** Users miss important events (agent errors, reviewer rejections) when focused on code.
**Design:** Configurable toast notifications for: agent errors, reviewer rejections, ceremony triggers, completed milestones, stale agents (no activity for N minutes). Built on `vscode.window.showInformationMessage` / `showWarningMessage` with action buttons to jump to dashboard or agent detail.

### 4. **Git Integration** (F13)
**Pain point:** No connection between squad agents and the git branches/PRs they create.
**Design:** Monitor git branches matching `squad/*` pattern. Show per-agent branch list, PR status (open/merged/review requested), and recent commits in agent detail view. Use `git log --all --oneline --grep="agent-name"` or VS Code's git API for real-time tracking.

### 5. **Ceremony Scheduler** (F14)
**Pain point:** Ceremonies from `ceremonies.md` are currently only triggered by the coordinator in chat. No way to trigger from VS Code.
**Design:** Parse `ceremonies.md` for available ceremonies. Show in command palette and dashboard. For auto-triggered ceremonies with conditions, show a "next ceremony" countdown. Running a ceremony opens a ceremony panel with participants, agenda, and space for recording outcomes.

### 6. **Agent Charter Editor** (F15)
**Pain point:** Charter files are raw markdown; easy to make formatting mistakes or forget required sections.
**Design:** VS Code Custom Text Editor (`CustomTextEditorProvider`) for `charter.md` files. Shows a structured form with fields for Role, Mission, Responsibilities, Scope, Model Preference. Preview pane shows rendered markdown. Validates required sections.

### 7. **Initialize Wizard** (F16)
**Pain point:** `squad.initialize` currently just prompts for basic info. Setting up a full squad requires many manual steps.
**Design:** Multi-step webview wizard: (1) Scan project for language/framework signals, (2) Propose team composition based on detected stack, (3) Let user customize members/roles, (4) Select universe for naming, (5) Generate `.squad/` structure with all files. Replaces the current basic `initialize` command.

### 8. **Cross-Squad Search** (F17)
**Pain point:** In a multi-squad workspace, finding a specific decision, member, or log entry means manually checking each squad.
**Design:** Quick pick with search-as-you-type across all squad contexts. Searches: member names/roles, decision content, log messages, file paths. Results grouped by squad with jump-to-file actions.

### 9. **Agent Dependency Graph** (F19)
**Pain point:** Hard to visualize which agents depend on each other's outputs — can cause serialization mistakes.
**Design:** Parse orchestration logs and decision entries to infer agent relationships (reviewer → author, lead → implementer, tester → implementer). Render as a Mermaid diagram in a webview. Nodes = agents, edges = dependency/review relationships with frequency counts.

### 10. **Inline File Annotations** (F27)
**Pain point:** When reading code, no indication of which agent last touched a specific file.
**Design:** `FileDecorationProvider` that reads orchestration logs and git blame to determine which agent last modified each file. Shows the agent's emoji as a file decoration badge in the Explorer. Hovering shows agent name, last action, and timestamp. Opt-in via configuration.

---

## 10. Technical Guidelines

### Webview Security
- Every webview HTML document MUST include:
  ```html
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} https:;">
  ```
- Generate unique nonce per render via `crypto.randomBytes(16).toString('base64')`
- No inline styles or scripts — all external files loaded via `webview.asWebviewUri()`

### Theme Integration
- Use VS Code CSS variables in webview styles: `--vscode-editor-background`, `--vscode-foreground`, `--vscode-button-background`, etc.
- Listen to `vscode.window.onDidChangeActiveColorTheme` and send theme update to webview
- The `media/shared/theme.css` maps VS Code variables to application-level custom properties

### Performance
- Log store uses `RingBuffer` capped at configurable size (default: 1000 entries)
- Statistics are computed incrementally, not recalculated from full history
- Webview receives incremental updates via `postMessage`, not full state snapshots (after initial load)
- File watchers use debouncing (300ms) to avoid thrashing on rapid file changes
- Tree views use lazy child resolution (`getChildren` only called when node is expanded)

### Multi-Root Workspace
- Use `vscode.workspace.workspaceFolders` (note: plural, and it may change at runtime)
- Listen to `vscode.workspace.onDidChangeWorkspaceFolders` for folder add/remove
- Each folder gets its own `SquadContext` if `.squad/team.md` exists
- The `SquadRegistry` singleton manages all contexts. Commands always operate on the active context.

### State Persistence
- Use `context.globalState` for cross-workspace preferences (dashboard layout, notification settings)
- Use `context.workspaceState` for per-workspace state (active squad selection, log filter preferences)
- Webview panels serialize their state via the VS Code webview state API for restore-on-reopen

### Testing Strategy
- Unit tests for core modules (parser, eventBus, ringBuffer, statsEngine) — pure logic, no VS Code API
- Integration tests using `@vscode/test-electron` for commands and tree views
- Webview logic tested separately as plain JS/TS (no DOM dependency in business logic)

---

## 11. Migration Path from v1

The v2 extension is **backward compatible** with v1 data:

1. Existing `.squad/team.md` files continue to work — the enhanced parser is a superset
2. Existing 7 commands keep their IDs — no keybinding breakage
3. The sidebar tree view is enhanced in-place, not replaced
4. New views and commands are additive — users discover them organically
5. `squad.initialize` gains the wizard but falls back to the basic flow if the wizard is dismissed

No data migration scripts needed. The v2 extension reads the same files and adds new capabilities on top.

---

*This architecture supports the full vision: monitoring, multi-squad, and 10 power-user features — layered so P0 ships fast and everything else builds incrementally without rework.*
