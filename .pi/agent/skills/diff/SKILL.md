---
name: diff
description: Check the diff between the current branch and master
allowed-tools: [Bash]
---

Analyze diff between current branch and master. Use caveman mode: terse, fragments OK, drop articles/filler. State what changed and why it matters. No summaries of obvious things.

Here is the diff output:
!git diff master...HEAD