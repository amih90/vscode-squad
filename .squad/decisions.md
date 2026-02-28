# Decisions

## 2026-02-27

- Initialized Squad runtime in this repository with casted members from The Matrix universe.
- Project objective set to a VS Code extension that simplifies per-repo Squad setup and team management.
- Team management UX direction set to mirror Squad Desktop style and interaction patterns.

## 2026-02-28

- Neo (Lead) completed architecture design covering extension entry points, state management, user journeys, tree view UI, error handling, tech stack, and MVP vs Phase 2 scope.
- Architecture specifies 7 core commands (initialize, view, add, remove, edit, refresh, open), sidebar tree view, markdown-based team state, and file watchers for real-time sync.
- Tank scaffolded full project structure: src/{team/,commands/,views/,utils/}, command handlers, tree provider, state management stubs, tsconfig, and package.json contributions.
- Extension builds cleanly to out/ with all 16 TypeScript modules compiled.
- MVP focuses on sidebar roster view + manage members; Phase 2 defers initialization wizard and webview modal.
