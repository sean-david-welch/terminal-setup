import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

// Auto-name new sessions after the current git branch, plus a /branch-name
// command to (re)name any session from the current branch on demand.
export default function (pi: ExtensionAPI) {
  async function branchSessionName(cwd: string): Promise<string | null> {
    let branch: string;
    try {
      const result = await pi.exec("git", ["-C", cwd, "rev-parse", "--abbrev-ref", "HEAD"]);
      if (result.code !== 0) return null;
      branch = result.stdout.trim();
    } catch {
      return null;
    }

    // Skip when not on a branch (empty or detached HEAD).
    if (!branch || branch === "HEAD") return null;

    // Human-readable timestamp suffix to disambiguate same-branch sessions.
    const stamp = new Date().toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${branch} \u00b7 ${stamp}`;
  }

  pi.on("session_start", async (event, ctx) => {
    // Only name fresh sessions; never clobber a resumed/reloaded name.
    if (event.reason !== "startup" && event.reason !== "new" && event.reason !== "fork") {
      return;
    }
    if (pi.getSessionName()) return;

    const name = await branchSessionName(ctx.cwd);
    if (name) pi.setSessionName(name);
  });

  pi.registerCommand("branch-name", {
    description: "Rename this session after the current git branch",
    handler: async (_args, ctx) => {
      const name = await branchSessionName(ctx.cwd);
      if (name) {
        pi.setSessionName(name);
        ctx.ui.notify(`Session named: ${name}`, "info");
      } else {
        ctx.ui.notify("Not on a git branch (or git failed)", "warn");
      }
    },
  });
}
