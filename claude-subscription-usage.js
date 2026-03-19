#!/usr/bin/env node

function printHelp() {
  console.log(`
Usage: claude-subscription-usage.js [options] [label1] [label2]

Options:
  --session       Show only session usage
  --week          Show only weekly usage
  --both          Show both (default)
  --no-bars       Hide progress bars
  --json          Output raw data in JSON format
  --24h           Use 24-hour time format
  --text-color=C  Set text color (default, white, light-grey, mid-grey)
  --help, -h      Show this help message

Examples:
  claude-subscription-usage.js
  claude-subscription-usage.js --session "Current"
  claude-subscription-usage.js --text-color=white --no-bars
`);
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
  const eighths = ['', '▏', '▎', '▍', '▌', '▋', '▊', '▉'];
  const totalEighths = Math.round((utilization / 100) * barLength * 8);
  const fullBlocks = Math.floor(totalEighths / 8);
  const remainder = totalEighths % 8;
  const partial = remainder > 0 ? eighths[remainder] : '';
  const empty = barLength - fullBlocks - (partial ? 1 : 0);
  return '|' + '█'.repeat(fullBlocks) + partial + ' '.repeat(empty) + '|';
}

function formatResetTime(resetTime, use24Hr = false, includeDay = false) {
  if (!resetTime) return '--:--';

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

function renderUsage(rateLimits, args) {
  const modeArg = args.find(arg => arg === '--session' || arg === '--week' || arg === '--both');
  const mode = modeArg || '--both';

  const textColorArg = args.find(arg => arg.startsWith('--text-color='));
  const textColorName = textColorArg ? textColorArg.split('=')[1] : 'light-grey';
  const textColor = TEXT_COLORS[textColorName] || TEXT_COLORS['light-grey'];

  const showBars = !args.includes('--no-bars');
  const use24Hr = args.includes('--24h');

  const session = rateLimits.five_hour?.used_percentage?.toFixed(1) || 'N/A';
  const sessionReset = formatResetTime(rateLimits.five_hour?.resets_at * 1000, use24Hr, false);

  const week = rateLimits.seven_day?.used_percentage?.toFixed(1) || 'N/A';
  const weekReset = formatResetTime(rateLimits.seven_day?.resets_at * 1000, use24Hr, true);

  if (mode === '--session') {
    const label = args.find(arg => !arg.startsWith('--')) || 'Session';
    const sessionColor = getColor(parseFloat(session));
    const bar = showBars ? `${sessionColor}${createProgressBar(parseFloat(session))}${textColor} ` : '';
    console.log(`${textColor}${label}: ${bar}${sessionColor}${session}%${textColor} (${sessionReset})${RESET}`);
  } else if (mode === '--week') {
    const label = args.find(arg => !arg.startsWith('--')) || 'Week';
    const weekColor = getColor(parseFloat(week));
    const bar = showBars ? `${weekColor}${createProgressBar(parseFloat(week))}${textColor} ` : '';
    console.log(`${textColor}${label}: ${bar}${weekColor}${week}%${textColor} (${weekReset})${RESET}`);
  } else {
    const nonFlagArgs = args.filter(arg => !arg.startsWith('--'));
    const sessionLabel = nonFlagArgs[0] || 'Session';
    const weekLabel = nonFlagArgs[1] || 'Week';
    const sessionColor = getColor(parseFloat(session));
    const weekColor = getColor(parseFloat(week));
    const sessionBar = showBars ? `${sessionColor}${createProgressBar(parseFloat(session))}${textColor} ` : '';
    const weekBar = showBars ? `${weekColor}${createProgressBar(parseFloat(week))}${textColor} ` : '';
    console.log(`${textColor}${sessionLabel}: ${sessionBar}${sessionColor}${session}%${textColor} (${sessionReset}) | ${weekLabel}: ${weekBar}${weekColor}${week}%${textColor} (${weekReset})${RESET}`);
  }
}

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(''));
  });
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  const raw = await readStdin();
  let statusData;
  try { statusData = JSON.parse(raw); } catch { console.log('No data'); return; }

  const rateLimits = statusData.rate_limits;
  if (!rateLimits) { console.log('No data'); return; }

  if (args.includes('--json')) { console.log(JSON.stringify(rateLimits, null, 2)); return; }

  renderUsage(rateLimits, args);
}

main();
