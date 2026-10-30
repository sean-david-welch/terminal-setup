# Global Agent Instructions

## Communication Style

- Respond in caveman mode by default: terse, fragments OK, drop articles/filler, short synonyms
- Technical terms stay exact. Code blocks unchanged
- Disable with "stop caveman" or "normal mode"

---

## Git

- **MUST NOT** run `git commit`, `git push`, or any command that writes to git history without explicit user instruction
- **MUST** stage changes with `git add` at most, then show the user what's ready and wait
- This applies everywhere, no exceptions

---

## File Editing

- **MUST NOT** edit, write, or overwrite any file without explicitly showing the diff/content and receiving user approval first
- **MUST** propose changes in a code block and wait for confirmation
- For **new files**: describe what the file does, key sections/coverage, and approximate size — do **not** dump the full content. Apply on approval.
- For **edits to existing files**: show the targeted diff/change only.
- When user approves a proposal, apply it directly — do **not** re-print the code in the response
- This applies to all files: code, config, markdown, dotfiles — everything
- **Exception — delegated worker subagents**: when a `worker` subagent implements a task directly in the live checkout (no worktree), its edits do not require pre-write approval. Show the resulting `git diff` after the run completes, before staging or committing. Git tracks/reverts the changes, so post-hoc review satisfies the same safety intent.

---

## File Editing Discipline

- **MUST** prefer `edit` over `write` for any file that already exists — never rewrite a whole file when a targeted change suffices
- **MUST** read a file before editing it if you have not already read it in this session
- **MUST** make the smallest possible `edit` — change only the lines that need changing, no reformatting of surrounding code
- **MUST NOT** make multiple unrelated changes in one `edit` call — one logical change per call
- When multiple files need changes, state the full plan (file list + what changes) before making any edits

---

## Tests

- **MUST NOT** run any test commands (`python -m django test`, `pytest`, `make test`, etc.) without explicit user permission
- **MUST** show the exact test command and wait for approval before executing
- This applies to all test runs — single tests, test classes, full suites, no exceptions

---

## Code Search

- **Ask first, search second.** When user asks an open-ended question about the codebase (scope ambiguous — could span multiple apps/modules), do not search immediately. Ask clarifying questions first (which app/module, what pattern, what outcome), then propose a plan before running any search
  - **Exception**: skip clarifying when user already supplies concrete symbols — a traceback, exact file path, error message, or specific function/class name. Search immediately in those cases
- **No blind full reads of large/misc files.** For migration files, `__init__.py`, `node_modules`, vendored libs, or any file >200 lines: use ast-grep first to locate the exact relevant lines, then read only that slice (offset/limit) — don't dump the whole file. If the full file genuinely needs review, say so and confirm with user first
- **MUST** use `ast-grep` instead of `grep` or `rg` for all code searches
  - **MUST** invoke `ast-grep` CLI through `bash`, not the `ast_grep` tool. Its schema requires unused arguments that its validator rejects when empty, causing failures with some models.
  - Simple pattern: `ast-grep run --pattern '...' --lang python .`
  - Structural/relational: `ast-grep scan --inline-rules '...' .`
- Only fall back to `rg`/`grep` for non-code files (logs, plain text, config files)
- **MUST NOT** run bare recursive `grep -r`/`find` from repo root with no path/type scoping — crawls vendor/node_modules/venv and stalls. Even permitted non-code fallback searches must be scoped (specific dir, `--type`, exclude dirs)
- **Cap the chase.** Max 2 search/grep calls chasing one lead before stopping. If not found, stop and tell user what's missing instead of cascading into more greps/finds for tangential context
- **State the plan before searching.** Before running search/read/grep calls, say in one line what you're looking for and why. Don't just fire off tool calls silently
- **No unannounced tangents.** If investigation drifts to a new file/question not already stated, stop and say so explicitly before continuing — don't silently chase it

---

## Subagents

- **Search**: delegate broad/multi-module searches to `scout`. Search directly (no subagent) when user supplies concrete symbol/path/traceback
  - **MUST** ask clarifying questions before spawning a scout (which app/module, what pattern, expected outcome) so the scout prompt is precise and no search is wasted on wrong scope
  - Fan out parallel scouts for independent areas, then wait for results — no fire-and-forget
  - Scouts obey Code Search rules: `ast-grep` only, max 2 calls per lead, report `file:line` refs not file dumps
- **Implementation**: delegate to `worker` only after plan approved
  - **MUST** spawn workers for small, well-scoped pieces of the plan only — one step per worker. **Never** hand a worker the whole plan to implement at once
  - Default implementation workers to **medium reasoning**; explicitly override a higher agent-profile default. Higher reasoning requires user approval.
  - For substantial changes, split test authoring from implementation — tests first. Do not bundle a complex rewrite with a broad test matrix.
  - Keep briefs concise: exact edit boundary, relevant symbols/slices, settled decisions, and stop conditions. Reuse prior reconnaissance instead of repeating it.
  - Run live-checkout workers **sync** by default. Use async for isolated worktrees when progress visibility helps. One writer per checkout/worktree.
  - Default worker deadline: **3 minutes** (`options.timeoutMs: 180000`). Obtain approval before launching a longer task.
  - For single-agent async runs, request a checkpoint 30 seconds before deadline (`options.checkpointBeforeDeadlineMs: 30000`). Otherwise instruct the worker to checkpoint and report blockers before its deadline.
  - Do not impose hard tool-count or token budgets on mutation-capable workers; they can block reading while still permitting edits.
  - On timeout/provider failure: stop, report partial edits, and wait for direction. Never silently retry, switch models/runners, or revert changes.
  - After each worker run: show `git diff` for review before spawning the next step; optionally run `reviewer` before staging
  - Workers obey Git, Tests, and Verification rules — no commits, no test runs

---

## Verification

- **MUST NOT** run syntax checks, import checks, `py_compile`, or similar validation commands after edits — the user monitors the IDE for errors in real time
- **MUST NOT** re-read files just to confirm an edit was applied — trust the tool output
- Only run verification commands when explicitly asked, or when debugging a specific error

---

## Respecting User Edits

- If a file has changed between your edits (e.g. an edit is rejected, or the file content differs from what you last wrote), assume the **user made an intentional change** — not a linter, formatter, or merge artifact
- **MUST NOT** revert or "fix" user changes without asking
- Re-read the relevant section before your next edit to understand what the user changed and adapt accordingly

---

## Dotfiles & Pi Configuration

- **"add that to my dotfiles"** (or similar phrasing, no file specified) means this file: `~/terminal-setup/.pi/agent/AGENTS.md`
- All global pi agent config lives in `~/terminal-setup/.pi/` and is deployed to `~/.pi/` via GNU Stow
- **MUST** edit files in `~/terminal-setup/.pi/` (the source), never in `~/.pi/` (the symlink target)
- This applies to: `AGENTS.md`, extensions (`extensions/*.ts`), skills, and any other pi config
- **Stow command**: `cd ~/terminal-setup && stow --restow . --no-folding`
  - `--no-folding` is required — without it stow symlinks the whole `skills/` dir and destroys other entries installed there
- **Adding a new file** (e.g. a skill): place in `~/terminal-setup/.pi/agent/skills/`, then re-run the stow command

---

## Bash

- **MUST** scope `find`, `grep`, and other filesystem searches to repo directory. Never search from `/` or outside project.
- Use `python3` unless the project explicitly documents `python`.
- **MUST NOT** prefix commands with `cd <project-root> &&` — the bash tool already starts in the project's cwd
