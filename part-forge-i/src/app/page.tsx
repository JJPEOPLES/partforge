import styles from './page.module.css';

// Minimal shape for items from /api/parts
type Part = {
  id: number;
  manufacturer: string;
  model: string;
  category: string;
  priceUsd: string;
  wattage?: number | null;
  socket?: string | null;
  sku: string;
};

export default async function Home() {
  const res = await fetch(`/api/parts`, { cache: 'no-store' });
  const { items } = (await res.json()) as { items: Part[] };

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
