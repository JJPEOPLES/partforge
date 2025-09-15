export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { db } from '@/src/db/client';
import { parts } from '@/src/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');

  let data;
  if (category) {
    data = await db.select().from(parts).where(eq(parts.category, category)).orderBy(desc(parts.createdAt)).limit(50);
  } else {
    data = await db.select().from(parts).orderBy(desc(parts.createdAt)).limit(50);
  }

  return new Response(JSON.stringify({ items: data }), {
    headers: { 'content-type': 'application/json' },
  });
}