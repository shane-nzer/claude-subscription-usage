# Claude Subscription Usage

A lightweight Node.js script that displays your Claude Pro/Max subscription usage directly in your terminal status line. Shows both current session (5-hour block) and weekly usage with dynamic color-coding and time-until-reset.

Perfect for integration with [ccstatusline](https://github.com/sirmalloc/ccstatusline) or any other Claude Code status line tool.

## Features

- 📊 **Real-time Usage Tracking** - Shows current session and weekly subscription usage percentages
- ⏰ **Reset Timers** - Displays time remaining until your usage limits reset
- 🎨 **Dynamic Color Coding** - Automatically changes color based on usage (green → yellow → red)
- ⚙️ **Highly Configurable** - Customize labels, colors, and display modes
- 🚀 **Fast & Lightweight** - Sub-second API calls, minimal dependencies
- 🔐 **Secure** - Uses your existing Claude Code credentials from macOS Keychain

## Preview

```
Current: 68.0% (1h 45m) | Week: 37.0% (17h 45m)
```

Colors automatically adjust:
- **Green** (< 70%): You're good!
- **Yellow** (70-90%): Getting close to limits
- **Red** (≥ 90%): Approaching limit, use carefully

## Installation

### Prerequisites

- macOS (uses macOS Keychain for credentials)
- Node.js installed
- Active Claude Pro or Max subscription
- Authenticated with Claude Code CLI

### Setup

1. **Clone or download this script:**
   ```bash
   curl -o ~/claude-subscription-usage.js https://raw.githubusercontent.com/YOUR_USERNAME/claude-subscription-usage/main/claude-subscription-usage.js
   chmod +x ~/claude-subscription-usage.js
   ```

2. **Test it:**
   ```bash
   ~/claude-subscription-usage.js
   ```

   You should see output like: `Session: 45.2% (3h 15m) | Week: 23.0% (2d 4h)`

## Usage

### Basic Usage

```bash
# Show both session and week (default)
~/claude-subscription-usage.js

# Show only session
~/claude-subscription-usage.js --session

# Show only week
~/claude-subscription-usage.js --week
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

1. **Retrieves OAuth Token**: Reads your Claude Code credentials from macOS Keychain
2. **Calls Anthropic API**: Makes a request to `https://api.anthropic.com/api/oauth/usage`
3. **Formats Output**: Displays usage percentages with time-until-reset and dynamic colors
4. **Updates Automatically**: Your status line tool calls the script on each refresh

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

If you see `N/A`, check:
1. You're authenticated with Claude Code (`claude` command works)
2. You have an active Pro/Max subscription
3. Claude Code credentials are in Keychain: `security find-generic-password -s "Claude Code-credentials"`

### Script Hangs or Times Out

The script has a 3-second timeout for the API call. If it's timing out:
- Check your internet connection
- The Anthropic API might be experiencing issues

### Colors Not Showing in ccstatusline

Make sure you enabled "preserve colors" (press `p` in the Custom Command editor).

## Platform Compatibility

Currently supports **macOS only** because it uses the macOS Keychain to retrieve credentials.

Contributions welcome for Linux/Windows support! See the "Contributing" section.

## Related Tools

- [Claude Code](https://code.claude.com/) - Official Claude CLI
- [ccstatusline](https://github.com/sirmalloc/ccstatusline) - Beautiful customizable status line for Claude Code
- [ccusage](https://github.com/ryoppippi/ccusage) - API usage tracking (token-based, not subscription)

## Contributing

Contributions are welcome! Areas for improvement:

- [ ] Linux support (different credential storage)
- [ ] Windows support (different credential storage)
- [ ] Configuration file support
- [ ] More color themes
- [ ] Verbose/debug mode

## License

MIT License - see [LICENSE](LICENSE) file for details

## Author

Created to solve the problem of monitoring Claude subscription usage without constantly running `/usage` in Claude Code.

## Disclaimer

This script uses an undocumented Anthropic API endpoint. While it works as of January 2026, Anthropic could change or remove this endpoint at any time. Use at your own discretion.
