#!/usr/bin/env node

const { execSync } = require('child_process');
const https = require('https');

async function getCredentials() {
  try {
    const output = execSync('security find-generic-password -s "Claude Code-credentials" -w', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const credentials = JSON.parse(output.trim());
    return credentials.claudeAiOauth?.accessToken;
  } catch (error) {
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

function formatTimeRemaining(resetTime) {
  if (!resetTime) return 'N/A';

  const now = new Date();
  const reset = new Date(resetTime);
  const diff = reset - now;

  if (diff <= 0) return 'soon';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }

  return `${hours}h ${minutes}m`;
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
    req.setTimeout(3000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

async function main() {
  try {
    const token = await getCredentials();
    if (!token) {
      console.log('N/A');
      return;
    }

    const usage = await fetchUsage(token);

    const args = process.argv.slice(2);

    // Extract mode (--session, --week, or --both)
    const modeArg = args.find(arg => arg === '--session' || arg === '--week' || arg === '--both');
    const mode = modeArg || '--both';

    // Extract text color
    const textColorArg = args.find(arg => arg.startsWith('--text-color='));
    const textColorName = textColorArg ? textColorArg.split('=')[1] : 'light-grey';
    const textColor = TEXT_COLORS[textColorName] || TEXT_COLORS['light-grey'];

    const session = usage.five_hour?.utilization?.toFixed(1) || 'N/A';
    const sessionReset = formatTimeRemaining(usage.five_hour?.resets_at);

    const week = usage.seven_day?.utilization?.toFixed(1) || 'N/A';
    const weekReset = formatTimeRemaining(usage.seven_day?.resets_at);

    if (mode === '--session') {
      // Get custom label (first non-flag arg)
      const label = args.find(arg => !arg.startsWith('--')) || 'Session';
      const sessionColor = getColor(parseFloat(session));
      console.log(`${textColor}${label}: ${sessionColor}${session}%${textColor} (${sessionReset})${RESET}`);
    } else if (mode === '--week') {
      // Get custom label (first non-flag arg)
      const label = args.find(arg => !arg.startsWith('--')) || 'Week';
      const weekColor = getColor(parseFloat(week));
      console.log(`${textColor}${label}: ${weekColor}${week}%${textColor} (${weekReset})${RESET}`);
    } else {
      // Show both - get custom labels from non-flag arguments
      const nonFlagArgs = args.filter(arg => !arg.startsWith('--'));
      const sessionLabel = nonFlagArgs[0] || 'Session';
      const weekLabel = nonFlagArgs[1] || 'Week';
      const sessionColor = getColor(parseFloat(session));
      const weekColor = getColor(parseFloat(week));
      console.log(`${textColor}${sessionLabel}: ${sessionColor}${session}%${textColor} (${sessionReset}) | ${weekLabel}: ${weekColor}${week}%${textColor} (${weekReset})${RESET}`);
    }
  } catch (error) {
    console.log('N/A');
  }
}

main();
