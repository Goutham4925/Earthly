import { cookies } from 'next/headers';
import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'crypto';
import { Pool } from 'pg';
import { mockProducts, Product } from '@/app/product-browsing-screen/components/mockProducts';
import { initialCartItems } from '@/app/cart-checkout-screen/components/cartData';

export type UserRole = 'user' | 'vendor' | 'employee' | 'admin';
export type AccountStatus = 'pending' | 'approved' | 'rejected';
export type OrderStatus =
  | 'pending_admin'
  | 'assigned_to_delivery'
  | 'pickup_scheduled'
  | 'collected_from_vendor'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface AppUser {
  id: string;
  role: UserRole;
  status: AccountStatus;
  name: string;
  email: string;
  password?: string;
  passwordHash?: string;
  phone?: string;
  vendor?: string;
  provider?: 'password' | 'google';
}

export interface MarketplaceOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  city: string;
  pincode: string;
  vendor: string;
  assignedAgentId: string | null;
  assignedAgent: string;
  status: OrderStatus;
  total: number;
  paymentMethod: 'cod' | 'razorpay';
  createdAt: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    vendor?: string;
  }>;
}

export interface SessionUser extends Omit<AppUser, 'password'> {}

const sessionCookie = 'agromarket_session';

export const demoUsers: AppUser[] = [
  {
    id: 'user-001',
    role: 'user',
    status: 'approved',
    name: 'Rajan Kumar',
    email: 'rajan.kumar@agromarket.in',
    password: 'Farmer@2026',
    phone: '9876543210',
    provider: 'password',
  },
  {
    id: 'vendor-001',
    role: 'vendor',
    status: 'approved',
    name: 'Meera Seeds',
    email: 'greenfields.seeds@vendor.in',
    password: 'Vendor@2026',
    phone: '9988776655',
    vendor: 'Green Fields Seeds',
    provider: 'password',
  },
  {
    id: 'employee-001',
    role: 'employee',
    status: 'approved',
    name: 'Suresh Yadav',
    email: 'suresh.delivery@agromarket.in',
    password: 'Agent@2026',
    phone: '9123456789',
    provider: 'password',
  },
  {
    id: 'admin-001',
    role: 'admin',
    status: 'approved',
    name: 'AgroMarket Admin',
    email: 'admin@agromarket.in',
    password: 'Admin@2026',
    provider: 'password',
  },
];

const seedOrders: MarketplaceOrder[] = [
  {
    id: 'ORD-2026-84721',
    customerId: 'user-001',
    customerName: 'Rajan Kumar',
    customerPhone: '+91 98765 43210',
    city: 'Pune',
    pincode: '411014',
    vendor: 'Kisan Agro Supplies',
    assignedAgentId: 'employee-001',
    assignedAgent: 'Suresh Yadav',
    status: 'out_for_delivery',
    total: 3269,
    paymentMethod: 'cod',
    createdAt: '2026-04-28T09:30:00.000Z',
    items: initialCartItems.slice(0, 1).map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      vendor: item.vendor,
    })),
  },
  {
    id: 'ORD-2026-84722',
    customerId: 'user-001',
    customerName: 'Rajan Kumar',
    customerPhone: '+91 98765 43210',
    city: 'Nashik',
    pincode: '422003',
    vendor: 'Green Fields Seeds',
    assignedAgentId: null,
    assignedAgent: 'Unassigned',
    status: 'pending_admin',
    total: 1880,
    paymentMethod: 'razorpay',
    createdAt: '2026-04-29T13:10:00.000Z',
    items: [
      {
        productId: 'prod-002',
        name: 'Hybrid Tomato Seeds - Arka Rakshak',
        quantity: 2,
        price: 480,
        vendor: 'Green Fields Seeds',
      },
      {
        productId: 'prod-012',
        name: 'Maize Hybrid Seeds - Pioneer 30V92',
        quantity: 1,
        price: 920,
        vendor: 'Green Fields Seeds',
      },
    ],
  },
];

let pool: Pool | null = null;

function getSanitizedDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;

  try {
    const u = new URL(databaseUrl);
    u.searchParams.delete('sslmode');
    return u.toString();
  } catch {
    return databaseUrl.replace(/([?&])sslmode=[^&]+/g, '').replace(/[?&]$/, '');
  }
}

function getPool() {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('your-aiven-')) return null;

  const databaseUrl = getSanitizedDatabaseUrl();
  if (!databaseUrl) return null;

  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
    });
  }
  return pool;
}

function publicUser(user: AppUser): SessionUser {
  const { password: _password, passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password: string, stored?: string) {
  if (!stored) return false;
  if (!stored.startsWith('scrypt:')) return password === stored;
  const [, salt, hash] = stored.split(':');
  const actual = scryptSync(password, salt, 64);
  return timingSafeEqual(Buffer.from(hash, 'hex'), actual);
}

function sessionSecret() {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'dev-only-change-this-secret';
}

function signPayload(payload: string) {
  return createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
}

function makeSession(user: SessionUser) {
  const payload = Buffer.from(
    JSON.stringify({ user, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 })
  ).toString('base64url');
  return `${payload}.${signPayload(payload)}`;
}

function verifySession(value?: string) {
  if (!value) return null;
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;
  const expected = signPayload(payload);
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
    user: SessionUser;
    exp: number;
  };
  return parsed.exp > Date.now() ? parsed.user : null;
}

export async function setSession(user: SessionUser) {
  (await cookies()).set(sessionCookie, makeSession(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  (await cookies()).delete(sessionCookie);
}

export async function getSessionUser() {
  return verifySession((await cookies()).get(sessionCookie)?.value);
}

function productFromRow(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    vendor: row.vendor,
    vendorVerified: row.vendor_verified,
    category: row.category,
    categorySlug: row.category_slug,
    image: row.image,
    imageAlt: row.image_alt,
    price: Number(row.price),
    originalPrice: Number(row.original_price),
    discountPct: Number(row.discount_pct),
    unit: row.unit,
    stock: Number(row.stock),
    stockStatus: row.stock_status,
    rating: Number(row.rating),
    reviewCount: Number(row.review_count),
    description: row.description,
    tags: row.tags ?? [],
    minOrder: Number(row.min_order),
  };
}

function userFromRow(row: any): AppUser {
  return {
    id: row.id,
    role: row.role,
    status: row.status,
    name: row.name,
    email: row.email,
    password: row.password,
    passwordHash: row.password_hash,
    phone: row.phone,
    vendor: row.vendor,
    provider: row.provider,
  };
}

function orderFromRow(row: any): MarketplaceOrder {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    city: row.city,
    pincode: row.pincode,
    vendor: row.vendor,
    assignedAgentId: row.assigned_agent_id,
    assignedAgent: row.assigned_agent,
    status: row.status,
    total: Number(row.total),
    paymentMethod: row.payment_method,
    createdAt: new Date(row.created_at).toISOString(),
    items: row.items ?? [],
  };
}

export async function authenticateUser(email: string, password: string, role: UserRole) {
  const db = getPool();
  if (db) {
    try {
      const result = await db.query(
        'select * from app_users where lower(email) = lower($1) and role = $2 limit 1',
        [email, role]
      );
      const user = result.rows[0] ? userFromRow(result.rows[0]) : null;
      if (!user || !verifyPassword(password, user.passwordHash ?? user.password)) return null;
      if (user.status !== 'approved')
        throw new Error(`Your ${role} account is ${user.status}. Admin approval is required.`);
      return publicUser(user);
    } catch (error: any) {
      if (String(error.message ?? '').includes('approval')) throw error;
    }
  }

  const user = demoUsers.find(
    (item) =>
      item.email.toLowerCase() === email.toLowerCase() &&
      item.password === password &&
      item.role === role
  );
  if (!user) return null;
  if (user.status !== 'approved')
    throw new Error(`Your ${role} account is ${user.status}. Admin approval is required.`);
  return publicUser(user);
}

export async function registerUser(input: Partial<AppUser> & { password: string }) {
  const role = input.role ?? 'user';
  const status: AccountStatus = role === 'user' ? 'approved' : 'pending';
  const user: AppUser = {
    id: randomUUID(),
    role,
    status,
    name: input.name ?? '',
    email: input.email ?? '',
    passwordHash: hashPassword(input.password),
    phone: input.phone,
    vendor: role === 'vendor' ? input.vendor || input.name : input.vendor,
    provider: 'password',
  };
  const db = getPool();
  if (db) {
    try {
      await db.query(
        `insert into app_users (id, role, status, name, email, password_hash, phone, vendor, provider)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          user.id,
          user.role,
          user.status,
          user.name,
          user.email,
          user.passwordHash,
          user.phone,
          user.vendor,
          user.provider,
        ]
      );
    } catch {}
  }
  return publicUser(user);
}

export async function findOrCreateGoogleUser(profile: { email: string; name: string }) {
  const db = getPool();
  if (db) {
    const existing = await db.query(
      'select * from app_users where lower(email) = lower($1) limit 1',
      [profile.email]
    );
    if (existing.rows[0]) return publicUser(userFromRow(existing.rows[0]));
    const user: AppUser = {
      id: randomUUID(),
      role: 'user',
      status: 'approved',
      name: profile.name,
      email: profile.email,
      provider: 'google',
    };
    await db.query(
      'insert into app_users (id, role, status, name, email, provider) values ($1,$2,$3,$4,$5,$6)',
      [user.id, user.role, user.status, user.name, user.email, user.provider]
    );
    return publicUser(user);
  }
  return publicUser({
    id: `google-${profile.email}`,
    role: 'user',
    status: 'approved',
    name: profile.name,
    email: profile.email,
    provider: 'google',
  });
}

export async function listUsers(role?: UserRole, status?: AccountStatus) {
  const db = getPool();
  if (!db)
    return demoUsers
      .filter((user) => (!role || user.role === role) && (!status || user.status === status))
      .map(publicUser);
  const clauses: string[] = [];
  const values: string[] = [];
  if (role) {
    values.push(role);
    clauses.push(`role = $${values.length}`);
  }
  if (status) {
    values.push(status);
    clauses.push(`status = $${values.length}`);
  }
  const result = await db.query(
    `select * from app_users ${clauses.length ? `where ${clauses.join(' and ')}` : ''} order by created_at desc`,
    values
  );
  return result.rows.map(userFromRow).map(publicUser);
}

export async function updateUserStatus(id: string, status: AccountStatus) {
  const db = getPool();
  if (db)
    await db.query('update app_users set status = $2, updated_at = now() where id = $1', [
      id,
      status,
    ]);
  return { id, status };
}

export async function listProducts() {
  const db = getPool();
  if (!db) return mockProducts;
  try {
    const result = await db.query('select * from products order by name asc');
    if (result.rowCount === 0) {
      await Promise.all(mockProducts.map((product) => upsertProduct(product)));
      return mockProducts;
    }
    return result.rows.map(productFromRow);
  } catch {
    return mockProducts;
  }
}

export async function upsertProduct(product: Product) {
  const db = getPool();
  if (!db) return product;
  await db.query(
    `insert into products (
      id, name, vendor, vendor_verified, category, category_slug, image, image_alt, price,
      original_price, discount_pct, unit, stock, stock_status, rating, review_count,
      description, tags, min_order
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
    on conflict (id) do update set
      name = excluded.name, vendor = excluded.vendor, vendor_verified = excluded.vendor_verified,
      category = excluded.category, category_slug = excluded.category_slug, image = excluded.image,
      image_alt = excluded.image_alt, price = excluded.price, original_price = excluded.original_price,
      discount_pct = excluded.discount_pct, unit = excluded.unit, stock = excluded.stock,
      stock_status = excluded.stock_status, rating = excluded.rating, review_count = excluded.review_count,
      description = excluded.description, tags = excluded.tags, min_order = excluded.min_order,
      updated_at = now()`,
    [
      product.id,
      product.name,
      product.vendor,
      product.vendorVerified,
      product.category,
      product.categorySlug,
      product.image,
      product.imageAlt,
      product.price,
      product.originalPrice,
      product.discountPct,
      product.unit,
      product.stock,
      product.stockStatus,
      product.rating,
      product.reviewCount,
      product.description,
      product.tags,
      product.minOrder,
    ]
  );
  return product;
}

export async function listOrders() {
  const db = getPool();
  if (!db) return seedOrders;
  try {
    const result = await db.query('select * from orders order by created_at desc');
    if (result.rowCount === 0) {
      await Promise.all(seedOrders.map((order) => createOrder(order)));
      return seedOrders;
    }
    return result.rows.map(orderFromRow);
  } catch {
    return seedOrders;
  }
}

export async function getOrderById(id: string) {
  const db = getPool();
  if (!db) return seedOrders.find((order) => order.id === id) ?? null;
  const result = await db.query('select * from orders where id = $1 limit 1', [id]);
  return result.rows[0] ? orderFromRow(result.rows[0]) : null;
}

export async function createOrder(order: MarketplaceOrder) {
  const db = getPool();
  if (!db) return order;
  await db.query(
    `insert into orders (
      id, customer_id, customer_name, customer_phone, city, pincode, vendor, assigned_agent_id,
      assigned_agent, status, total, payment_method, created_at, items
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    on conflict (id) do update set
      customer_id = excluded.customer_id,
      customer_name = excluded.customer_name,
      customer_phone = excluded.customer_phone,
      city = excluded.city,
      pincode = excluded.pincode,
      vendor = excluded.vendor,
      assigned_agent_id = excluded.assigned_agent_id,
      assigned_agent = excluded.assigned_agent,
      status = excluded.status,
      total = excluded.total,
      payment_method = excluded.payment_method,
      items = excluded.items,
      updated_at = now()`,
    [
      order.id,
      order.customerId,
      order.customerName,
      order.customerPhone,
      order.city,
      order.pincode,
      order.vendor,
      order.assignedAgentId,
      order.assignedAgent,
      order.status,
      order.total,
      order.paymentMethod,
      order.createdAt,
      JSON.stringify(order.items),
    ]
  );
  return order;
}

export async function updateOrder(
  id: string,
  patch: Partial<Pick<MarketplaceOrder, 'status' | 'assignedAgentId' | 'assignedAgent'>>
) {
  const db = getPool();
  if (!db) return { id, ...patch };
  await db.query(
    `update orders set
      status = coalesce($2, status),
      assigned_agent_id = coalesce($3, assigned_agent_id),
      assigned_agent = coalesce($4, assigned_agent),
      updated_at = now()
     where id = $1`,
    [id, patch.status, patch.assignedAgentId, patch.assignedAgent]
  );
  return { id, ...patch };
}
