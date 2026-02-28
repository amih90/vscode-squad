# Neo History

## Learnings
- Project owner: Ami Hollander.
- Project: VS Code extension for Squad management in every repository.
- UX direction: similar to Squad Desktop monitoring and control interface.
- Stack: VS Code extension API with JavaScript/TypeScript and webview UI.

## 2026-02-28: Architecture Design Complete

### Key Decisions Made:
1. **Single source of truth**: `.squad/team.md` in markdown table format (human-readable, git-friendly)
2. **MVP uses sidebar tree view** (no complex webview for v1, faster to ship)
3. **File watcher + in-memory state** for responsive UI and automatic sync of external edits
4. **File parser/serializer approach** avoids external npm dependencies, keeps parser transparent
5. **Three team sections** (Coordinator, Members, Coding Agent) to support Squad governance model
6. **Phase 2 for initialize wizard and webview modal** (defer complexity)

### MVP Scope (6 weeks):
- View roster in sidebar tree view
- Add, remove, edit members via context menu + dialogs
- File watcher detects external changes and auto-refreshes UI
- Open charter files from team roster
- Initialize command creates `.squad/` structure

### Architecture File Patterns:
- `src/team/parser.ts` — parse markdown to `TeamState`
- `src/team/serializer.ts` — serialize `TeamState` back to markdown
- `src/team/watcher.ts` — file system monitoring and change detection
- `src/commands/*.ts` — command implementations (add, remove, edit, etc.)
- `src/views/rosterTreeProvider.ts` — VS Code tree view provider

### Rationale Summary:
- Markdown format keeps data human-editable and diff-friendly for git
- Sidebar view avoids webview complexity; tree items are native VS Code UI
- File watcher enables automatic sync when `.squad/team.md` changes externally
- Message-based state updates (disk → in-memory → UI) prevent thrashing
- Error handling favors user agency (show errors, let user fix in editor)

### User Journeys Mapped:
1. Initialize Squad (create `.squad/team.md`)
2. View roster (sidebar tree, click member to see details)
3. Hire member (right-click → Add Member → dialog)
4. Fire member (right-click → Remove Member → confirm)
5. Edit role (right-click → Edit Member → modal)

### Tech Stack Decisions:
- **Zero runtime dependencies** for MVP (custom markdown parser)
- TypeScript strict mode (squad standard)
- VS Code Extension API (native, no Electron complexity)
- Node.js `fs` + `path` for file I/O

### Open Questions Documented:
- Charter file auto-generation (MVP: link only, Phase 2: scaffold)
- Bulk import (MVP: manual, Phase 2: CSV/JSON)
- Merge conflict handling (user resolves via git, extension reloads)

### Architecture Document:
- Created: `.squad/decisions/inbox/neo-architecture.md` (10 sections, 450+ lines)
- Ready for Tank, Trinity, Switch, Morpheus review
- Includes 6-week implementation roadmap with task breakdown

## 2026-02-28: v2 Architecture Design — Major Enhancement

### Scope
Three major requirements: (1) Agent Monitoring Dashboard, (2) Multi-Squad Management, (3) 10 additional high-value features. Total: 27 features across P0/P1/P2 priorities.

### Key Architecture Decisions:
1. **Event-driven unidirectional data flow**: Disk → FileWatcher → Parser → SquadStore → EventBus → UI. All mutations go through disk round-trip for consistency.
2. **WebviewPanel for rich dashboard** — tree views insufficient for charts, live logs, status animations. Three webview panels: Dashboard (main), Agent Detail, Initialize Wizard.
3. **SquadRegistry singleton** manages multi-squad contexts. Each workspace folder with `.squad/` gets its own `SquadContext`. Active context is switchable.
4. **Typed postMessage protocol** for extension host ↔ webview communication. Discriminated union types: `HostToWebviewMessage` and `WebviewToHostMessage`.
5. **RingBuffer** for log storage — configurable capacity (default 1000), O(1) push, prevents memory growth.
6. **Incremental stats** — `StatsEngine` computes statistics from status transitions, never re-scans full history.
7. **Content Security Policy** on all webviews — nonce-based script loading, no inline code, `webview.asWebviewUri()` for all media.
8. **VS Code theme sync** — webview CSS uses VS Code CSS variables, listens to `onDidChangeActiveColorTheme`.

### New Module Structure:
- `src/core/` — eventBus, squadRegistry, squadContext, ringBuffer
- `src/monitoring/` — logStore, agentMonitor, commandQueue, statsEngine
- `src/git/` — gitMonitor, gitTypes
- `src/webview/` — dashboardPanel, agentDetailPanel, initWizardPanel, webviewBridge, contentProvider
- `media/` — webview HTML/CSS/JS assets (dashboard, agentDetail, wizard, shared)
- New views: squadSelectorProvider, activityProvider, statusBar

### Command Surface Expansion:
- From 7 commands to 25 total (18 new)
- Context menu contributions for tree view items
- View title actions for navigation buttons

### Implementation Sequence (12 weeks):
- Phase 1 (W1-3): Core infra + monitoring infra + dashboard webview
- Phase 2 (W4-5): Full monitoring features + agent detail + theme
- Phase 3 (W6-8): Insights, git, ceremonies, wizard
- Phase 4 (W9-12): Advanced UX, visualization, plugins

### 10 Additional Features Designed:
1. Squad Health Score (composite 0-100)
2. Decision Timeline (structured, searchable)
3. Smart Notifications (configurable toasts)
4. Git Integration (branch/PR tracking per agent)
5. Ceremony Scheduler (trigger from VS Code)
6. Agent Charter Editor (CustomTextEditorProvider)
7. Initialize Wizard (multi-step webview)
8. Cross-Squad Search (quick pick, all contexts)
9. Agent Dependency Graph (Mermaid-rendered)
10. Inline File Annotations (FileDecorationProvider)

### Squad Desktop Patterns Adopted:
- Three-panel layout (agents | terminal | queue) for dashboard
- Agent cards with emoji, name, role, status badge
- Terminal log with timestamps and color-coded severity
- Command queue with status tracking
- Adapted from WebSocket-based to VS Code postMessage-based communication

### Backward Compatibility:
- v1 data and commands remain intact
- New features are additive, not replacements
- No data migration needed
