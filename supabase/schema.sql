-- Verdict — Supabase schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------
-- SITES: every site Verdict knows about, either surfaced from a SearXNG
-- result the first time someone votes on it, or manually indexed.
-- ----------------------------------------------------------------------
create table if not exists public.sites (
	id uuid primary key default uuid_generate_v4(),
	url text not null unique,
	domain text not null,
	title text,
	description text,
	og_image text,
	indexed_by uuid references auth.users(id) on delete set null,
	is_manual boolean not null default false,
	upvotes integer not null default 0,
	downvotes integer not null default 0,
	created_at timestamptz not null default now()
);

create index if not exists sites_domain_idx on public.sites (domain);
create index if not exists sites_upvotes_idx on public.sites (upvotes desc);

-- ----------------------------------------------------------------------
-- VOTES: one row per (user, site). Upserting a new value = changing vote.
-- ----------------------------------------------------------------------
create table if not exists public.votes (
	id uuid primary key default uuid_generate_v4(),
	site_id uuid not null references public.sites(id) on delete cascade,
	user_id uuid not null references auth.users(id) on delete cascade,
	value smallint not null check (value in (1, -1)),
	-- Denormalized at vote time from the OAuth profile so "who upvoted this" can
	-- be displayed without ever exposing the auth.users table to the client.
	voter_name text,
	voter_avatar text,
	created_at timestamptz not null default now(),
	unique (site_id, user_id)
);

create index if not exists votes_site_idx on public.votes (site_id);
create index if not exists votes_user_idx on public.votes (user_id);

-- ----------------------------------------------------------------------
-- SEARCH LOG: powers autocomplete (popular past queries) + your own
-- stats panel ("searches that surfaced your indexed sites" etc).
-- ----------------------------------------------------------------------
create table if not exists public.search_log (
	id uuid primary key default uuid_generate_v4(),
	query text not null,
	user_id uuid references auth.users(id) on delete set null,
	created_at timestamptz not null default now()
);

create index if not exists search_log_query_idx on public.search_log using gin (query gin_trgm_ops);
create extension if not exists pg_trgm;

-- ----------------------------------------------------------------------
-- Trigger: keep sites.upvotes / downvotes denormalized & fast to sort by.
-- ----------------------------------------------------------------------
create or replace function public.recalc_site_votes() returns trigger as $$
begin
	update public.sites s
	set
		upvotes = (select count(*) from public.votes v where v.site_id = coalesce(new.site_id, old.site_id) and v.value = 1),
		downvotes = (select count(*) from public.votes v where v.site_id = coalesce(new.site_id, old.site_id) and v.value = -1)
	where s.id = coalesce(new.site_id, old.site_id);
	return null;
end;
$$ language plpgsql security definer;

drop trigger if exists votes_after_change on public.votes;
create trigger votes_after_change
after insert or update or delete on public.votes
for each row execute function public.recalc_site_votes();

-- ----------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------
alter table public.sites enable row level security;
alter table public.votes enable row level security;
alter table public.search_log enable row level security;

-- Anyone (even anon) can read sites & vote counts.
create policy "sites are publicly readable" on public.sites
	for select using (true);

-- Only authenticated users can manually index a site; indexed_by must be them.
create policy "authenticated users can index sites" on public.sites
	for insert to authenticated
	with check (auth.uid() = indexed_by);

-- Votes are publicly readable so "who upvoted this" can be shown.
create policy "votes are publicly readable" on public.votes
	for select using (true);

-- A user can only cast/change/remove their own vote.
create policy "users manage their own vote" on public.votes
	for insert to authenticated
	with check (auth.uid() = user_id);

create policy "users update their own vote" on public.votes
	for update to authenticated
	using (auth.uid() = user_id)
	with check (auth.uid() = user_id);

create policy "users delete their own vote" on public.votes
	for delete to authenticated
	using (auth.uid() = user_id);

-- Search log: anyone can insert (even anon, for autocomplete quality),
-- but you can only read your own personalized rows via user_id filter
-- (aggregate/global popularity is read through a SECURITY DEFINER RPC below).
create policy "anyone can log a search" on public.search_log
	for insert with check (true);

create policy "users read their own search log" on public.search_log
	for select to authenticated
	using (auth.uid() = user_id);

-- ----------------------------------------------------------------------
-- RPC: popular query prefixes for autocomplete, without exposing raw log.
-- ----------------------------------------------------------------------
create or replace function public.autocomplete_queries(prefix text, limit_count int default 6)
returns table(query text, hits bigint) as $$
	select query, count(*) as hits
	from public.search_log
	where query ilike prefix || '%'
	group by query
	order by hits desc
	limit limit_count;
$$ language sql stable security definer;
