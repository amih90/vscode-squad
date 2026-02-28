# Define Agent Charters

Each agent has a **charter** at `.squad/agents/<name>/charter.md` that specifies:

- **Role** — what the agent does
- **Responsibilities** — specific tasks they handle
- **Owned Files** — file patterns they are responsible for
- **Escalation** — when and how they escalate to the coordinator

Charters help AI agents understand their scope and stay focused.

> **Tip:** Use glob patterns in "Owned Files" to define clear boundaries between agents.
