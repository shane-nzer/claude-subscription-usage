#!/usr/bin/env node

const { execSync } = require('child_process');
const https = require('https');

function printHelp() {
  console.log(`
Usage: claude-subscription-usage.js [options] [label1] [label2]

Options:
  --session       Show only session usage
  --week          Show only weekly usage
  --both          Show both (default)
  --no-bars       Hide progress bars
  --24h           Use 24-hour time format
  --text-color=C  Set text color (default, white, light-grey, mid-grey)
  --debug         Enable verbose error logging
  --help, -h      Show this help message

Examples:
  claude-subscription-usage.js
  claude-subscription-usage.js --session "Current"
  claude-subscription-usage.js --text-color=white --no-bars
`);
}

async function getCredentials(debug = false) {
  try {
    const output = execSync('security find-generic-password -s "Claude Code-credentials" -w', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const credentials = JSON.parse(output.trim());
    return credentials.claudeAiOauth?.accessToken;
  } catch (error) {
    if (debug) {
      console.error('\x1b[31mError fetching credentials:\x1b[0m', error.message);
    }
    return null;
  }
}

function getColor(utilization) {
  if (utilization >= 90) return '\x1b[31m'; // Red
  if (utilization >= 70) return '\x1b[33m'; // Yellow
  return '\x1b[32m'; // Green
}

const RESET = '\x1b[0m';

const TEXT_COLORS = {
  'default': '\x1b[0m',      // Terminal default
  'white': '\x1b[97m',       // Bright white
  'light-grey': '\x1b[37m',  // Light grey
  'mid-grey': '\x1b[90m',    // Mid grey (darker)
  'dark-grey': '\x1b[90m'    // Alias for mid-grey
};

function createProgressBar(utilization, barLength = 10) {
  const filled = Math.round((utilization / 100) * barLength);
  const empty = barLength - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

function formatResetTime(resetTime, use24Hr = false, includeDay = false) {
  if (!resetTime) return 'N/A';

  const reset = new Date(resetTime);
  const now = new Date();

  if (reset <= now) return 'soon';

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayStr = includeDay ? `${days[reset.getDay()]} ` : '';

  let hours = reset.getHours();
  const minutes = reset.getMinutes().toString().padStart(2, '0');

  if (use24Hr) {
    return `${dayStr}${hours.toString().padStart(2, '0')}:${minutes}`;
  } else {
    const period = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${dayStr}${hours}:${minutes}${period}`;
  }
}

async function fetchUsage(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.anthropic.com',
      path: '/api/oauth/usage',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'anthropic-beta': 'oauth-2025-04-20',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  const debug = args.includes('--debug');

  try {
    const token = await getCredentials(debug);
    if (!token) {
      console.log('N/A');
      return;
    }

    const usage = await fetchUsage(token);

    // Extract mode (--session, --week, or --both)
    const modeArg = args.find(arg => arg === '--session' || arg === '--week' || arg === '--both');
    const mode = modeArg || '--both';

    // Extract text color
    const textColorArg = args.find(arg => arg.startsWith('--text-color='));
    const textColorName = textColorArg ? textColorArg.split('=')[1] : 'light-grey';
    const textColor = TEXT_COLORS[textColorName] || TEXT_COLORS['light-grey'];

    // Check for progress bar flag (default: true)
    const showBars = !args.includes('--no-bars');

    // Check for 24-hour format flag (default: false)
    const use24Hr = args.includes('--24h');

    const session = usage.five_hour?.utilization?.toFixed(1) || 'N/A';
    const sessionReset = formatResetTime(usage.five_hour?.resets_at, use24Hr, false);

    const week = usage.seven_day?.utilization?.toFixed(1) || 'N/A';
    const weekReset = formatResetTime(usage.seven_day?.resets_at, use24Hr, true);

    if (mode === '--session') {
      // Get custom label (first non-flag arg)
      const label = args.find(arg => !arg.startsWith('--')) || 'Session';
      const sessionColor = getColor(parseFloat(session));
      const bar = showBars ? `${sessionColor}${createProgressBar(parseFloat(session))}${textColor} ` : '';
      console.log(`${textColor}${label}: ${bar}${sessionColor}${session}%${textColor} (${sessionReset})${RESET}`);
    } else if (mode === '--week') {
      // Get custom label (first non-flag arg)
      const label = args.find(arg => !arg.startsWith('--')) || 'Week';
      const weekColor = getColor(parseFloat(week));
      const bar = showBars ? `${weekColor}${createProgressBar(parseFloat(week))}${textColor} ` : '';
      console.log(`${textColor}${label}: ${bar}${weekColor}${week}%${textColor} (${weekReset})${RESET}`);
    } else {
      // Show both - get custom labels from non-flag arguments
      const nonFlagArgs = args.filter(arg => !arg.startsWith('--'));
      const sessionLabel = nonFlagArgs[0] || 'Session';
      const weekLabel = nonFlagArgs[1] || 'Week';
      const sessionColor = getColor(parseFloat(session));
      const weekColor = getColor(parseFloat(week));
      const sessionBar = showBars ? `${sessionColor}${createProgressBar(parseFloat(session))}${textColor} ` : '';
      const weekBar = showBars ? `${weekColor}${createProgressBar(parseFloat(week))}${textColor} ` : '';
      console.log(`${textColor}${sessionLabel}: ${sessionBar}${sessionColor}${session}%${textColor} (${sessionReset}) | ${weekLabel}: ${weekBar}${weekColor}${week}%${textColor} (${weekReset})${RESET}`);
    }
  } catch (error) {
    if (debug) {
      console.error('\x1b[31mError:\x1b[0m', error.message);
    }
    console.log('N/A');
  }
}

main();
