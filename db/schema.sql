create table if not exists app_users (
  id text primary key,
  role text not null check (role in ('user', 'vendor', 'employee', 'admin')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  name text not null,
  email text not null unique,
  password text,
  password_hash text,
  phone text,
  vendor text,
  provider text not null default 'password' check (provider in ('password', 'google')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id text primary key,
  name text not null,
  vendor text not null,
  vendor_verified boolean not null default false,
  category text not null,
  category_slug text not null,
  image text not null,
  image_alt text not null,
  price numeric(12, 2) not null,
  original_price numeric(12, 2) not null,
  discount_pct integer not null default 0,
  unit text not null,
  stock integer not null default 0,
  stock_status text not null check (stock_status in ('in_stock', 'low_stock', 'out_of_stock')),
  rating numeric(3, 2) not null default 0,
  review_count integer not null default 0,
  description text not null,
  tags text[] not null default '{}',
  min_order integer not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id text primary key,
  customer_id text,
  customer_name text not null,
  customer_phone text not null,
  city text not null,
  pincode text not null,
  vendor text not null,
  assigned_agent_id text,
  assigned_agent text not null default 'Unassigned',
  status text not null check (status in ('pending_admin', 'assigned_to_delivery', 'pickup_scheduled', 'collected_from_vendor', 'out_for_delivery', 'delivered', 'cancelled')),
  total numeric(12, 2) not null,
  payment_method text not null check (payment_method in ('cod', 'razorpay')),
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into app_users (id, role, status, name, email, password, phone, vendor, provider) values
  ('user-001', 'user', 'approved', 'Rajan Kumar', 'rajan.kumar@agromarket.in', 'Farmer@2026', '9876543210', null, 'password'),
  ('vendor-001', 'vendor', 'approved', 'Meera Seeds', 'greenfields.seeds@vendor.in', 'Vendor@2026', '9988776655', 'Green Fields Seeds', 'password'),
  ('employee-001', 'employee', 'approved', 'Suresh Yadav', 'suresh.delivery@agromarket.in', 'Agent@2026', '9123456789', null, 'password'),
  ('admin-001', 'admin', 'approved', 'AgroMarket Admin', 'admin@agromarket.in', 'Admin@2026', null, null, 'password')
on conflict (id) do update set
  role = excluded.role,
  status = excluded.status,
  name = excluded.name,
  email = excluded.email,
  password = excluded.password,
  phone = excluded.phone,
  vendor = excluded.vendor,
  provider = excluded.provider;

insert into orders (id, customer_id, customer_name, customer_phone, city, pincode, vendor, assigned_agent_id, assigned_agent, status, total, payment_method, items, created_at) values
  ('ORD-2026-84721', 'user-001', 'Rajan Kumar', '+91 98765 43210', 'Pune', '411014', 'Kisan Agro Supplies', 'employee-001', 'Suresh Yadav', 'out_for_delivery', 3269, 'cod', '[{"productId":"prod-001","name":"DAP Fertilizer (Diammonium Phosphate)","quantity":2,"price":1350,"vendor":"Kisan Agro Supplies"}]', '2026-04-28T09:30:00.000Z'),
  ('ORD-2026-84722', 'user-001', 'Rajan Kumar', '+91 98765 43210', 'Nashik', '422003', 'Green Fields Seeds', null, 'Unassigned', 'pending_admin', 1880, 'razorpay', '[{"productId":"prod-002","name":"Hybrid Tomato Seeds - Arka Rakshak","quantity":2,"price":480,"vendor":"Green Fields Seeds"},{"productId":"prod-012","name":"Maize Hybrid Seeds - Pioneer 30V92","quantity":1,"price":920,"vendor":"Green Fields Seeds"}]', '2026-04-29T13:10:00.000Z')
on conflict (id) do nothing;
