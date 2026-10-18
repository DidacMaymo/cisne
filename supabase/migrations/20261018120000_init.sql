-- CISNE · esquema inicial
--
-- Seguridad: TODAS las tablas tienen RLS (Row Level Security: Postgres filtra
-- cada fila según quién pregunta). Las tablas solo dejan ver lo propio. Lo
-- público se lee a través de vistas que publican únicamente los poemas
-- `published` + `public` y que nunca exponen `author_id` ni el perfil de un
-- poema anónimo o firmado con pseudónimo.

-- ───────────────────────────── Extensiones y utilidades

create extension if not exists unaccent with schema extensions;

-- Búsqueda en español sin distinguir tildes («corazon» encuentra «corazón»).
create text search configuration public.spanish_unaccent (copy = pg_catalog.spanish);
alter text search configuration public.spanish_unaccent
  alter mapping for hword, hword_part, word with extensions.unaccent, spanish_stem;

-- unaccent no es IMMUTABLE; este envoltorio sí, para poder indexar.
create function public.f_unaccent(text) returns text
language sql immutable parallel safe strict set search_path = ''
as $$ select extensions.unaccent('extensions.unaccent'::regdictionary, $1) $$;

-- Misma regla que el frontend: sin «#», espacios simples, minúsculas, 30 caracteres.
create function public.normalize_tag(raw text) returns text
language sql immutable parallel safe set search_path = ''
as $$
  select left(btrim(lower(regexp_replace(regexp_replace(normalize(coalesce(raw, ''), NFC), '^\s*#+', ''), '\s+', ' ', 'g'))), 30)
$$;

-- «Ana Lía» → «ana-lia», para la URL del autor.
create function public.slugify(raw text) returns text
language sql immutable parallel safe set search_path = ''
as $$
  select left(btrim(regexp_replace(lower(public.f_unaccent(coalesce(raw, ''))), '[^a-z0-9]+', '-', 'g'), '-'), 30)
$$;

create function public.links_are_http(links text[]) returns boolean
language sql immutable parallel safe set search_path = ''
as $$ select coalesce(bool_and(l ~ '^https?://[^\s]+$' and char_length(l) <= 300), true) from unnest(links) as l $$;

create function public.touch_updated_at() returns trigger
language plpgsql set search_path = ''
as $$ begin new.updated_at := now(); return new; end $$;

-- ───────────────────────────── Tablas

-- Perfil público + datos privados del autor. El email vive en auth.users.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  account_name text not null unique
    check (account_name ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(account_name) <= 40),
  display_name text not null default '' check (char_length(display_name) <= 60),
  primary_pseudonym text check (char_length(primary_pseudonym) between 1 and 40),
  bio text check (char_length(bio) <= 400),
  links text[] not null default '{}' check (cardinality(links) <= 4 and public.links_are_http(links)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.poems (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text check (char_length(title) between 1 and 120),
  content text not null check (char_length(btrim(content)) > 0 and char_length(content) <= 20000),
  status text not null default 'draft' check (status in ('draft', 'published')),
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  publication_identity text not null default 'profile_name'
    check (publication_identity in ('profile_name', 'pseudonym', 'anonymous')),
  displayed_pseudonym text check (char_length(displayed_pseudonym) between 2 and 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  fts tsvector generated always as (
    to_tsvector('public.spanish_unaccent'::regconfig, coalesce(title, '') || ' ' || content)
  ) stored,
  constraint pseudonym_only_when_used
    check (publication_identity = 'pseudonym' or displayed_pseudonym is null),
  constraint published_pseudonym_has_name
    check (status = 'draft' or publication_identity <> 'pseudonym' or displayed_pseudonym is not null)
);
create index poems_author_idx on public.poems (author_id);
create index poems_public_idx on public.poems (published_at desc) where status = 'published' and visibility = 'public';
create index poems_fts_idx on public.poems using gin (fts);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text not null unique
    check (char_length(normalized_name) between 1 and 30 and normalized_name = public.normalize_tag(normalized_name))
);

create table public.poem_tags (
  poem_id uuid not null references public.poems (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (poem_id, tag_id)
);
create index poem_tags_tag_idx on public.poem_tags (tag_id);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 80),
  description text check (char_length(description) <= 400),
  visibility text not null default 'private' check (visibility in ('public', 'private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index collections_owner_idx on public.collections (owner_id);

-- Una colección puede reunir poemas propios y de otros autores (antología).
create table public.collection_poems (
  collection_id uuid not null references public.collections (id) on delete cascade,
  poem_id uuid not null references public.poems (id) on delete cascade,
  position integer not null,
  primary key (collection_id, poem_id)
);
create index collection_poems_poem_idx on public.collection_poems (poem_id);

create table public.favorites (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  poem_id uuid not null references public.poems (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, poem_id)
);
create index favorites_poem_idx on public.favorites (poem_id);

-- Denuncias de contenido. Solo se insertan; se revisan desde el panel de Supabase.
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid default auth.uid() references public.profiles (id) on delete set null,
  poem_id uuid not null references public.poems (id) on delete cascade,
  reason text not null check (char_length(btrim(reason)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger poems_touch before update on public.poems
  for each row execute function public.touch_updated_at();
create trigger collections_touch before update on public.collections
  for each row execute function public.touch_updated_at();

-- La fecha de publicación la pone el servidor: se fija al publicar por primera
-- vez y se conserva en las ediciones; un borrador no tiene.
create function public.set_published_at() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if new.status = 'draft' then
    new.published_at := null;
  elsif tg_op = 'UPDATE' and old.published_at is not null then
    new.published_at := old.published_at;
  else
    new.published_at := now();
  end if;
  return new;
end $$;
create trigger poems_published_at before insert or update on public.poems
  for each row execute function public.set_published_at();

-- ───────────────────────────── Alta de usuarios

-- Al registrarse en Supabase Auth se crea su perfil con un nombre de cuenta único.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  shown text := left(btrim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), 60);
  base text := coalesce(nullif(public.slugify(shown), ''), 'autor');
  candidate text := base;
  n integer := 2;
begin
  while exists (select 1 from public.profiles where account_name = candidate) loop
    candidate := base || '-' || n;
    n := n + 1;
  end loop;
  insert into public.profiles (id, account_name, display_name) values (new.id, candidate, shown);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────────── RLS: cada tabla solo muestra lo propio

alter table public.profiles enable row level security;
alter table public.poems enable row level security;
alter table public.tags enable row level security;
alter table public.poem_tags enable row level security;
alter table public.collections enable row level security;
alter table public.collection_poems enable row level security;
alter table public.favorites enable row level security;
alter table public.reports enable row level security;

-- ¿Puede quien pregunta leer este poema? (público o suyo). SECURITY DEFINER
-- para poder mirarlo sin abrir la tabla `poems` a nadie.
create function public.can_read_poem(p uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.poems
    where id = p and ((status = 'published' and visibility = 'public') or author_id = (select auth.uid()))
  )
$$;

create policy "perfil propio: leer" on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "perfil propio: editar" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
-- El nombre de cuenta (la URL del autor) no se cambia desde el navegador.
revoke update on public.profiles from anon, authenticated;
grant update (display_name, primary_pseudonym, bio, links) on public.profiles to authenticated;

create policy "poemas propios: leer" on public.poems for select to authenticated
  using (author_id = (select auth.uid()));
create policy "poemas propios: crear" on public.poems for insert to authenticated
  with check (author_id = (select auth.uid()));
create policy "poemas propios: editar" on public.poems for update to authenticated
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy "poemas propios: borrar" on public.poems for delete to authenticated
  using (author_id = (select auth.uid()));

-- Etiquetas: aquí solo las de mis poemas. Las públicas, por la vista public_tags.
create policy "etiquetas de mis poemas" on public.tags for select to authenticated
  using (exists (
    select 1 from public.poem_tags pt join public.poems p on p.id = pt.poem_id
    where pt.tag_id = tags.id and p.author_id = (select auth.uid())
  ));

create policy "etiquetado de mis poemas: leer" on public.poem_tags for select to authenticated
  using (exists (select 1 from public.poems p where p.id = poem_id and p.author_id = (select auth.uid())));

create policy "colecciones propias: leer" on public.collections for select to authenticated
  using (owner_id = (select auth.uid()));
create policy "colecciones propias: crear" on public.collections for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "colecciones propias: editar" on public.collections for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "colecciones propias: borrar" on public.collections for delete to authenticated
  using (owner_id = (select auth.uid()));

create policy "contenido de mis colecciones: leer" on public.collection_poems for select to authenticated
  using (exists (select 1 from public.collections c where c.id = collection_id and c.owner_id = (select auth.uid())));
create policy "contenido de mis colecciones: quitar" on public.collection_poems for delete to authenticated
  using (exists (select 1 from public.collections c where c.id = collection_id and c.owner_id = (select auth.uid())));
-- Añadir y reordenar va por funciones (calculan la posición en el servidor).

create policy "mi biblioteca: leer" on public.favorites for select to authenticated
  using (user_id = (select auth.uid()));
create policy "mi biblioteca: guardar" on public.favorites for insert to authenticated
  with check (user_id = (select auth.uid()) and public.can_read_poem(poem_id));
create policy "mi biblioteca: quitar" on public.favorites for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "denunciar un poema visible" on public.reports for insert to authenticated
  with check (reporter_id = (select auth.uid()) and public.can_read_poem(poem_id));

-- ───────────────────────────── Lectura pública (vistas)
--
-- Las vistas se ejecutan con los permisos de su dueño (no con los del
-- visitante), así que son la ÚNICA ventana pública a los datos. Por eso
-- filtran ellas mismas lo publicado y no sacan identificadores internos.

create view public.public_poems as
select
  p.id,
  p.title,
  p.content,
  p.created_at,
  p.updated_at,
  p.published_at,
  case p.publication_identity
    when 'anonymous' then 'Anónimo'
    when 'pseudonym' then coalesce(p.displayed_pseudonym, 'Anónimo')
    else coalesce(nullif(pr.display_name, ''), 'Anónimo')
  end as author_name,
  case when p.publication_identity = 'profile_name' and pr.display_name <> '' then pr.account_name end
    as author_account_name,
  coalesce((
    select jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'normalizedName', t.normalized_name)
                     order by t.normalized_name)
    from public.poem_tags pt join public.tags t on t.id = pt.tag_id
    where pt.poem_id = p.id
  ), '[]'::jsonb) as tags,
  -- «Del poemario…»: solo una colección pública del propio autor, y nunca si
  -- el poema va sin su nombre (delataría la autoría).
  (
    select jsonb_build_object('id', c.id, 'title', c.title)
    from public.collection_poems cp join public.collections c on c.id = cp.collection_id
    where cp.poem_id = p.id and c.owner_id = p.author_id and c.visibility = 'public'
      and p.publication_identity = 'profile_name'
    order by c.created_at
    limit 1
  ) as collection
from public.poems p
join public.profiles pr on pr.id = p.author_id
where p.status = 'published' and p.visibility = 'public';

create view public.public_profiles as
select account_name, display_name, bio, links
from public.profiles
where display_name <> '';

-- Un poema sin firma de su autor no se cuenta ni se muestra en las colecciones
-- públicas de ese mismo autor.
create view public.public_collections as
select
  c.id, c.title, c.description, c.visibility, c.created_at, c.updated_at,
  coalesce(nullif(pr.display_name, ''), 'Sin nombre') as owner_name,
  case when pr.display_name <> '' then pr.account_name end as owner_account_name,
  (
    select count(*)::integer
    from public.collection_poems cp join public.poems p on p.id = cp.poem_id
    where cp.collection_id = c.id and p.status = 'published' and p.visibility = 'public'
      and not (p.author_id = c.owner_id and p.publication_identity <> 'profile_name')
  ) as poem_count
from public.collections c
join public.profiles pr on pr.id = c.owner_id
where c.visibility = 'public';

create view public.public_collection_poems as
select cp.collection_id, cp.position, v.*
from public.collection_poems cp
join public.collections c on c.id = cp.collection_id and c.visibility = 'public'
join public.poems p on p.id = cp.poem_id
join public.public_poems v on v.id = cp.poem_id
where not (p.author_id = c.owner_id and p.publication_identity <> 'profile_name');

create view public.public_tags as
select distinct t.id, t.name, t.normalized_name
from public.tags t
join public.poem_tags pt on pt.tag_id = t.id
join public.poems p on p.id = pt.poem_id
where p.status = 'published' and p.visibility = 'public';

grant select on public.public_poems, public.public_profiles, public.public_collections,
  public.public_collection_poems, public.public_tags to anon, authenticated;

-- ───────────────────────────── Funciones (RPC)
--
-- Las funciones con SECURITY DEFINER saltan RLS, así que cada una comprueba
-- explícitamente quién llama y qué es suyo.

-- Explorar: texto libre en título, versos, autor y etiquetas, sin tildes.
-- Coincide si están todas las palabras o si la búsqueda en español acierta
-- («amores» encuentra «amor»).
create function public.search_public_poems(q text default '', tag text default null, lim integer default 500)
returns setof public.public_poems
language sql stable security definer set search_path = ''
as $$
  with words as (
    select w from regexp_split_to_table(public.f_unaccent(lower(btrim(coalesce(q, '')))), '\s+') as w
    where w <> ''
  )
  select v.*
  from public.public_poems v
  join public.poems p on p.id = v.id
  where (
      coalesce(tag, '') = ''
      or v.tags @> jsonb_build_array(jsonb_build_object('normalizedName', public.normalize_tag(tag)))
    )
    and (
      not exists (select 1 from words)
      or p.fts @@ websearch_to_tsquery('public.spanish_unaccent'::regconfig, q)
      or not exists (
        select 1 from words
        where position(w in public.f_unaccent(lower(concat_ws(' ',
          v.title, v.content, v.author_name,
          (select string_agg(x ->> 'normalizedName', ' ') from jsonb_array_elements(v.tags) as x)
        )))) = 0
      )
    )
  order by v.published_at desc
  limit least(greatest(coalesce(lim, 500), 1), 1000)
$$;

-- Añade un poema (propio o público) a una colección propia, al final.
create function public.add_poem_to_collection(p_collection uuid, p_poem uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Necesitas entrar en tu cuenta para hacer esto.'; end if;
  if not exists (select 1 from public.collections where id = p_collection and owner_id = uid) then
    raise exception 'Esa colección ya no existe.';
  end if;
  if not public.can_read_poem(p_poem) then raise exception 'Ese poema ya no está disponible.'; end if;
  insert into public.collection_poems (collection_id, poem_id, position)
  values (
    p_collection, p_poem,
    coalesce((select max(position) + 1 from public.collection_poems where collection_id = p_collection), 0)
  )
  on conflict do nothing;
  update public.collections set updated_at = now() where id = p_collection;
end $$;

-- Sube (-1) o baja (+1) un poema dentro de una colección propia.
create function public.move_collection_poem(p_collection uuid, p_poem uuid, p_delta integer) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  cur integer;
  other_poem uuid;
  other_pos integer;
begin
  if uid is null then raise exception 'Necesitas entrar en tu cuenta para hacer esto.'; end if;
  if not exists (select 1 from public.collections where id = p_collection and owner_id = uid) then
    raise exception 'Esa colección ya no existe.';
  end if;
  select position into cur from public.collection_poems where collection_id = p_collection and poem_id = p_poem;
  if cur is null then return; end if;
  if p_delta < 0 then
    select poem_id, position into other_poem, other_pos from public.collection_poems
    where collection_id = p_collection and position < cur order by position desc limit 1;
  else
    select poem_id, position into other_poem, other_pos from public.collection_poems
    where collection_id = p_collection and position > cur order by position asc limit 1;
  end if;
  if other_poem is null then return; end if;
  update public.collection_poems set position = other_pos where collection_id = p_collection and poem_id = p_poem;
  update public.collection_poems set position = cur where collection_id = p_collection and poem_id = other_poem;
  update public.collections set updated_at = now() where id = p_collection;
end $$;

-- Crea o edita un poema propio con sus etiquetas, todo en una transacción.
create function public.save_poem(
  p_id uuid,
  p_title text,
  p_content text,
  p_status text,
  p_visibility text,
  p_identity text,
  p_pseudonym text,
  p_tags text[],
  p_collection_id uuid
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  pid uuid;
  tid uuid;
  raw text;
  n text;
  pseudonym text := case when p_identity = 'pseudonym' then nullif(btrim(p_pseudonym), '') end;
begin
  if uid is null then raise exception 'Necesitas entrar en tu cuenta para guardar o publicar.'; end if;
  if cardinality(coalesce(p_tags, '{}')) > 10 then raise exception 'Usa como máximo 10 etiquetas.'; end if;
  if p_status = 'published' and p_identity = 'profile_name'
     and coalesce((select display_name from public.profiles where id = uid), '') = '' then
    raise exception 'Escribe tu nombre público antes de publicar con él.';
  end if;
  if p_status = 'published' and p_identity = 'pseudonym' and pseudonym is null then
    raise exception 'El pseudónimo debe tener entre 2 y 40 caracteres.';
  end if;

  if p_id is not null then
    update public.poems set
      title = nullif(btrim(p_title), ''),
      content = p_content,
      status = p_status,
      visibility = p_visibility,
      publication_identity = p_identity,
      displayed_pseudonym = pseudonym
    where id = p_id and author_id = uid
    returning id into pid;
    if pid is null then raise exception 'No encontramos ese poema entre los tuyos.'; end if;
  else
    insert into public.poems (author_id, title, content, status, visibility, publication_identity, displayed_pseudonym)
    values (uid, nullif(btrim(p_title), ''), p_content, p_status, p_visibility, p_identity, pseudonym)
    returning id into pid;
  end if;

  delete from public.poem_tags where poem_id = pid;
  foreach raw in array coalesce(p_tags, '{}') loop
    n := public.normalize_tag(raw);
    continue when n = '';
    insert into public.tags (name, normalized_name) values (n, n) on conflict (normalized_name) do nothing;
    select id into tid from public.tags where normalized_name = n;
    insert into public.poem_tags (poem_id, tag_id) values (pid, tid) on conflict do nothing;
  end loop;

  if p_collection_id is not null then
    perform public.add_poem_to_collection(p_collection_id, pid);
  end if;
  return pid;
end $$;

-- Borra la cuenta y, en cascada, perfil, poemas, colecciones y biblioteca.
create function public.delete_my_account() returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'Necesitas entrar en tu cuenta para hacer esto.'; end if;
  delete from auth.users where id = auth.uid();
end $$;

-- Por defecto Postgres deja ejecutar funciones a cualquiera: lo cerramos.
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.search_public_poems(text, text, integer) to anon, authenticated;
grant execute on function public.add_poem_to_collection(uuid, uuid) to authenticated;
grant execute on function public.move_collection_poem(uuid, uuid, integer) to authenticated;
grant execute on function public.save_poem(uuid, text, text, text, text, text, text, text[], uuid) to authenticated;
grant execute on function public.delete_my_account() to authenticated;
-- Usadas dentro de políticas, checks y vistas:
grant execute on function public.can_read_poem(uuid), public.f_unaccent(text), public.normalize_tag(text),
  public.slugify(text), public.links_are_http(text[]) to anon, authenticated;
