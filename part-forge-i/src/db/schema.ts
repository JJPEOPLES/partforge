import { pgTable, serial, text, integer, timestamp, boolean, numeric, varchar, uuid } from 'drizzle-orm/pg-core';

// Users who create builds
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 120 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Parts catalog (CPU, GPU, etc.)
export const parts = pgTable('parts', {
  id: serial('id').primaryKey(),
  sku: varchar('sku', { length: 120 }).notNull().unique(),
  manufacturer: varchar('manufacturer', { length: 120 }).notNull(),
  model: varchar('model', { length: 200 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(), // cpu, gpu, motherboard, ram, storage, psu, case, cooler
  priceUsd: numeric('price_usd', { precision: 10, scale: 2 }).notNull(),
  wattage: integer('wattage'), // for psu, gpu, etc.
  socket: varchar('socket', { length: 50 }), // for cpu/motherboard compat
  chipset: varchar('chipset', { length: 50 }), // motherboard
  formFactor: varchar('form_factor', { length: 50 }), // case/motherboard
  memoryType: varchar('memory_type', { length: 50 }), // ddr4, ddr5
  capacityGb: integer('capacity_gb'), // ram/storage
  interface: varchar('interface', { length: 50 }), // pcie, sata, m.2
  upc: varchar('upc', { length: 64 }), // universal, useful for aggregators
  mpn: varchar('mpn', { length: 128 }), // manufacturer part number
  canonicalUrl: text('canonical_url'),
  imageUrl: text('image_url'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Retailers (Amazon, Newegg, Micro Center, Walmart, etc.)
export const retailers = pgTable('retailers', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 50 }).notNull().unique(), // 'amazon', 'newegg', 'microcenter', 'walmart', 'msi', 'asus'
  name: varchar('name', { length: 120 }).notNull(),
});

// Offers per retailer for a given part (price/stock per store)
export const offers = pgTable('offers', {
  id: serial('id').primaryKey(),
  partId: integer('part_id').notNull(),
  retailerId: integer('retailer_id').notNull(),
  retailerSku: varchar('retailer_sku', { length: 120 }),
  url: text('url').notNull(),
  priceUsd: numeric('price_usd', { precision: 10, scale: 2 }).notNull(),
  inStock: boolean('in_stock').default(true).notNull(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow().notNull(),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }).defaultNow().notNull(),
});

// A PC build created by a user
export const builds = pgTable('builds', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  public: boolean('public').default(true).notNull(),
  totalPriceUsd: numeric('total_price_usd', { precision: 12, scale: 2 }).default('0').notNull(),
  estWattage: integer('est_wattage').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Junction table for parts inside a build
export const buildParts = pgTable('build_parts', {
  id: serial('id').primaryKey(),
  buildId: integer('build_id').notNull(),
  partId: integer('part_id').notNull(),
  quantity: integer('quantity').default(1).notNull(),
  // slot: e.g. "cpu", "gpu1", "ram1", etc.; helps UI placement
  slot: varchar('slot', { length: 50 }),
});