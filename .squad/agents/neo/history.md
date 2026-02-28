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
