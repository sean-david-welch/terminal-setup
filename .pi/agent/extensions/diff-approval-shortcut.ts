import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

// Ctrl+Shift+A toggles pi-show-diffs auto-approve mid-conversation.
//
// pi-show-diffs keeps its config in memory (only re-read on session_start), so
// editing its JSON from here wouldn't take effect. Instead, run its own
// `/diff-approval toggle` command: put it in the editor and feed a synthetic
// Enter through stdin. Extension commands execute immediately, even while the
// agent is streaming. Any draft in the editor is restored afterwards.
//
// On success pi-show-diffs itself notifies ("Auto-approve is ON/Manual diff
// review is ON") and updates its status line; we only report failure.
const COMMAND = "/diff-approval toggle";

export default function (pi: ExtensionAPI) {
  pi.registerShortcut("ctrl+shift+a", {
    description: "Toggle pi-show-diffs auto-approve",
    handler: (ctx) => {
      const draft = ctx.ui.getEditorText();
      ctx.ui.setEditorText(COMMAND);
      process.stdin.emit("data", "\r");
      // Wait for pi to clear the editor on submit, then put the draft back.
      let tries = 0;
      const timer = setInterval(() => {
        const text = ctx.ui.getEditorText();
        if (text === COMMAND && ++tries < 20) return;
        clearInterval(timer);
        if (text === COMMAND) {
          ctx.ui.notify("Ctrl+Shift+A: toggle didn't submit — press Enter to run it", "warning");
        } else if (draft && !text) {
          ctx.ui.setEditorText(draft);
          // setEditorText doesn't redraw; setStatus does (no-op key).
          ctx.ui.setStatus("diff-approval-shortcut", undefined);
        }
      }, 25);
    },
  });
}
