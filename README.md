# Claude Subscription Usage

A lightweight Node.js script that displays your Claude Pro/Max subscription usage directly in your terminal status line. Shows both current session (5-hour block) and weekly usage with dynamic color-coding and time-until-reset.

Perfect for integration with [ccstatusline](https://github.com/sirmalloc/ccstatusline) or any other Claude Code status line tool.

## Features

- 📊 **Real-time Usage Tracking** - Shows current session and weekly subscription usage percentages
- ⏰ **Absolute Reset Times** - Displays the exact time when your usage limits will reset
- 🎨 **Dynamic Color Coding** - Automatically changes color based on usage (green → yellow → red)
- 📊 **Progress Bars** - Visual block-style progress bars for at-a-glance usage monitoring
- 🛠️ **JSON Output** - Export raw data for integration with custom tools and dashboards
- ⚙️ **Highly Configurable** - Customize labels, colors, time format (12h/24h), and display modes
- 🚀 **Fast & Lightweight** - Sub-second API calls, minimal dependencies
- 🔐 **Secure** - Uses your existing Claude Code credentials from macOS Keychain (or env var)

## Preview

```
Current: ███████░░░ 68.0% (2:45pm) | Week: ████░░░░░░ 37.0% (Wed 2:45pm)
```

Colors automatically adjust:
- **Green** (< 70%): You're good!
- **Yellow** (70-90%): Getting close to limits
- **Red** (≥ 90%): Approaching limit, use carefully

## Installation

### Prerequisites

- Node.js installed
- Active Claude Pro or Max subscription
- **macOS**: Authenticated with Claude Code CLI (uses Keychain)
- **Linux/Windows**: Manually supplied OAuth token (see Advanced Usage)

### Setup

1. **Clone or download this script:**
   ```bash
   curl -o ~/claude-subscription-usage.js https://raw.githubusercontent.com/shane-nzer/claude-subscription-usage/main/claude-subscription-usage.js
   chmod +x ~/claude-subscription-usage.js
   ```

2. **Test it:**
   ```bash
   ~/claude-subscription-usage.js
   ```

   You should see output like: `Session: █████░░░░░ 45.2% (3:15pm) | Week: ██░░░░░░░░ 23.0% (Fri 4:00pm)`

## Usage

### Basic Usage

```bash
# Show help and all options
~/claude-subscription-usage.js --help

# Show both session and week (default)
~/claude-subscription-usage.js

# Show only session
~/claude-subscription-usage.js --session

# Show only week
~/claude-subscription-usage.js --week

# Debug mode (verbose error logging)
~/claude-subscription-usage.js --debug
```

### Time Format

By default, times are shown in 12-hour format (e.g., `2:30pm`). You can switch to 24-hour format:

```bash
# Use 24-hour format
~/claude-subscription-usage.js --24h
```

### Custom Labels

```bash
# Custom labels for both
~/claude-subscription-usage.js "Current" "Week"

# Custom label for session only
~/claude-subscription-usage.js --session "5hr Block"

# Custom label for week only
~/claude-subscription-usage.js --week "Weekly"
```

### Text Color Options

By default, the script uses `light-grey` for labels and times. You can customize this:

```bash
# Light grey (default)
~/claude-subscription-usage.js --text-color=light-grey "Current" "Week"

# White (brightest)
~/claude-subscription-usage.js --text-color=white "Current" "Week"

# Terminal default color
~/claude-subscription-usage.js --text-color=default "Current" "Week"

# Mid grey (darker)
~/claude-subscription-usage.js --text-color=mid-grey "Current" "Week"
```

Available colors: `default`, `white`, `light-grey`, `mid-grey`

## Advanced Usage

### JSON Output

For integration with other tools (like Waybar, Polybar, or custom scripts), you can output the raw data in JSON format:

```bash
~/claude-subscription-usage.js --json
```

Output:
```json
{
  "five_hour": { "utilization": 45.2, "resets_at": "..." },
  "seven_day": { "utilization": 23.0, "resets_at": "..." }
  ...
}
```

### Environment Variables (Linux/Windows Support)

If you are not on macOS or want to manually supply the token, you can use the `CLAUDE_OAUTH_TOKEN` environment variable.

1.  **Get your token:**
    - If you have `claude` installed on macOS, run: `security find-generic-password -s "Claude Code-credentials" -w`
    - Or find it in your local configuration files if stored differently.

2.  **Run with token:**
    ```bash
    export CLAUDE_OAUTH_TOKEN="your-token-here"
    ~/claude-subscription-usage.js
    ```

## Integration with ccstatusline

[ccstatusline](https://github.com/sirmalloc/ccstatusline) is a beautiful status line formatter for Claude Code. Here's how to add subscription usage to it:

1. **Run ccstatusline configuration:**
   ```bash
   npx ccstatusline@latest
   # or
   bunx ccstatusline@latest
   ```

2. **Add a Custom Command widget:**
   - Navigate to add a widget
   - Choose "Custom Command"
   - Set command to: `~/claude-subscription-usage.js "Current" "Week"`
   - Set timeout to: `5000` (5 seconds)
   - Enable "preserve colors" (press `p`) to keep the dynamic color coding

3. **Optional - Separate widgets for individual coloring:**

   Create two widgets for more control:

   **Widget 1 - Session:**
   - Command: `~/claude-subscription-usage.js --session "Current"`
   - Timeout: `5000`
   - Preserve colors: enabled

   **Widget 2 - Week:**
   - Command: `~/claude-subscription-usage.js --week`
   - Timeout: `5000`
   - Preserve colors: enabled

## How It Works

1. **Retrieves OAuth Token**: Checks `CLAUDE_OAUTH_TOKEN` env var, then tries macOS Keychain.
2. **Calls Anthropic API**: Requests `https://api.anthropic.com/api/oauth/usage`.
3. **Formats Output**: Displays usage percentages with absolute reset times and dynamic colors.

## API Response

The script queries an undocumented Anthropic OAuth API endpoint that returns:

```json
{
  "five_hour": {
    "utilization": 68.0,
    "resets_at": "2026-01-16T20:30:00Z"
  },
  "seven_day": {
    "utilization": 37.0,
    "resets_at": "2026-01-17T12:00:00Z"
  }
}
```

## Color Thresholds

The percentage values change color based on usage:

| Usage | Color | ANSI Code |
|-------|-------|-----------|
| < 70% | Green | `\x1b[32m` |
| 70-90% | Yellow | `\x1b[33m` |
| ≥ 90% | Red | `\x1b[31m` |

## Troubleshooting

### "N/A" Output

If you see `N/A`, try running with the debug flag to see the actual error:
```bash
~/claude-subscription-usage.js --debug
```

Common causes:
1. Not authenticated with Claude Code.
2. Expired or invalid token.
3. Network issues.

### Colors Not Showing in ccstatusline

Make sure you enabled "preserve colors" (press `p` in the Custom Command editor).

## Platform Compatibility

- **macOS**: Native support (automatically pulls credentials from Keychain).
- **Linux / Windows**: Supported via `CLAUDE_OAUTH_TOKEN` environment variable.

## Related Tools

- [Claude Code](https://code.claude.com/) - Official Claude CLI
- [ccstatusline](https://github.com/sirmalloc/ccstatusline) - Beautiful customizable status line for Claude Code
- [ccusage](https://github.com/ryoppippi/ccusage) - API usage tracking (token-based, not subscription)

## Contributing

Contributions are welcome! Areas for improvement:

- [ ] Configuration file support
- [ ] More color themes

## License

MIT License - see [LICENSE](LICENSE) file for details

## Author

Created to solve the problem of monitoring Claude subscription usage without constantly running `/usage` in Claude Code.

## Disclaimer

This script uses an undocumented Anthropic API endpoint. While it works as of January 2026, Anthropic could change or remove this endpoint at any time. Use at your own discretion.
