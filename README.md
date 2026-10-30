# terminal-setup

My terminal and coding-agent setup: pi coding-agent config, [Ghostty](https://ghostty.org), and [Starship](https://starship.rs).

Files sit at the same paths as in `$HOME`, so you can symlink them with [GNU Stow](https://www.gnu.org/software/stow/):

```bash
git clone <this repo> ~/terminal-setup
cd ~/terminal-setup
stow --restow . --no-folding
```

`--no-folding` links individual files instead of whole directories, so other files in `~/.pi/agent/skills` aren't clobbered.

## What's in here

| Path | What |
| --- | --- |
| `.pi/agent/models.json` | Model providers and per-model limits |
| `.pi/agent/settings.json` | Default model, thinking levels, packages, subagent overrides |
| `.pi/agent/AGENTS.md` | Global agent instructions (style, git, editing and search rules) |
| `.pi/agent/extensions/` | Small pi extensions (notifications, session naming, diff approval) |
| `.pi/agent/skills/` | Reusable pi skills |
| `.config/zed/` | Zed settings (vim mode, One Dark overrides, ruff/ty for Python), PyCharm-style keymap, ruff/mypy tasks |
| `.config/ghostty/` | Ghostty config and themes |
| `.config/starship.toml` | Starship prompt |
| `.config/worktrunk/config.toml` | Worktrunk project hook that bootstraps new worktrees (example, edit the project key) |

## pi setup

- **Gateway:** `models.json` points at a placeholder, `https://YOUR-GATEWAY.example.com`. Replace it with your own OpenAI/Anthropic-compatible endpoint (for example an Azure AI Foundry deployment behind API Management), and export `GATEWAY_API_KEY`.
- **Models:** Sonnet and Opus (Anthropic), DeepSeek V4 Pro/Flash and GPT-6 Luna/Sol (OpenAI-compatible). Model ids must match your deployment names.
- **Limits:** `contextWindow` is capped at 256000 and `maxTokens` at 32000. Quality drops and cost climbs on very long contexts.
- **Thinking:** the global default is `high`. Models that don't need it are overridden to `medium` in `modelThinkingLevels`. A model with no override runs at `high`, which is slow on GPT models.
- **Subagents:** `scout` and `worker` use DeepSeek Flash for speed, `reviewer` and `oracle` use Opus.

### Notes

- **Responses API:** Luna/Sol return 400 on `/v1/chat/completions` when tools and reasoning are combined, so those models use `"api": "openai-responses"` per model.
- **`cacheControlFormat`:** `"anthropic"` is the only accepted value and can't be turned off, so it lives on the DeepSeek models, not the provider. Putting it on OpenAI models causes `Unknown parameter: messages[0].content[0].cache_control`.
- **Prices** in `models.json` are approximate. Check them against your provider's price sheet.
