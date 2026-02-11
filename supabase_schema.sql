-- Create profiles table (extends auth.users)
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  full_name text,
  role text check (role in ('admin', 'analyst', 'client')) default 'client',
  created_at timestamptz default now(),
  primary key (id)
);

-- Create companies table
create table public.companies (
  id uuid not null default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  name text not null,
  sector text,
  cnpj text,
  created_at timestamptz default now(),
  primary key (id)
);

-- Create valuations table
create table public.valuations (
  id uuid not null default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  inputs jsonb not null,
  results jsonb not null,
  version int default 1,
  created_at timestamptz default now(),
  primary key (id)
);

-- RLS (Row Level Security) Policies

-- Profiles: Users can view/edit their own profile
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Companies: Users can view/edit companies they own
alter table public.companies enable row level security;
create policy "Users can view own companies" on public.companies for select using (auth.uid() = owner_id);
create policy "Users can insert own companies" on public.companies for insert with check (auth.uid() = owner_id);
create policy "Users can update own companies" on public.companies for update using (auth.uid() = owner_id);

-- Valuations: Users can view/edit valuations for their companies
alter table public.valuations enable row level security;
create policy "Users can view valuations of own companies" on public.valuations for select using (
  exists (select 1 from public.companies where id = valuations.company_id and owner_id = auth.uid())
);
create policy "Users can insert valuations for own companies" on public.valuations for insert with check (
  exists (select 1 from public.companies where id = company_id and owner_id = auth.uid())
);

-- Handle new user signup (Trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'client');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
