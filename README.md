# Claude Subscription Usage (for Claude Code)

Display your Claude Pro/Max subscription usage in your terminal status line (works great with [ccstatusline](https://github.com/sirmalloc/ccstatusline)) with real-time tracking, progress bars, and color-coded warnings. Designed for Claude Code users.

## Preview

```
Current: ███████░░░ 68.0% (2:45pm) | Week: ████░░░░░░ 37.0% (Wed 2:45pm)
```

- **Green** (< 70%): You're good
- **Yellow** (70-90%): Getting close
- **Red** (≥ 90%): Approaching limit

## Installation

```bash
curl -o ~/claude-subscription-usage.js https://raw.githubusercontent.com/shane-nzer/claude-subscription-usage/main/claude-subscription-usage.js
chmod +x ~/claude-subscription-usage.js
```

**Requirements:** macOS, Node.js, Claude Pro/Max subscription, authenticated with Claude Code CLI

## Usage

```bash
# Both session and week (default)
~/claude-subscription-usage.js

# Session only
~/claude-subscription-usage.js --session

# Week only
~/claude-subscription-usage.js --week

# Custom labels
~/claude-subscription-usage.js "Current" "Weekly"

# Hide progress bars
~/claude-subscription-usage.js --no-bars

# 24-hour time format
~/claude-subscription-usage.js --24h

# Change text color
~/claude-subscription-usage.js --text-color=white

# Raw JSON output
~/claude-subscription-usage.js --json
```

## Integration with [ccstatusline](https://github.com/sirmalloc/ccstatusline)

1. Run `npx ccstatusline@latest` (or `bunx ccstatusline@latest`)
2. Add a **Custom Command** widget
3. Set command to: `~/claude-subscription-usage.js "Current" "Week"`
4. Set timeout to: `5000`
5. Enable "preserve colors"

## Options

| Flag | Description |
|------|-------------|
| `--session` | Show only session (5-hour block) usage |
| `--week` | Show only weekly usage |
| `--no-bars` | Hide progress bars |
| `--24h` | Use 24-hour time format (default: 12-hour) |
| `--text-color=C` | Text color: `default`, `white`, `light-grey`, `mid-grey` |
| `--json` | Output raw JSON data |
| `--debug` | Show verbose error logging |
| `--help` | Show help message |

## How It Works

Uses an undocumented Anthropic OAuth API (`https://api.anthropic.com/api/oauth/usage`) to fetch your subscription usage. Retrieves your OAuth token from macOS Keychain automatically.

## Troubleshooting

**"N/A" output:**
- Make sure you're authenticated with Claude Code
- Check you have an active Pro/Max subscription

**Timeouts:**
- Run with `--debug` to see error details
- API might be experiencing issues

**Linux/Windows:**
- Set `CLAUDE_OAUTH_TOKEN` environment variable with your token

## License

MIT - see [LICENSE](LICENSE)

## Disclaimer

Uses an undocumented API endpoint that could change at any time.
