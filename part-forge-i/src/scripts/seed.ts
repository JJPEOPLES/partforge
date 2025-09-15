import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
// Avoid TS/alias issues by using relative import for schema types if needed (not required here)

async function main() {
  const sql = neon(process.env.DATABASE_URL!);

  const sample = [
    { sku: 'CPU-13400F', manufacturer: 'Intel', model: 'Core i5-13400F', category: 'cpu', priceUsd: '179.99', wattage: 148, socket: 'LGA1700' },
    { sku: 'GPU-4060TI', manufacturer: 'NVIDIA', model: 'GeForce RTX 4060 Ti', category: 'gpu', priceUsd: '379.99', wattage: 160, interface: 'PCIe 4.0 x16' },
    { sku: 'MB-B650M', manufacturer: 'MSI', model: 'PRO B650M-A', category: 'motherboard', priceUsd: '139.99', chipset: 'B650', formFactor: 'mATX', socket: 'AM5' },
    { sku: 'RAM-32GB-DDR5', manufacturer: 'Corsair', model: 'Vengeance 32GB DDR5-6000', category: 'ram', priceUsd: '94.99', memoryType: 'DDR5', capacityGb: 32 },
    { sku: 'SSD-1TB-NVME', manufacturer: 'Samsung', model: '990 EVO 1TB', category: 'storage', priceUsd: '84.99', interface: 'M.2 NVMe', capacityGb: 1000 },
  ];

  // Upsert by SKU (naive) — for demo only
  for (const p of sample) {
    await sql`insert into parts (sku, manufacturer, model, category, price_usd, wattage, socket, chipset, form_factor, memory_type, capacity_gb, interface, notes)
              values (${p.sku}, ${p.manufacturer}, ${p.model}, ${p.category}, ${p.priceUsd}, ${p.wattage ?? null}, ${p.socket ?? null}, ${p.chipset ?? null}, ${p.formFactor ?? null}, ${p.memoryType ?? null}, ${p.capacityGb ?? null}, ${p.interface ?? null}, null)
              on conflict (sku) do nothing`;
  }

  console.log('Seeded sample parts.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});