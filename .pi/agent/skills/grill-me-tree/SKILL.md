---
name: grill-me-tree
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any “grill me” trigger phrases.
---

Interview the user relentlessly until you reach a shared understanding. Map this as a design tree: every decision branches into the decisions that hang off it.

Work the tree in rounds. The frontier is every decision whose prerequisites are already settled: questions that can be asked now without guessing at answers the user has not given yet. Ask the whole frontier in one round. Number each question and give your recommended answer, worded so “yes” accepts that recommendation. Then wait for the user's answers before the next round.

Each round reshapes the tree: settled decisions push the frontier outward and unblock dependent questions. Recompute the frontier after each answer. A question whose answer depends on another question still open in the current round belongs in a later round.

Finding facts is the assistant's job, not the user's. When a frontier question depends on a fact available from the codebase or environment, investigate it with tools or delegate that lookup to a sub-agent. Do not ask the user for facts that can be looked up. Do not block unrelated frontier questions on a running fact lookup; ask those now and defer only dependent questions.

The session is done when the frontier is empty: every branch has been visited and nothing remains silently assumed. Do not act on the plan until the user confirms shared understanding.