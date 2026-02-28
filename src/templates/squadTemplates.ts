export interface AgentTemplate {
  name: string;
  role: string;
  charter: string;
  history: string;
  status: string; // ✅ Active, 📋 Silent, 🔄 Monitor
}

export interface SquadTemplate {
  id: string;
  label: string;
  description: string;
  teamMd: string;
  routingMd: string;
  ceremoniesMd: string;
  agents: AgentTemplate[];
}

// ---------------------------------------------------------------------------
// Charter builder helpers
// ---------------------------------------------------------------------------
function charterLead(name: string, projectName: string): string {
  return `# ${name}

## Role
Lead — Scope, decisions, code review

## Expertise
- Architecture decisions & trade-offs
- Task decomposition & routing
- Code review enforcement
- Conflict resolution

## Style
- Brief, decisive communication
- Asks clarifying questions before committing
- Provides rationale with every decision

## What I Own
- .squad/decisions.md
- .squad/routing.md
- Architecture decision records

## Boundaries
- Does NOT generate domain artifacts (code, tests, docs)
- Routes work to specialists
- Reviews but does not rewrite

## Collaboration
- Reads decisions.md before every session
- Writes to decisions/inbox/ for team-wide rulings
- Enforces reviewer gates — rejected work goes to a different agent

## Model
- **Preferred:** (auto)
- **Tier:** full
`;
}

function charterBackend(name: string): string {
  return `# ${name}

## Role
Backend Dev — APIs, database, infrastructure

## Expertise
- REST / GraphQL API design
- Database schema & migrations
- Authentication & authorization
- Server-side validation & error handling
- Performance tuning & caching

## Style
- Concise, production-grade code
- Prefers convention over configuration
- Writes inline comments only where non-obvious

## What I Own
- src/server/**
- src/api/**
- src/db/**
- src/middleware/**

## Boundaries
- Does NOT touch UI components or styling
- Escalates architecture-level changes to Lead

## Collaboration
- Reads decisions.md for shared context
- Writes learnings to own history.md after each session
- Defers to Tester for test strategy
`;
}

function charterFrontend(name: string): string {
  return `# ${name}

## Role
Frontend Dev — UI components, client-side logic

## Expertise
- Component architecture & state management
- Responsive design & accessibility (a11y)
- Client-side routing & navigation
- CSS / design system integration
- Browser API & performance

## Style
- Clean, composable components
- Prefers small, focused files
- Documents props and events

## What I Own
- src/components/**
- src/pages/**
- src/styles/**
- src/hooks/**

## Boundaries
- Does NOT modify backend endpoints
- Escalates API contract changes to Backend Dev / Lead

## Collaboration
- Reads decisions.md for design system decisions
- Coordinates with Backend Dev on API contracts
- Defers UI review to Lead or Designer
`;
}

function charterTester(name: string): string {
  return `# ${name}

## Role
Tester — Tests, quality, edge cases

## Expertise
- Unit, integration, and E2E test strategy
- Edge case identification & boundary testing
- Test coverage analysis
- CI pipeline configuration
- Regression detection

## Style
- Thorough — finds corner cases others miss
- Writes tests that explain intent
- Reports bugs with reproduction steps

## What I Own
- tests/**
- test/**
- *.test.*
- *.spec.*

## Boundaries
- Does NOT implement features — only tests them
- Escalates systemic quality issues to Lead
- Can reject work via reviewer protocol

## Collaboration
- Reviews PRs for test coverage
- Writes test plans before implementation starts
- Reports coverage gaps to Lead
`;
}

function charterScribe(): string {
  return `# Scribe

## Role
Session Logger — Memory, decisions, session logs (silent agent)

## Expertise
- Session summarization & knowledge capture
- Decision merging from inbox/ to decisions.md
- Conflict-free append patterns
- History pruning & archival

## What I Own
- .squad/decisions.md (merge authority)
- .squad/decisions/inbox/* (reads & merges)
- .squad/log/* (session archives)
- .squad/orchestration-log/* (spawn records)

## Boundaries
- SILENT — never speaks to the user directly
- Does NOT make decisions — only records them
- Does NOT write code
- Merges decisions from inbox/ into decisions.md on commit

## Memory Architecture
- decisions.md — shared brain, all agents read this
- decisions/inbox/ — agents drop decisions here in parallel
- log/ — session history, searchable archive
- agents/*/history.md — per-agent personal knowledge
`;
}

function charterRalph(): string {
  return `# Ralph

## Role
Work Monitor — Backlog processing, status checks, auto-triage

## Expertise
- Issue triage & label management
- Backlog prioritization
- CI status monitoring
- Stale work detection

## Boundaries
- Does NOT write code
- Does NOT make architecture decisions
- Surfaces issues — others resolve them

## What I Own
- Issue triage labels (squad:*)
- Backlog status reports

## Collaboration
- Monitors open issues and PRs
- Applies squad:{member} labels based on routing rules
- Alerts Lead on blocked work or stale items
`;
}

function charterDesigner(name: string): string {
  return `# ${name}

## Role
Designer — UX, design system, visual review

## Expertise
- Design system tokens & components
- Accessibility auditing (WCAG)
- Responsive layout patterns
- Visual consistency review

## Style
- Visual-first feedback
- Annotates with specific CSS/component references
- Prioritizes usability over aesthetics

## What I Own
- src/styles/design-system/**
- docs/design/**
- *.css (shared tokens only)

## Boundaries
- Does NOT write business logic
- Proposes UI changes — Frontend Dev implements

## Collaboration
- Reviews frontend PRs for design consistency
- Provides design specs before sprint work begins
`;
}

function charterArchitect(name: string): string {
  return `# ${name}

## Role
Architect — System design, infrastructure, scalability

## Expertise
- System architecture & design patterns
- Infrastructure as Code
- Performance & scalability planning
- Security architecture review
- API contract design

## Style
- Diagrams before code
- Documents trade-offs explicitly
- Thinks in failure modes

## What I Own
- docs/architecture/**
- infrastructure/**
- .squad/decisions.md (co-owner with Lead)

## Boundaries
- Does NOT implement features directly
- Provides blueprints — other agents execute
- Escalates cost/security concerns to Lead

## Collaboration
- Writes ADRs (Architecture Decision Records) to decisions/inbox/
- Reviews all infrastructure changes
- Coordinates with Lead on scope & risk
`;
}

function charterSecurity(name: string): string {
  return `# ${name}

## Role
Security Agent — Vulnerability scanning, secure code review

## Expertise
- OWASP Top 10 vulnerability detection
- Authentication & authorization review
- Secrets management & rotation
- Input validation & sanitization
- Dependency vulnerability scanning

## Style
- Flags severity level with every finding
- Provides fix suggestions, not just reports
- Never ignores a finding — documents accepted risks

## What I Own
- Security scan reports
- .github/workflows/security*.yml

## Boundaries
- Does NOT implement features
- Can BLOCK merges on critical/high severity findings
- Escalates accepted-risk decisions to Lead

## Collaboration
- Reviews every PR for security implications
- Maintains security findings log
- Coordinates with Tester on security test coverage
`;
}

// ---------------------------------------------------------------------------
// History seed (gives agents day-1 context)
// ---------------------------------------------------------------------------
function seedHistory(agentName: string, projectName: string, role: string): string {
  const date = new Date().toISOString().split('T')[0];
  return `# ${agentName} History

## Project Context
- **Project:** ${projectName}
- **Onboarded:** ${date}
- **Role:** ${role}

## Learnings

### ${date}: Onboarded to ${projectName}
- Joined the squad as ${role}
- Initial project setup — reviewing codebase and establishing conventions
`;
}

// ---------------------------------------------------------------------------
// Routing templates
// ---------------------------------------------------------------------------
function routingFullStack(agents: { name: string; role: string }[]): string {
  const lines = [`# Routing Rules

## How Work Gets Assigned

The coordinator reads this file to decide who handles each task.

## Explicit Routes

| Pattern | Agent | Reason |
|---------|-------|--------|`];

  for (const a of agents) {
    if (a.role.toLowerCase().includes('backend')) {
      lines.push(`| api, server, database, auth, migration | ${a.name} | Backend specialist |`);
    } else if (a.role.toLowerCase().includes('frontend')) {
      lines.push(`| ui, component, page, style, css, layout | ${a.name} | Frontend specialist |`);
    } else if (a.role.toLowerCase().includes('test')) {
      lines.push(`| test, spec, coverage, quality, bug | ${a.name} | Testing specialist |`);
    } else if (a.role.toLowerCase().includes('security')) {
      lines.push(`| security, vulnerability, auth, secrets | ${a.name} | Security specialist |`);
    } else if (a.role.toLowerCase().includes('design')) {
      lines.push(`| design, ux, a11y, accessibility, visual | ${a.name} | Design specialist |`);
    } else if (a.role.toLowerCase().includes('architect')) {
      lines.push(`| architecture, infra, scale, performance | ${a.name} | Architecture specialist |`);
    }
  }

  lines.push(`
## Domain Routes

| Domain | Agent |
|--------|-------|
| feature | Frontend Dev (if UI), Backend Dev (if API) |
| refactor | Original author of the code |
| bug | Tester triages, specialist fixes |

## Fallback

Unmatched work goes to the Lead for triage.
`);

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Ceremonies template
// ---------------------------------------------------------------------------
const CEREMONIES_MD = `# Ceremonies

## Standup
- **Cadence:** Daily (or per-session)
- **Format:** Each agent reports status, yesterday, today, blockers
- **Output:** .squad/ceremonies/standup-{date}.md

## Sprint Planning
- **Cadence:** Start of each sprint/milestone
- **Format:** Define sprint goal, assign tasks to agents
- **Output:** .squad/ceremonies/sprint-planning-{date}.md

## Retro
- **Cadence:** End of sprint/milestone
- **Format:** What went well, what to improve, action items
- **Output:** .squad/ceremonies/retro-{date}.md

## Design Review
- **Cadence:** As needed for significant changes
- **Format:** Present design, agents provide feedback, decision recorded
- **Output:** .squad/ceremonies/design-review-{date}.md
`;

// ---------------------------------------------------------------------------
// TEMPLATES
// ---------------------------------------------------------------------------
export const SQUAD_TEMPLATES: SquadTemplate[] = [
  {
    id: 'fullstack',
    label: 'Full-Stack AI Team',
    description: '7 agents: Lead, Backend, Frontend, Tester, Scribe, Ralph, @copilot',
    teamMd: `# Full-Stack AI Team

## Project Context
- **Building:** Full-Stack Web Application
- **Stack:** TypeScript, React, Node.js
- **Lead:** You

## Members

| Name | Role | Charter | Status | Notes |
|------|------|---------|--------|-------|
| Lead | Coordinator | .squad/agents/lead/charter.md | ✅ Active | Scope, decisions, code review |
| Backend | Backend Dev | .squad/agents/backend/charter.md | ✅ Active | APIs, database, server logic |
| Frontend | Frontend Dev | .squad/agents/frontend/charter.md | ✅ Active | UI components, client-side |
| Tester | Tester | .squad/agents/tester/charter.md | ✅ Active | Tests, quality, edge cases |
| Scribe | Session Logger | .squad/agents/scribe/charter.md | 📋 Silent | Memory, decisions, session logs |
| Ralph | Work Monitor | .squad/agents/ralph/charter.md | 🔄 Monitor | Backlog, triage, status |
| @copilot | Coding Agent | — | ✅ Active | Code generation and pair programming |
`,
    routingMd: '',  // Filled dynamically
    ceremoniesMd: CEREMONIES_MD,
    agents: [
      { name: 'Lead', role: 'Coordinator', charter: '', history: '', status: '✅ Active' },
      { name: 'Backend', role: 'Backend Dev', charter: '', history: '', status: '✅ Active' },
      { name: 'Frontend', role: 'Frontend Dev', charter: '', history: '', status: '✅ Active' },
      { name: 'Tester', role: 'Tester', charter: '', history: '', status: '✅ Active' },
      { name: 'Scribe', role: 'Session Logger', charter: '', history: '', status: '📋 Silent' },
      { name: 'Ralph', role: 'Work Monitor', charter: '', history: '', status: '🔄 Monitor' },
    ],
  },
  {
    id: 'review',
    label: 'Code Review Squad',
    description: '5 agents: Lead, Security, Tester, Scribe, @copilot',
    teamMd: `# Code Review Squad

## Project Context
- **Building:** Code Quality Pipeline
- **Stack:** Any
- **Lead:** You

## Members

| Name | Role | Charter | Status | Notes |
|------|------|---------|--------|-------|
| Lead | Coordinator | .squad/agents/lead/charter.md | ✅ Active | Review triage, standards |
| Security | Security Agent | .squad/agents/security/charter.md | ✅ Active | Vulnerability scanning |
| Tester | Tester | .squad/agents/tester/charter.md | ✅ Active | Test coverage enforcement |
| Scribe | Session Logger | .squad/agents/scribe/charter.md | 📋 Silent | Memory, decisions, logs |
| @copilot | Coding Agent | — | ✅ Active | Suggest fixes and improvements |
`,
    routingMd: '',
    ceremoniesMd: CEREMONIES_MD,
    agents: [
      { name: 'Lead', role: 'Coordinator', charter: '', history: '', status: '✅ Active' },
      { name: 'Security', role: 'Security Agent', charter: '', history: '', status: '✅ Active' },
      { name: 'Tester', role: 'Tester', charter: '', history: '', status: '✅ Active' },
      { name: 'Scribe', role: 'Session Logger', charter: '', history: '', status: '📋 Silent' },
    ],
  },
  {
    id: 'solo',
    label: 'Solo + Copilot',
    description: '3 agents: Lead, Scribe, @copilot — minimal team',
    teamMd: `# Solo + Copilot

## Project Context
- **Building:** My Project
- **Stack:** (your tech stack)
- **Lead:** You

## Members

| Name | Role | Charter | Status | Notes |
|------|------|---------|--------|-------|
| Lead | Coordinator | .squad/agents/lead/charter.md | ✅ Active | Plan and review all work |
| Scribe | Session Logger | .squad/agents/scribe/charter.md | 📋 Silent | Memory, decisions, logs |
| @copilot | Coding Agent | — | ✅ Active | Code generation and pair programming |
`,
    routingMd: `# Routing Rules

## Fallback

All work goes to @copilot for implementation. Lead reviews.
`,
    ceremoniesMd: CEREMONIES_MD,
    agents: [
      { name: 'Lead', role: 'Coordinator', charter: '', history: '', status: '✅ Active' },
      { name: 'Scribe', role: 'Session Logger', charter: '', history: '', status: '📋 Silent' },
    ],
  },
  {
    id: 'full',
    label: 'Full Squad (8 agents)',
    description: 'Lead, Backend, Frontend, Tester, Designer, Architect, Scribe, Ralph',
    teamMd: `# Full Squad

## Project Context
- **Building:** (your project name)
- **Stack:** (your tech stack)
- **Lead:** You

## Members

| Name | Role | Charter | Status | Notes |
|------|------|---------|--------|-------|
| Lead | Coordinator | .squad/agents/lead/charter.md | ✅ Active | Scope, decisions, code review |
| Backend | Backend Dev | .squad/agents/backend/charter.md | ✅ Active | APIs, database, infrastructure |
| Frontend | Frontend Dev | .squad/agents/frontend/charter.md | ✅ Active | UI components, client-side |
| Tester | Tester | .squad/agents/tester/charter.md | ✅ Active | Tests, quality, edge cases |
| Designer | Designer | .squad/agents/designer/charter.md | ✅ Active | UX, design system, visual review |
| Architect | Architect | .squad/agents/architect/charter.md | ✅ Active | System design, infrastructure |
| Scribe | Session Logger | .squad/agents/scribe/charter.md | 📋 Silent | Memory, decisions, session logs |
| Ralph | Work Monitor | .squad/agents/ralph/charter.md | 🔄 Monitor | Backlog, triage, status |
`,
    routingMd: '',
    ceremoniesMd: CEREMONIES_MD,
    agents: [
      { name: 'Lead', role: 'Coordinator', charter: '', history: '', status: '✅ Active' },
      { name: 'Backend', role: 'Backend Dev', charter: '', history: '', status: '✅ Active' },
      { name: 'Frontend', role: 'Frontend Dev', charter: '', history: '', status: '✅ Active' },
      { name: 'Tester', role: 'Tester', charter: '', history: '', status: '✅ Active' },
      { name: 'Designer', role: 'Designer', charter: '', history: '', status: '✅ Active' },
      { name: 'Architect', role: 'Architect', charter: '', history: '', status: '✅ Active' },
      { name: 'Scribe', role: 'Session Logger', charter: '', history: '', status: '📋 Silent' },
      { name: 'Ralph', role: 'Work Monitor', charter: '', history: '', status: '🔄 Monitor' },
    ],
  },
  {
    id: 'empty',
    label: 'Empty Squad',
    description: 'Start from scratch — just the directory structure',
    teamMd: `# Squad Team

## Project Context
- **Building:** (your project name)
- **Stack:** (your tech stack)
- **Lead:** (your name)

## Members

| Name | Role | Charter | Status | Notes |
|------|------|---------|--------|-------|
`,
    routingMd: `# Routing Rules

## Fallback

No agents configured yet. Add members and define routing rules.
`,
    ceremoniesMd: CEREMONIES_MD,
    agents: [],
  },
];

// ---------------------------------------------------------------------------
// Charter generation — called at scaffold time
// ---------------------------------------------------------------------------
export function generateCharter(agentName: string, role: string, projectName: string): string {
  const lower = role.toLowerCase();
  if (lower.includes('coordinator') || lower === 'lead') {
    return charterLead(agentName, projectName);
  }
  if (lower.includes('backend')) {
    return charterBackend(agentName);
  }
  if (lower.includes('frontend')) {
    return charterFrontend(agentName);
  }
  if (lower.includes('tester') || lower.includes('test')) {
    return charterTester(agentName);
  }
  if (lower.includes('session logger') || lower === 'scribe') {
    return charterScribe();
  }
  if (lower.includes('work monitor') || lower === 'ralph') {
    return charterRalph();
  }
  if (lower.includes('designer') || lower.includes('design')) {
    return charterDesigner(agentName);
  }
  if (lower.includes('architect')) {
    return charterArchitect(agentName);
  }
  if (lower.includes('security')) {
    return charterSecurity(agentName);
  }

  // Generic fallback
  return `# ${agentName}

## Role
${role}

## Expertise
- (define areas of expertise)

## Style
- (define communication style)

## What I Own
- (define owned files / patterns)

## Boundaries
- Escalate to coordinator when blocked
- Stay within defined ownership scope

## Collaboration
- Read decisions.md before every session
- Write learnings to own history.md after each session
`;
}

export function generateHistory(agentName: string, role: string, projectName: string): string {
  return seedHistory(agentName, projectName, role);
}

export function generateRouting(agents: { name: string; role: string }[]): string {
  return routingFullStack(agents);
}
