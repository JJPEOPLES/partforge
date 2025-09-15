#!/usr/bin/env python3
"""
Ingest parts from the bundled pcpartpicker scraper into Postgres (Neon).
- Region: US
- Normalizes minimal fields and upserts into 'parts'
- Creates/uses retailer 'pcpartpicker' and writes a synthetic offer per part

Run locally:
  # Ensure Python 3.10+
  pip install -r pcpartpicker/requirements.txt psycopg2-binary python-dotenv
  # Ensure DATABASE_URL is set (.env.local works if you run via `python -m dotenv.run ...`)
  python scripts/python/ingest_pcpartpicker.py

On Render.com:
  - Create a Cron Job (or Background Worker) using Python runtime
  - Add env: DATABASE_URL
  - Command: python scripts/python/ingest_pcpartpicker.py
"""
import os
import sys
import time
from decimal import Decimal

import psycopg2
from psycopg2.extras import RealDictCursor

# Add local pcpartpicker package to import path
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PCPP_PATH = os.path.join(REPO_ROOT, 'pcpartpicker')
if PCPP_PATH not in sys.path:
    sys.path.insert(0, PCPP_PATH)

from pcpartpicker import API  # type: ignore

DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    # Try loading from .env.local manually if present
    env_local = os.path.join(REPO_ROOT, '.env.local')
    if os.path.exists(env_local):
        with open(env_local, 'r') as f:
            for line in f:
                if line.strip().startswith('DATABASE_URL'):
                    key, _, value = line.partition('=')
                    os.environ[key.strip()] = value.strip()
                    break
    DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print('ERROR: DATABASE_URL not set. Aborting.')
    sys.exit(1)

SUPPORTED = [
    'cpu', 'video-card', 'motherboard', 'memory', 'internal-hard-drive', 'power-supply'
]

CATEGORY_MAP = {
    'cpu': 'cpu',
    'video-card': 'gpu',
    'motherboard': 'motherboard',
    'memory': 'ram',
    'internal-hard-drive': 'storage',
    'power-supply': 'psu',
}

PCPP_CATEGORY_URL = {
    'cpu': 'https://pcpartpicker.com/products/cpu/',
    'video-card': 'https://pcpartpicker.com/products/video-card/',
    'motherboard': 'https://pcpartpicker.com/products/motherboard/',
    'memory': 'https://pcpartpicker.com/products/memory/',
    'internal-hard-drive': 'https://pcpartpicker.com/products/internal-hard-drive/',
    'power-supply': 'https://pcpartpicker.com/products/power-supply/',
}

def price_to_usd(price) -> Decimal:
    try:
        # Money object from py-moneyed
        amount = getattr(price, 'amount', None)
        currency = getattr(price, 'currency', None)
        if amount is None:
            return None
        # Only accept USD; skip others
        if currency and getattr(currency, 'code', 'USD') != 'USD':
            return None
        return Decimal(str(amount))
    except Exception:
        return None


def upsert_parts_and_offers(conn, items, pcpp_part_key: str):
    category = CATEGORY_MAP.get(pcpp_part_key, 'unknown')
    placeholder_url = PCPP_CATEGORY_URL.get(pcpp_part_key)

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        # Ensure retailer 'pcpartpicker'
        cur.execute(
            """
            insert into retailers (slug, name)
            values ('pcpartpicker', 'PCPartPicker')
            on conflict (slug) do nothing
            returning id
            """
        )
        cur.execute("select id from retailers where slug='pcpartpicker' limit 1")
        retailer_id = cur.fetchone()['id']

        for item in items:
            brand = getattr(item, 'brand', None) or getattr(item, 'manufacturer', None) or 'Unknown'
            model = getattr(item, 'model', None) or 'Unknown'
            priceUsd = price_to_usd(getattr(item, 'price', None))

            if not model:
                # skip malformed entry
                continue

            # naive sku
            sku = f"{brand}-{model}".lower().replace(' ', '-').replace('/', '-')[:120]

            # Upsert part
            cur.execute(
                """
                insert into parts (sku, manufacturer, model, category, price_usd, canonical_url)
                values (%s, %s, %s, %s, coalesce(%s, '0'), %s)
                on conflict (sku) do update set price_usd=excluded.price_usd
                returning id
                """,
                (sku, brand, model, category, str(priceUsd) if priceUsd is not None else None, placeholder_url),
            )
            part_id = cur.fetchone()['id']

            # Insert offer (synthetic; points to category page)
            if priceUsd is not None:
                cur.execute(
                    """
                    insert into offers (part_id, retailer_id, retailer_sku, url, price_usd, in_stock)
                    values (%s, %s, %s, %s, %s, %s)
                    on conflict do nothing
                    """,
                    (part_id, retailer_id, None, placeholder_url, str(priceUsd), True),
                )

    conn.commit()


def main():
    start = time.time()
    api = API('us')
    data = api.retrieve(*SUPPORTED, force_refresh=True)

    conn = psycopg2.connect(DATABASE_URL)
    try:
        total = 0
        for key in SUPPORTED:
            items = data.get(key, [])
            upsert_parts_and_offers(conn, items, key)
            total += len(items)
        print(f"Ingested {total} items from pcpartpicker in {time.time()-start:.1f}s")
    finally:
        conn.close()


if __name__ == '__main__':
    main()