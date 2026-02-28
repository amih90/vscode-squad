# VS Code Squad Extension: Technical Architecture

**Author:** Neo (Lead / Architect)  
**Date:** 2026-02-28  
**Status:** Ready for Team Review  
**Owner:** Ami Hollander  

---

## Executive Summary

The VS Code Squad extension brings team roster management into every repository, letting users initialize, view, and manage squad members directly from the editor. The architecture uses:

- **VS Code Extension Host** for command routing and file I/O
- **Single-file Data Source** (`.squad/team.md`) as source of truth
- **Sidebar Tree View** for roster display and quick member actions  
- **Optional Webview Modal** for detailed team setup and complex edits (Phase 2)
- **File Watchers** to sync disk changes to UI in real time

This design prioritizes clarity, simplicity, and no-friction editing while respecting Squad's governance model.

---

## 1. Extension Entry Points

### Activation Events

The extension activates in two scenarios:

```json
"activationEvents": [
  "workspaceContains:.squad/team.md",
  "onCommand:squad.initialize"
]
```

- **workspaceContains**: Auto-activate if the repo already has `.squad/team.md`
- **onCommand**: Allow manual initialization even if `.squad/` doesn't exist yet

### Commands Exposed

| Command ID | Label | Context | Behavior |
|------------|-------|---------|----------|
| `squad.initialize` | "Squad: Initialize Team" | When `.squad/` missing | Create `.squad/team.md` with coordinator and template members |
| `squad.openRoster` | "Squad: Open Roster" | Anytime | Show/focus the Squad sidebar view |
| `squad.addMember` | "Squad: Add Member" | Roster view active | Open quickpick or modal to add new member |
| `squad.removeMember` | "Squad: Remove Member" | Member selected in roster | Confirm and delete member row from `.squad/team.md` |
| `squad.editMember` | "Squad: Edit Member" | Member selected in roster | Context menu → edit name/role/status |
| `squad.refreshRoster` | "Squad: Refresh Roster" | Anytime | Reload from disk (useful if edited externally) |
| `squad.openTeamFile` | "Squad: Open Team File" | Anytime | Open `.squad/team.md` in editor for manual edits |

### View Providers

| View ID | Container | Input | Behavior |
|---------|-----------|-------|----------|
| `squad.rosterView` | Sidebar (left) | Team roster data | Tree view showing sections (Coordinator, Members, Coding Agent); each item can trigger actions |

---

## 2. Data & State Architecture

### Source of Truth: `.squad/team.md`

The file follows a structured markdown format already in use by Squad:

```markdown
# Team Roster

> Brief project description

## Coordinator

| Name | Role | Notes |
|------|------|-------|
| Squad | Coordinator | ... |

## Members

| Name | Role | Charter | Status |
|------|------|---------|--------|
| Neo | Lead / Architect | ... | ✅ Active |
| ...

## Coding Agent

| Name | Role | Charter | Status |
|------|------|---------|--------|
| @copilot | Coding Agent | — | 🤖 Coding Agent |

...
```

**Key Properties:**
- **Markdown table format** for human readability and git-friendly diffs
- **Three sections** (Coordinator, Members, Coding Agent) allow flexible team composition
- **Standard columns** (Name, Role, Charter, Status) for consistency
- **Notes field** (Coordinator only) for context

### Runtime State

The extension maintains an in-memory state object:

```typescript
interface TeamState {
  coordinator: Member | null;
  members: Member[];
  codingAgent: Member | null;
  filePath: string;
  lastModified: number;
}

interface Member {
  name: string;
  role: string;
  charter?: string;      // Optional path or description
  status?: string;
  notes?: string;
  section: 'coordinator' | 'members' | 'codingAgent';
}
```

### State Initialization & Sync

1. **On Extension Boot:**
   - Check for `.squad/team.md` in workspace root
   - If found, parse and load into `TeamState`
   - Set up file watcher on `.squad/team.md`

2. **File Watcher Behavior:**
   - When `.squad/team.md` changes *outside* the extension, reload state
   - Emit change event to update UI (sidebar tree, webview if open)
   - Show status bar notification: "Team roster updated from disk"

3. **On User Action in Extension:**
   - Update in-memory `TeamState`
   - Write serialized state back to `.squad/team.md` (markdown format)
   - File watcher detects change but recognizes it as "self-change" (debounce or flag)
   - UI updates immediately (no wait for file read)

---

## 3. User Journeys

### Journey 1: Initialize Squad (First Time User)

```
User opens repo with no .squad/ folder
  ↓
clicks "Squad: Initialize Team" from command palette
  ↓
Extension shows quickpick:
  - "Start with blank coordinator + members"
  - "Start with template (Matrix theme)"
  ↓
User selects option
  ↓
Extension prompts:
  - Coordinator name? (default: "Squad")
  - Initial members? (names, roles as comma-separated input or skip)
  ↓
Extension creates:
  - .squad/ directory
  - .squad/team.md with structure above
  ↓
Opens .squad/team.md in editor + shows Squad sidebar
  ↓
User edits manually or uses sidebar commands to add more members
```

### Journey 2: View Team Roster (Core Daily Use)

```
User opens sidebar (Squad icon in Activity Bar)
  ↓
Sees tree structure:
  Coordinator
    └─ Squad
  Members
    ├─ Neo (Lead / Architect)
    ├─ Trinity (Frontend Dev)
    └─ ...
  Coding Agent
    └─ @copilot (Coding Agent)
  ↓
Hovers over member → tooltip shows full detail (charter, status)
Clicks member → opens .squad/agents/{name}/charter.md if exists
```

### Journey 3: Hire a Member (Add to Roster)

```
User right-clicks on "Members" section or clicks "+" icon
  ↓
Extension shows "Add Member" dialog:
  - Name: [text input]
  - Role: [text input]
  - Charter file: [optional path or "skip"]
  - Status: [dropdown: Active, Inactive, Proposed, etc.]
  ↓
User fills and clicks "Add"
  ↓
Extension:
  - Adds row to Members table in .squad/team.md
  - Saves file
  - UI updates automatically
  ↓
User sees new member in sidebar
```

### Journey 4: Fire a Member (Remove from Roster)

```
User right-clicks on member name in sidebar
  ↓
Context menu shows "Remove Member"
  ↓
Extension shows confirmation:
  "Remove Neo from team? This cannot be undone."
  [Cancel]  [Remove]
  ↓
User clicks "Remove"
  ↓
Extension:
  - Deletes row from Members table
  - Saves .squad/team.md
  - UI updates
  ↓
Sidebar reflects removal
Note: .squad/agents/{name}/ directory is NOT deleted (preserves history)
```

### Journey 5: Edit a Member's Role

```
User right-clicks on member → "Edit Member"
  ↓
Extension shows inline editor or modal:
  Name: Neo [read-only text]
  Role: [Lead / Architect] → user changes to "Architect (Emeritus)"
  Status: [Active] → user changes to "Inactive"
  ↓
User clicks "Save"
  ↓
Extension:
  - Updates row in Members table
  - Writes .squad/team.md
  - UI updates with new details
  ↓
Sidebar and tree view reflect changes
```

---

## 4. Webview Architecture

### MVP: Sidebar Tree View (No Separate Webview)

**Rationale:**
- Faster to ship (no complex state sync)
- Cleaner UX (no modal dialogs unless needed)
- Familiar VS Code patterns (tree providers, context menus)

**Structure:**

```
TreeDataProvider (TeamRosterProvider)
  ├─ getTreeItem(element: Member) → VSCodeItem
  │   └─ label, icon, tooltip, contextValue
  ├─ getChildren(element?: Member) → Thenable<Member[]>
  │   └─ Coordinator section → [coordinator]
  │   └─ Members section → [all members]
  │   └─ Coding Agent section → [coding agent if exists]
  └─ onDidChangeTreeData event
      └─ fires when .squad/team.md changes or user takes action

Context Menu Commands:
  - add (on "Members" header)
  - remove (on member item, contextValue: "removable")
  - edit (on member item, contextValue: "editable")
  - openCharter (on member item if charter path exists)
```

### Phase 2: Webview Modal for Team Settings

**Future Enhancement (not MVP):**

```
Command: squad.openTeamSettings
  ↓
Opens webview panel:
  - Tab 1: Roster (table view with inline editing)
  - Tab 2: Initialize / Onboarding (setup flow)
  - Tab 3: Team Code of Conduct / Governance
  ↓
Webview <→ Extension Host message protocol:
  ExtHost → Webview: 
    { command: 'loadRoster', data: TeamState }
  Webview → ExtHost: 
    { command: 'updateMember', member: Member }
    { command: 'removeMember', name: string }
  ↓
ExtHost handles disk I/O, broadcasts changes via file watcher
```

**Message Protocol** (Phase 2):

```typescript
// Extension Host side:
webviewPanel.webview.postMessage({
  command: 'loadRoster',
  data: currentTeamState
});

webviewPanel.webview.onDidReceiveMessage(msg => {
  if (msg.command === 'saveMember') {
    // validate, update in-memory state, write to disk
    updateTeamFile(msg.member);
  }
});

// Webview side (in HTML):
vscode.postMessage({
  command: 'saveMember',
  member: { name: 'Trinity', role: 'Frontend Dev', ... }
});

window.addEventListener('message', event => {
  const { command, data } = event.data;
  if (command === 'loadRoster') {
    renderRosterTable(data);
  }
});
```

---

## 5. Error Handling & Edge Cases

### Case: Repo Has No `.squad/` Directory

**Behavior:**
- Extension activation succeeds, but no commands are visible
- User runs `squad.initialize` → creates `.squad/` and `.squad/team.md`
- Sidebar appears with fresh template

**Implementation:**
```typescript
if (!fs.existsSync(path.join(workspaceRoot, '.squad/team.md'))) {
  registerCommands(['initialize']);
  setTreeVisibility(false); // or show empty placeholder
} else {
  loadTeamState();
  registerAllCommands();
}
```

### Case: `.squad/team.md` Modified Externally (Git Pull, Manual Edit)

**Behavior:**
- File watcher fires `change` event
- Extension reloads state from disk
- Sidebar tree refreshes automatically
- Status bar shows "Team roster updated"

**Implementation:**
```typescript
const watcher = fs.watch(teamFilePath, (eventType) => {
  if (eventType === 'change' && !isLocalChange) {
    reloadTeamState();
    treeProvider.refresh();
    vscode.window.showInformationMessage('Roster updated from disk');
  }
});
```

### Case: User Has Unsaved Edits in Editor When Roster Updates

**Behavior:**
- Sidebar updates independently
- If user has `.squad/team.md` open in editor, show "File modified on disk" prompt
- User can "Reload" or "Keep local changes"
- Extension respects their choice

**No Action Needed:** VS Code handles this via its built-in file change detection.

### Case: Malformed `.squad/team.md` (Invalid Markdown)

**Behavior:**
- Parser tries to read file
- If parse fails, show error notification: "Failed to parse team roster. Opening file for manual repair..."
- Open file in editor, user fixes manually
- Extension re-attempts parse on next save

**Implementation:**
```typescript
try {
  const parsed = parseTeamFile(content);
  loadTeamState(parsed);
} catch (err) {
  vscode.window.showErrorMessage(`Failed to parse roster: ${err.message}`);
  vscode.commands.executeCommand('vscode.open', teamFileUri);
}
```

### Case: File Permissions / Inability to Write

**Behavior:**
- User tries to add member → extension prepares write
- `fs.writeFile()` fails with EACCES
- Show error: "Permission denied. Check file permissions for .squad/team.md"
- User can `chmod` or move file

**No Special Building Block:** Standard error handling.

### Case: Merge Conflict in `.squad/team.md` (Git)

**Behavior:**
- File contains git conflict markers
- Parser fails
- Follow "Malformed File" case above
- After conflict resolution, extension auto-reloads

**No Special Building Block:** Git merge is user's responsibility; extension simply works after resolution.

---

## 6. Tech Stack & Libraries

### Core Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Runtime** | Node.js (v18+) | VS Code extension requirement |
| **Language** | TypeScript (strict mode) | Type safety, IDE support, squad standard |
| **Extension Host** | VS Code Extension API | Native, no external webview framework needed for MVP |
| **Sidebar View** | VS Code Tree Data Provider | Native, fast, low overhead |
| **File Parsing** | Markdown table parser (lightweight custom or `markdown-it`) | Simple, no regex hell |
| **File I/O** | Node.js `fs` + `path` modules | Standard, reliable |
| **Styling (Phase 2)** | VS Code WebView CSS or Tailwind | For future webview modal |

### Key Modules

```json
{
  "devDependencies": {
    "@types/vscode": "^1.96.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.2.0",
    "@vscode/vsce": "^2.20.0"
  },
  "dependencies": {}
}
```

**Policy:** Start with zero runtime dependencies for MVP. Add `markdown-it` or similar only if custom parser becomes unmaintainable.

### Code Structure

```
src/
  ├── extension.ts          # Entry point, activate/deactivate
  ├── team/
  │   ├── teamState.ts      # in-memory state management
  │   ├── parser.ts         # parse .squad/team.md into TeamState
  │   ├── serializer.ts     # serialize TeamState back to markdown
  │   └── watcher.ts        # file watcher logic
  ├── commands/
  │   ├── initialize.ts
  │   ├── addMember.ts
  │   ├── removeMember.ts
  │   ├── editMember.ts
  │   └── refresh.ts
  ├── views/
  │   ├── rosterTreeProvider.ts
  │   └── rosterWebview.ts   # (Phase 2)
  └── utils/
      ├── logger.ts
      └── errors.ts
```

### File Parsing Strategy

**Custom lightweight parser** (no npm dependency):

```typescript
// Input: markdown content
// Output: TeamState

function parseTeamFile(content: string): TeamState {
  const sections = extractSections(content);
  return {
    coordinator: parseSection(sections.coordinator)[0] || null,
    members: parseSection(sections.members) || [],
    codingAgent: parseSection(sections.codingAgent)[0] || null,
    filePath: '...',
    lastModified: Date.now()
  };
}

function extractSections(content: string): Record<string, string> {
  // Regex: find "## Coordinator", "## Members", "## Coding Agent" blocks
  // Extract table content between each section header
}

function parseSection(markdown: string): Member[] {
  // Split lines, find table start (|---|---), iterate rows
  // Extract columns by pipe position
  // Return array of Member objects
}
```

**Serialization (back to markdown):**

```typescript
function serializeTeamFile(state: TeamState): string {
  let output = '# Team Roster\n\n> ...\n\n';
  
  output += '## Coordinator\n\n';
  output += renderTable(['Name', 'Role', 'Notes'], [state.coordinator]);
  
  output += '\n## Members\n\n';
  output += renderTable(
    ['Name', 'Role', 'Charter', 'Status'],
    state.members
  );
  
  output += '\n## Coding Agent\n\n';
  output += renderTable(
    ['Name', 'Role', 'Charter', 'Status'],
    [state.codingAgent]
  );
  
  return output;
}
```

---

## 7. MVP vs. Phase 2: Scope Roadmap

### ✅ MVP (Version 1.0)

**Timeline:** 6 weeks (subject to team capacity)

#### Features:
1. **View Roster** (Sidebar tree view)
   - Display Coordinator, Members, Coding Agent sections
   - Show member name, role, status
   - Tooltips for full details

2. **Add Member** (Context menu + input dialog)
   - Right-click on "Members" → "Add Member"
   - Prompt for name, role, status
   - Validates (no empty names, no duplicates)
   - Appends to `.squad/team.md`

3. **Remove Member** (Context menu + confirmation)
   - Right-click on member → "Remove Member"
   - Confirmation dialog
   - Deletes row from `.squad/team.md`

4. **Edit Member** (Quick inline edit or modal)
   - Right-click on member → "Edit Member"
   - Modal shows current role, status
   - User updates and saves
   - Updates `.squad/team.md`

5. **File Watcher & Auto-Refresh**
   - Detect external edits to `.squad/team.md`
   - Auto-reload and refresh UI

6. **Open Charter File**
   - Click member → opens `.squad/agents/{name}/charter.md` if exists

#### Non-Goals (Defer to Phase 2):
- Initialize / Onboarding wizard
- Webview modal for team settings
- Role templates or presets
- Member import/export
- Team analytics or activity dashboard
- Multi-workspace support

---

### 🚀 Phase 2 (Version 2.0)

**Timeline:** After MVP feedback and stabilization (3+ months)

#### Features:
1. **Initialize Squad** (Wizard)
   - Step 1: Team name, coordinator name
   - Step 2: Template selection (blank, Matrix, etc.)
   - Step 3: Initial member roster (bulk input)
   - Creates `.squad/` structure with best-practice directories

2. **Webview Modal**
   - Rich table UI for roster management
   - Inline editing without dialogs
   - Syntax highlighting for charter paths
   - Copy/paste member rows

3. **Role Templates** & **Status Badges**
   - Predefined roles (Lead / Architect, Frontend Dev, Backend Dev, Tester, etc.)
   - Role descriptions / tooltips
   - Visual status indicators (Active, Inactive, Proposed, Emeritus)

4. **Charter File Management**
   - Auto-generate `.squad/agents/{name}/charter.md` scaffold
   - Template for charter structure
   - Link validation (warn if charter path doesn't exist)

5. **Governance Insights**
   - View `.squad/decisions.md` alongside team
   - Quick-jump to agent history or skills

6. **Team Analytics** (Optional)
   - Count members by role
   - Status distribution
   - Recent changes (from git log on `.squad/team.md`)

---

## 8. Implementation Roadmap & Task Breakdown

### Week 1-2: Foundation (Tank leads)

- [ ] Initialize project structure (TypeScript, extension scaffold)
- [ ] Implement file parser & serializer
- [ ] Set up file watcher
- [ ] Registration of commands + context menus

**Tank:** Create `src/team/parser.ts`, `src/team/serializer.ts`, `src/team/watcher.ts`

### Week 2-3: Tree View & Core Commands (Tank + Trinity)

- [ ] Implement `TeamRosterProvider` (tree view)
- [ ] Wire sidebar view registration
- [ ] Implement `addMember` command + input dialog
- [ ] Implement `removeMember` command + confirmation

**Tank:** Tree view logic, command registration  
**Trinity (if available):** UI dialogs, visual polish

### Week 3-4: Edit & Refresh (Tank)

- [ ] Implement `editMember` command
- [ ] Implement `refreshRoster` command
- [ ] Test external file edits (manual edit of `.squad/team.md` in editor)
- [ ] Error handling for malformed files

**Tank:** All implementations

### Week 4-5: Initialize Command (Tank + Trinity)

- [ ] Implement `squad.initialize` (create `.squad/` + template file)
- [ ] Wizard if scope allows, else simple dialog

**Tank:** File creation, structure  
**Trinity (if available):** Dialog UX

### Week 5-6: Testing & Polish (Switch + Tank)

- [ ] Unit tests for parser, serializer, state management
- [ ] Integration tests for commands
- [ ] Manual testing on sample repos
- [ ] Error scenario testing (missing `.squad/`, malformed files)
- [ ] Performance test on large team rosters (50+ members)

**Switch:** Test plan, test cases, manual QA  
**Tank:** Bug fixes

### Pre-Release: Review & Package (Neo)

- [ ] Code review all PRs
- [ ] Verify adherence to architecture
- [ ] Package and publish to VS Code Marketplace

---

## 9. Open Questions & Milestones

1. **Charter File Linking:** Should `.squad/agents/{name}/charter.md` be auto-created, or just linked?
   - **Decision:** Start with "just link if exists" in MVP. Phase 2 can add auto-generation.

2. **Bulk Member Import:** Should initialize support CSV or JSON import?
   - **Decision:** MVP uses manual entry. Phase 2 can add import.

3. **Multi-Workspace:** Should VS Code Squad work if project is in a monorepo subdirectory?
   - **Decision:** MVP assumes `.squad/` is at workspace root. Phase 2 can search parent directories.

4. **Collaboration & Sync:** If team edits `.squad/team.md` concurrently (via git), how do we handle merge conflicts?
   - **Decision:** Git handles conflicts. Extension shows error and prompts to resolve manually.

---

## 10. Success Criteria

### MVP Complete When:
- [ ] Sidebar shows team roster (Coordinator, Members, Coding Agent)
- [ ] User can add, remove, edit members via context menu + dialogs
- [ ] Changes persist to `.squad/team.md` in valid markdown format
- [ ] External edits to `.squad/team.md` auto-refresh the UI
- [ ] No runtime errors on sample squad repositories
- [ ] Tank + Trinity have reviewed architecture and accepted scope

### Phase 2 Success Criteria:
- [ ] Initialize wizard works end-to-end
- [ ] Webview modal offers richer table UX
- [ ] Role templates & status badges are intuitive
- [ ] Charter file scaffolding works
- [ ] Users report faster team management in feedback

---

## Key Decisions

1. **Single file source of truth** (`.squad/team.md`) → easier git history, human-readable diffs
2. **Sidebar tree view MVP** → fast shipping, no complex webview state sync
3. **File watcher + in-memory state** → responsive UI without constant disk I/O
4. **Markdown table format** → consistent with squad ecosystem, no database
5. **Error recovery favors user control** → show errors, let user fix in editor
6. **Phase 2 for complex workflows** → keep MVP focused

---

## Sign-Off

This architecture is ready for team review. Trinity, Tank, Switch, Morpheus: Please review and ask clarifying questions in standup or async comments. 

**Next Step:** Tank to create initial project scaffold and share progress in `.squad/agents/tank/history.md`.

---

**Neo**  
Lead / Architect  
VS Code Squad Extension Project
