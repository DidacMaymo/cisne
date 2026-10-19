-- CISNE · tipografía por poema, «Cisne negro», apoyos y descripción de 150 palabras.

-- ───────────────────────────── Poemas: fuente y Cisne negro

alter table public.poems
  add column font text not null default 'clasica'
    check (font in ('clasica', 'libro', 'pantalla', 'maquina', 'clara')),
  -- «Cisne negro»: el poema toca temas sensibles (+18).
  add column sensitive boolean not null default false;

-- ───────────────────────────── Perfil: visibilidad de los apoyos y bio por palabras

alter table public.profiles
  add column support_visibility text not null default 'private'
    check (support_visibility in ('public', 'private'));
grant update (support_visibility) on public.profiles to authenticated;

create function public.word_count(t text) returns integer
language sql immutable parallel safe set search_path = ''
as $$
  select case when coalesce(btrim(t), '') = '' then 0
    else coalesce(array_length(regexp_split_to_array(btrim(t), '\s+'), 1), 0) end
$$;

alter table public.profiles drop constraint profiles_bio_check;
alter table public.profiles add constraint profiles_bio_check
  check (public.word_count(bio) <= 150 and char_length(bio) <= 2000);

-- ───────────────────────────── Apoyos
--
-- Cada fila es «esta persona apoya este poema / a este autor». Nadie lee las
-- filas ajenas: los números salen solo por las funciones *_support_state,
-- y solo si el autor los ha hecho públicos (o si eres tú).

create table public.poem_supports (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  poem_id uuid not null references public.poems (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, poem_id)
);
create index poem_supports_poem_idx on public.poem_supports (poem_id);

create table public.author_supports (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, author_id),
  check (user_id <> author_id)
);
create index author_supports_author_idx on public.author_supports (author_id);

alter table public.poem_supports enable row level security;
alter table public.author_supports enable row level security;

create policy "mis apoyos a poemas: leer" on public.poem_supports for select to authenticated
  using (user_id = (select auth.uid()));
create policy "mis apoyos a autores: leer" on public.author_supports for select to authenticated
  using (user_id = (select auth.uid()));
-- Apoyar y retirar el apoyo va por funciones, que comprueban las reglas.

create function public.poem_support_state(p uuid) returns jsonb
language sql stable security definer set search_path = ''
as $$
  select coalesce((
    select jsonb_build_object(
      'supported', exists (select 1 from public.poem_supports s where s.poem_id = po.id and s.user_id = (select auth.uid())),
      -- Sin firma, el número nunca se publica: podría señalar a quien lo escribió.
      'count', case
        when po.author_id = (select auth.uid())
          or (po.status = 'published' and po.visibility = 'public'
              and po.publication_identity = 'profile_name' and pr.support_visibility = 'public')
        then (select count(*) from public.poem_supports s where s.poem_id = po.id)::integer
      end,
      'canSupport', po.status = 'published' and po.visibility = 'public'
        and po.author_id is distinct from (select auth.uid())
    )
    from public.poems po join public.profiles pr on pr.id = po.author_id
    where po.id = p and public.can_read_poem(p)
  ), jsonb_build_object('supported', false, 'count', null, 'canSupport', false))
$$;

create function public.toggle_poem_support(p uuid) returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Necesitas entrar en tu cuenta para hacer esto.'; end if;
  if not exists (select 1 from public.poems where id = p and status = 'published' and visibility = 'public') then
    raise exception 'Ese poema ya no está disponible.';
  end if;
  if exists (select 1 from public.poems where id = p and author_id = uid) then
    raise exception 'No puedes apoyar tus propios poemas.';
  end if;
  delete from public.poem_supports where user_id = uid and poem_id = p;
  if found then return false; end if;
  insert into public.poem_supports (user_id, poem_id) values (uid, p);
  return true;
end $$;

create function public.author_support_state(account text) returns jsonb
language sql stable security definer set search_path = ''
as $$
  select coalesce((
    select jsonb_build_object(
      'supported', exists (select 1 from public.author_supports s where s.author_id = pr.id and s.user_id = (select auth.uid())),
      'count', case when pr.id = (select auth.uid()) or pr.support_visibility = 'public'
        then (select count(*) from public.author_supports s where s.author_id = pr.id)::integer end,
      'canSupport', pr.id is distinct from (select auth.uid())
    )
    from public.profiles pr
    where pr.account_name = account and pr.display_name <> ''
  ), jsonb_build_object('supported', false, 'count', null, 'canSupport', false))
$$;

create function public.toggle_author_support(account text) returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  target uuid;
begin
  if uid is null then raise exception 'Necesitas entrar en tu cuenta para hacer esto.'; end if;
  select id into target from public.profiles where account_name = account and display_name <> '';
  if target is null then raise exception 'No encontramos a este autor.'; end if;
  if target = uid then raise exception 'No puedes apoyarte a ti mismo.'; end if;
  delete from public.author_supports where user_id = uid and author_id = target;
  if found then return false; end if;
  insert into public.author_supports (user_id, author_id) values (uid, target);
  return true;
end $$;

-- ───────────────────────────── Vistas públicas con fuente y Cisne negro
--
-- Se rehacen porque cambian sus columnas (y lo que depende de ellas).

drop function public.search_public_poems(text, text, integer);
drop view public.public_collection_poems;
drop view public.public_poems;

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
  (
    select jsonb_build_object('id', c.id, 'title', c.title)
    from public.collection_poems cp join public.collections c on c.id = cp.collection_id
    where cp.poem_id = p.id and c.owner_id = p.author_id and c.visibility = 'public'
      and p.publication_identity = 'profile_name'
    order by c.created_at
    limit 1
  ) as collection,
  p.font,
  p.sensitive
from public.poems p
join public.profiles pr on pr.id = p.author_id
where p.status = 'published' and p.visibility = 'public';

create view public.public_collection_poems as
select cp.collection_id, cp.position, v.*
from public.collection_poems cp
join public.collections c on c.id = cp.collection_id and c.visibility = 'public'
join public.poems p on p.id = cp.poem_id
join public.public_poems v on v.id = cp.poem_id
where not (p.author_id = c.owner_id and p.publication_identity <> 'profile_name');

grant select on public.public_poems, public.public_collection_poems to anon, authenticated;

create function public.search_public_poems(
  q text default '',
  tag text default null,
  lim integer default 500,
  include_sensitive boolean default true
)
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
  where (include_sensitive or not v.sensitive)
    and (
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

-- ───────────────────────────── save_poem con fuente y Cisne negro

drop function public.save_poem(uuid, text, text, text, text, text, text, text[], uuid);

create function public.save_poem(
  p_id uuid,
  p_title text,
  p_content text,
  p_status text,
  p_visibility text,
  p_identity text,
  p_pseudonym text,
  p_tags text[],
  p_collection_id uuid,
  p_font text,
  p_sensitive boolean
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
      displayed_pseudonym = pseudonym,
      font = coalesce(p_font, 'clasica'),
      sensitive = coalesce(p_sensitive, false)
    where id = p_id and author_id = uid
    returning id into pid;
    if pid is null then raise exception 'No encontramos ese poema entre los tuyos.'; end if;
  else
    insert into public.poems
      (author_id, title, content, status, visibility, publication_identity, displayed_pseudonym, font, sensitive)
    values
      (uid, nullif(btrim(p_title), ''), p_content, p_status, p_visibility, p_identity, pseudonym,
       coalesce(p_font, 'clasica'), coalesce(p_sensitive, false))
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

-- ───────────────────────────── Permisos de las funciones nuevas

revoke execute on function
  public.word_count(text),
  public.poem_support_state(uuid),
  public.toggle_poem_support(uuid),
  public.author_support_state(text),
  public.toggle_author_support(text),
  public.search_public_poems(text, text, integer, boolean),
  public.save_poem(uuid, text, text, text, text, text, text, text[], uuid, text, boolean)
from public, anon, authenticated;

grant execute on function public.word_count(text) to anon, authenticated;
grant execute on function public.poem_support_state(uuid), public.author_support_state(text) to anon, authenticated;
grant execute on function public.search_public_poems(text, text, integer, boolean) to anon, authenticated;
grant execute on function public.toggle_poem_support(uuid), public.toggle_author_support(text) to authenticated;
grant execute on function public.save_poem(uuid, text, text, text, text, text, text, text[], uuid, text, boolean)
  to authenticated;
