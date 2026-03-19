# Claude Subscription Usage (for Claude Code)

> **IMPORTANT:** Requires Claude Code v2.1.80 or later.

Display your Claude Pro/Max subscription usage in your terminal status line with real-time tracking, progress bars, and color-coded warnings. Designed for Claude Code users.

## Preview

```
Current: |███████▌  | 68.0% (2:45pm) | Week: |████▍     | 37.0% (Wed 2:45pm)
```

- **Green** (< 70%): You're good
- **Yellow** (70-90%): Getting close
- **Red** (≥ 90%): Approaching limit

## Installation

```bash
curl -o ~/.local/bin/claude-subscription-usage.js https://raw.githubusercontent.com/shane-nzer/claude-subscription-usage/main/claude-subscription-usage.js
chmod +x ~/.local/bin/claude-subscription-usage.js
```

**Requirements:** Node.js, Claude Code v2.1.80+, Claude Pro/Max subscription

## Usage

```bash
# Both session and week (default)
~/.local/bin/claude-subscription-usage.js

# Session only
~/.local/bin/claude-subscription-usage.js --session

# Week only
~/.local/bin/claude-subscription-usage.js --week

# Custom labels
~/.local/bin/claude-subscription-usage.js "Current" "Weekly"

# Hide progress bars
~/.local/bin/claude-subscription-usage.js --no-bars

# 24-hour time format
~/.local/bin/claude-subscription-usage.js --24h

# Change text color
~/.local/bin/claude-subscription-usage.js --text-color=white

# Raw JSON output
~/.local/bin/claude-subscription-usage.js --json
```

## Integration

Set `statusLine.command` in `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.local/bin/claude-subscription-usage.js \"Current\" \"Week\""
  }
}
```

Claude Code pipes the statusline JSON directly to the script's stdin on each update.

### Using with ccstatusline (optional)

If you use [ccstatusline](https://github.com/sirmalloc/ccstatusline), you can add this script as a **Custom Command** widget instead — ccstatusline forwards the Claude Code statusline JSON to custom commands via stdin automatically.

1. Run `npx ccstatusline@latest`
2. Add a **Custom** → **Custom Command** widget
3. Set **command** to: `~/.local/bin/claude-subscription-usage.js "Current" "Week"`
4. Set **timeout** to at least `3000`
5. Enable **preserve colors**

## Options

| Flag | Description |
|------|-------------|
| `--session` | Show only session (5-hour block) usage |
| `--week` | Show only weekly usage |
| `--no-bars` | Hide progress bars |
| `--24h` | Use 24-hour time format (default: 12-hour) |
| `--text-color=C` | Text color: `default`, `white`, `light-grey`, `mid-grey` |
| `--json` | Output raw JSON data |
| `--help` | Show help message |

## How It Works

Reads `rate_limits.five_hour` and `rate_limits.seven_day` from Claude Code's built-in statusline JSON, which Claude Code pipes to the configured statusline command via stdin on each update. No API calls, credentials, or rate-limit handling needed.

## Troubleshooting

**"No data":**
- Means the `rate_limits` field was absent from the stdin JSON — likely an older version of Claude Code
- Upgrade to Claude Code v2.1.80 or later

## License

MIT - see [LICENSE](LICENSE)
