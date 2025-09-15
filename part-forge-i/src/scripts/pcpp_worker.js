// Node worker that periodically runs the Python scraper
// Requires Python and pip dependencies installed at build
const { spawn } = require('child_process');
const path = require('path');

const INTERVAL_SEC = parseInt(process.env.PCPP_INTERVAL_SEC || '900', 10);
let shuttingDown = false;

process.on('SIGINT', onSignal);
process.on('SIGTERM', onSignal);

function onSignal(sig) {
  console.log(`[pcpp-node-worker] Received ${sig}, shutting down...`);
  shuttingDown = true;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runOnce() {
  return new Promise((resolve) => {
    const cwd = path.resolve(__dirname, '../../');
    console.log(`[pcpp-node-worker] Starting ingest (cwd=${cwd})`);
    const proc = spawn('python', ['scripts/python/ingest_pcpartpicker.py'], {
      cwd,
      stdio: 'inherit',
      env: process.env,
    });
    proc.on('exit', (code, signal) => {
      console.log(`[pcpp-node-worker] Ingest exited code=${code} signal=${signal}`);
      resolve({ code, signal });
    });
  });
}

async function main() {
  console.log(`[pcpp-node-worker] Launching with interval=${INTERVAL_SEC}s`);
  while (!shuttingDown) {
    const start = Date.now();
    try {
      const { code } = await runOnce();
      if (code !== 0) {
        console.error('[pcpp-node-worker] Non-zero exit from ingest, will retry after short backoff');
        await sleep(Math.min(60000, INTERVAL_SEC * 1000));
      }
    } catch (err) {
      console.error('[pcpp-node-worker] ERROR running ingest:', err);
      await sleep(Math.min(60000, INTERVAL_SEC * 1000));
    }

    const elapsed = (Date.now() - start) / 1000;
    const remaining = INTERVAL_SEC - elapsed;
    if (remaining > 0 && !shuttingDown) {
      await sleep(remaining * 1000);
    }
  }
  console.log('[pcpp-node-worker] Stopped');
}

main().catch((e) => {
  console.error('[pcpp-node-worker] Fatal error:', e);
  process.exit(1);
});