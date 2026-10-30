---
name: glab-diff
description: Fetch the diff of a GitLab MR by number using glab CLI. Use when user says "MR diff", "get the diff for MR", "show MR changes", or provides an MR number to diff.
allowed-tools: [Bash]
---

Fetch the diff for a GitLab MR and analyze the changes.

The user will provide an MR number as `$MR`. Run this command and show the results:

```bash
glab mr diff $MR --color=never
```

After showing the output, summarize: which files changed, what the changes do, and flag anything notable (breaking changes, missing tests, style issues).
