Log the meaningful actions from this conversation to JOURNAL.md in the current working directory.

A "meaningful action" is one of:
- A file was created, edited, or deleted
- A command was run that changed system or project state
- A decision or approach was chosen (and why)
- A bug was found or fixed
- A dependency was added or removed
- A configuration was changed
- A new feature or component was implemented

Steps:
1. Review the conversation so far and identify all meaningful actions taken.
2. If JOURNAL.md does not exist in the current working directory, create it with a `# Journal` heading.
3. Append a new entry block at the bottom of JOURNAL.md using this format:

```
## YYYY-MM-DD HH:MM — <one-line summary of the session>

- **<action verb>**: <what was done and why, in one sentence>
- **<action verb>**: <what was done and why, in one sentence>
...
```

Use today's date and the current time. Group related actions under one entry block per session/invocation. Use action verbs like: Created, Edited, Deleted, Ran, Fixed, Added, Removed, Configured, Implemented, Decided.

Do not repeat entries that are already in JOURNAL.md. Do not log trivial read-only actions like listing files or reading code.
