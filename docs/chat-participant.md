# Chat Participant (`@squad`)

Squad includes a VS Code Chat participant that lets you manage squads, query agents, and assign tasks — all from the chat panel.

## Opening the Chat

Open the Chat panel (`Cmd+Shift+I` / `Ctrl+Shift+I`) and type `@squad`. The participant is **sticky**, so once you select it, subsequent messages in the conversation stay directed at Squad.

## Commands

### `/status` — Squad Overview

```
@squad /status
```

Shows the active squad's name, health score, task counts, and a table of all agents with their status. Includes a button to open the full dashboard.

**Example output:**

```
## 🏢 my-squad

Agents: 5
Health: 85/100
Tasks: 12/15

| Agent    | Role        | Status   |
|----------|-------------|----------|
| 🎯 Lead  | Coordinator | ✓ active |
| ⚙️ Backend | Backend Dev | ✓ active |
| 🎨 Frontend | Frontend Dev | ○ idle  |
```

### `/switch [name]` — Switch Squad

```
@squad /switch
@squad /switch backend-team
```

- **No argument:** Lists all squads with the active one marked
- **With name:** Switches to the matching squad (supports partial matching)
- **Ambiguous match:** Shows candidates and a fallback picker button

**Examples:**
```
@squad /switch             → lists all squads
@squad /switch backend     → switches to "backend-team" if unambiguous
@squad /switch ba          → shows all squads containing "ba"
```

### `/assign [task]` — Assign Tasks

```
@squad /assign review the authentication module
@squad /assign @backend fix the database connection pooling
```

- **Without `@agent`:** Assigns the task to **every agent** in the squad
- **With `@agent`:** Assigns only to the named agent
- Shows queue IDs for tracking

**Examples:**
```
@squad /assign write unit tests for utils/        → all agents
@squad /assign @tester write unit tests for utils/ → tester only
@squad /assign @frontend fix the responsive layout → frontend only
```

### `/roster` — Full Roster

```
@squad /roster
```

Shows a detailed view of every agent:
- Emoji and name
- Role
- Current status
- Charter summary (if set)
- Current task (if assigned)

### `/agents [name]` — Agent List & Details

```
@squad /agents
@squad /agents backend
```

- **No argument:** Lists all agents with status icons and an "Open" button for each
- **With name:** Shows a detailed view of the specific agent including:
  - Role, status, charter
  - Task statistics (completed/failed)
  - Pending task list with queue IDs
  - Buttons: "Open Detail", "Edit Charter"

**Example:**
```
@squad /agents backend

## ⚙️ Backend
Role: Backend Dev
Status: active
Charter: Server-side logic, APIs, and data layer
Stats: 8 completed, 1 failed

Pending tasks (2):
- cmd-1709xyz review src/api/auth.ts (queued)
- cmd-1709abc fix connection pooling (running)

[Open Detail] [Edit Charter]
```

### Default (no command)

```
@squad
@squad hello
```

Shows help: active squad info and a list of all available commands.

## Tips

- The participant is **sticky** — once you start a conversation with `@squad`, you don't need to re-type it for every message
- Use `/switch` to change context before other commands
- `/assign` without an `@agent` prefix broadcasts to every agent — useful for squad-wide tasks like "update docs" or "run lint"
- `/agents <name>` accepts partial matches, so `@squad /agents back` will find "backend"
