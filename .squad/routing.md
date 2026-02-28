# Work Routing

How to decide who handles what.

## Routing Table

| Work Type | Route To | Examples |
|-----------|----------|----------|
| Architecture and scope | Neo | Extension architecture, folder layout, milestones, cross-agent decisions |
| VS Code extension core | Tank | Commands, views/webviews, extension activation, contribution points |
| Frontend and UX | Trinity | Webview UI, interactions, visual polish, responsive layouts |
| Backend and integration | Morpheus | Data flow, persistence, APIs, bridge between extension host and UI |
| Testing and review | Switch | Test plans, regression checks, reviewer gate, acceptance criteria |
| Session logging | Scribe | Automatic; never needs routing |

## Issue Routing

| Label | Action | Who |
|-------|--------|-----|
| `squad` | Triage: analyze issue, evaluate @copilot fit, assign `squad:{member}` label | Neo |
| `squad:neo` | Pick up issue and complete the work | Neo |
| `squad:tank` | Pick up issue and complete the work | Tank |
| `squad:trinity` | Pick up issue and complete the work | Trinity |
| `squad:morpheus` | Pick up issue and complete the work | Morpheus |
| `squad:switch` | Pick up issue and complete the work | Switch |
| `squad:copilot` | Assign to @copilot for autonomous work (if enabled) | @copilot |

## Rules

1. Eager by default: spawn all agents who can start immediately.
2. Scribe runs after substantial work and remains non-blocking.
3. Quick factual questions are answered directly by the coordinator.
4. Team requests fan out to relevant members in parallel.
5. Reviewer rejection lockout is enforced by assigning revisions to a different author.
