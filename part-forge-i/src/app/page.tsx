import styles from './page.module.css';
import { db } from '@/db/client';
import { parts } from '@/db/schema';
import { desc } from 'drizzle-orm';

// Use Drizzle's inferred type for parts
export type Part = typeof parts.$inferSelect;

export default async function Home() {
  const items: Part[] = await db
    .select()
    .from(parts)
    .orderBy(desc(parts.createdAt))
    .limit(50);

  return (
    <main className={styles.main}>
      <h1>Part Forge i</h1>
      <p>Minimal listing of parts (latest 50)</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {items?.map((p: Part) => (
          <div key={p.id} style={{ border: '1px solid #333', padding: 12, borderRadius: 8 }}>
            <div style={{ fontWeight: 700 }}>{p.manufacturer} {p.model}</div>
            <div>Category: {p.category}</div>
            <div>Price: ${p.priceUsd}</div>
            {p.wattage ? <div>Wattage: {p.wattage}W</div> : null}
            {p.socket ? <div>Socket: {p.socket}</div> : null}
            <div style={{ fontSize: 12, opacity: 0.7 }}>SKU: {p.sku}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
