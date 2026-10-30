---
name: scope-changes
description: Generate QA scope summary of affected user-facing areas from git diff
---

# Generate QA Scope Summary

Analyze the git diff and list the affected user-facing areas in plain English bullet points only.

If a task description is provided, use it to enhance your analysis and ensure the scope captures the specific areas affected by the task.

Output format - just a few bullet points describing what areas of the app are affected from a user perspective:

- Area of app that changed

No headings, no technical details, no explanations. Just the affected areas.

**Output must be 500 characters or fewer total.** Trim bullets to fit.

---

## Usage
- `/scope-changes` - Analyze diff without task context
- `/scope-changes "your task description here"` - Analyze diff with task context for more accurate scope

## Optional Task Description
If provided as an argument, integrate it into your analysis to provide more contextual and accurate scope identification.
