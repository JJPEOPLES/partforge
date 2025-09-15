#!/usr/bin/env python3
"""
Long-running worker that ingests PCPartPicker data on an interval.
- Uses the existing ingest_pcpartpicker.py main() each cycle
- Interval configurable via PCPP_INTERVAL_SEC (default: 900 seconds)
- Region/categories controlled by ingest script; extend as needed
"""
import os
import time
import signal
import threading

# Reuse the existing ingestion logic
import ingest_pcpartpicker as ingest

shutdown = threading.Event()


def handle_signal(signum, frame):
    print(f"[pcpp-worker] Received signal {signum}, shutting down...")
    shutdown.set()


def run_loop():
    interval = int(os.getenv("PCPP_INTERVAL_SEC", "900"))
    print(f"[pcpp-worker] Starting loop with interval={interval}s")

    while not shutdown.is_set():
        start = time.time()
        try:
            ingest.main()
            elapsed = time.time() - start
            print(f"[pcpp-worker] Ingest cycle completed in {elapsed:.1f}s")
        except Exception as e:
            print(f"[pcpp-worker] ERROR during ingest: {e}")
            # small backoff on error
            time.sleep(min(60, interval))
        # sleep remaining interval (if any)
        remaining = interval - (time.time() - start)
        if remaining > 0 and not shutdown.is_set():
            shutdown.wait(timeout=remaining)


def main():
    # Graceful shutdown hooks
    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)
    run_loop()


if __name__ == "__main__":
    main()