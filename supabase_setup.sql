-- Tabla de landings (cada landing tiene su lista de numeros de WhatsApp)
create table public.landings (
  id text primary key,
  nombre text,
  numeros jsonb not null default '[]'::jsonb,
  current_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- Tabla de usuarios del panel admin
create table public.usuarios (
  id uuid primary key default gen_random_uuid(),
  usuario text not null unique,
  clave text not null,
  nombre text,
  landing_id text references public.landings(id),
  created_at timestamptz not null default now()
);

-- Habilitar RLS (requerido por Supabase para exponer las tablas via API)
alter table public.landings enable row level security;
alter table public.usuarios enable row level security;

-- Policies: la anon key puede leer/escribir landings (mismo modelo de confianza que el original,
-- toda la logica de auth vive en el JS del cliente, no en Supabase Auth)
create policy "anon select landings" on public.landings for select using (true);
create policy "anon insert landings" on public.landings for insert with check (true);
create policy "anon update landings" on public.landings for update using (true);

-- Solo lectura de usuarios (para el login)
create policy "anon select usuarios" on public.usuarios for select using (true);

-- Landing inicial (cambia el id/nombre si quieres otro)
insert into public.landings (id, nombre, numeros, current_index) values
  ('principal', 'Mi Landing', '[]'::jsonb, 0);

-- Usuario admin inicial (mismo usuario/clave que ya conoces; landing_id NULL = ve todas las landings)
insert into public.usuarios (usuario, clave, nombre, landing_id) values
  ('yowi', 'yowi2025', 'Elias', null);
