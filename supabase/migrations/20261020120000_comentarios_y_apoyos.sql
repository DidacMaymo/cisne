-- CISNE · comentarios en los versos y «dejar de apoyar» desde los ajustes.

-- ───────────────────────────── Poemas: comentarios abiertos o cerrados

alter table public.poems add column comments_enabled boolean not null default false;

-- ───────────────────────────── Comentarios en los versos
--
-- Nadie lee ni escribe la tabla directamente: se lee por la vista
-- public_verse_comments y se escribe con las funciones de abajo.

create table public.verse_comments (
  id uuid primary key default gen_random_uuid(),
  poem_id uuid not null references public.poems (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  line integer not null check (line >= 0),
  quote text not null default '' check (char_length(quote) <= 200),
  -- Notas al margen: hasta 50 palabras.
  body text not null check (public.word_count(body) between 1 and 50 and char_length(body) <= 600),
  created_at timestamptz not null default now()
);
create index verse_comments_poem_idx on public.verse_comments (poem_id, line);
alter table public.verse_comments enable row level security;

-- Solo de poemas públicos con los comentarios abiertos. `can_delete` depende
-- de quién mira: quien escribió el comentario o el autor del poema.
create view public.public_verse_comments as
select
  c.id,
  c.poem_id,
  c.line,
  c.quote,
  c.body,
  c.created_at,
  coalesce(nullif(pr.display_name, ''), 'Sin nombre') as author_name,
  case when pr.display_name <> '' then pr.account_name end as author_account_name,
  coalesce(c.user_id = (select auth.uid()) or p.author_id = (select auth.uid()), false) as can_delete
from public.verse_comments c
join public.poems p on p.id = c.poem_id
join public.profiles pr on pr.id = c.user_id
where p.status = 'published' and p.visibility = 'public' and p.comments_enabled;

grant select on public.public_verse_comments to anon, authenticated;

create function public.add_verse_comment(p uuid, p_line integer, p_quote text, p_body text) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  verses integer;
  cid uuid;
begin
  if uid is null then raise exception 'Necesitas entrar en tu cuenta para comentar.'; end if;
  if coalesce((select display_name from public.profiles where id = uid), '') = '' then
    raise exception 'Elige tu nombre público antes de comentar.';
  end if;
  select array_length(string_to_array(content, E'\n'), 1) into verses
  from public.poems
  where id = p and status = 'published' and visibility = 'public' and comments_enabled;
  if verses is null then raise exception 'Este poema no admite comentarios.'; end if;
  if p_line is null or p_line < 0 or p_line >= verses then
    raise exception 'Ese verso ya no existe. Recarga la página.';
  end if;
  if public.word_count(p_body) not between 1 and 50 or char_length(p_body) > 600 then
    raise exception 'El comentario admite hasta 50 palabras.';
  end if;
  insert into public.verse_comments (poem_id, user_id, line, quote, body)
  values (p, uid, p_line, left(btrim(coalesce(p_quote, '')), 200), btrim(p_body))
  returning id into cid;
  return cid;
end $$;

create function public.delete_verse_comment(c uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Necesitas entrar en tu cuenta para hacer esto.'; end if;
  delete from public.verse_comments vc
  using public.poems p
  where vc.id = c and p.id = vc.poem_id and (vc.user_id = uid or p.author_id = uid);
  if not found then raise exception 'No puedes borrar este comentario.'; end if;
end $$;

-- ───────────────────────────── Dejar de apoyar desde los ajustes

create function public.my_supports() returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'authors', coalesce((
      select jsonb_agg(jsonb_build_object('accountName', pr.account_name, 'displayName', pr.display_name)
                       order by s.created_at desc)
      from public.author_supports s join public.profiles pr on pr.id = s.author_id
      where s.user_id = (select auth.uid()) and pr.display_name <> ''
    ), '[]'::jsonb),
    -- Si un poema dejó de ser público, no se enseña ni su título ni su autor.
    'poems', coalesce((
      select jsonb_agg(
        case when v.id is not null then
          jsonb_build_object('id', s.poem_id, 'available', true, 'authorName', v.author_name,
            'title', coalesce(v.title, split_part(btrim(v.content, E'\n '), E'\n', 1)))
        else
          jsonb_build_object('id', s.poem_id, 'available', false, 'authorName', '',
            'title', 'Un poema que ya no es público')
        end
        order by s.created_at desc)
      from public.poem_supports s left join public.public_poems v on v.id = s.poem_id
      where s.user_id = (select auth.uid())
    ), '[]'::jsonb)
  )
$$;

create function public.unsupport_poem(p uuid) returns void
language sql security definer set search_path = ''
as $$ delete from public.poem_supports where user_id = (select auth.uid()) and poem_id = p $$;

create function public.unsupport_author(account text) returns void
language sql security definer set search_path = ''
as $$
  delete from public.author_supports
  where user_id = (select auth.uid())
    and author_id = (select id from public.profiles where account_name = account)
$$;

-- ───────────────────────────── Vistas públicas con `comments_enabled`

drop function public.search_public_poems(text, text, integer, boolean);
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
  p.sensitive,
  p.comments_enabled
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

-- ───────────────────────────── save_poem con `comments_enabled`

drop function public.save_poem(uuid, text, text, text, text, text, text, text[], uuid, text, boolean);

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
  p_sensitive boolean,
  p_comments_enabled boolean
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
      sensitive = coalesce(p_sensitive, false),
      comments_enabled = coalesce(p_comments_enabled, false)
    where id = p_id and author_id = uid
    returning id into pid;
    if pid is null then raise exception 'No encontramos ese poema entre los tuyos.'; end if;
  else
    insert into public.poems (author_id, title, content, status, visibility, publication_identity,
      displayed_pseudonym, font, sensitive, comments_enabled)
    values (uid, nullif(btrim(p_title), ''), p_content, p_status, p_visibility, p_identity, pseudonym,
      coalesce(p_font, 'clasica'), coalesce(p_sensitive, false), coalesce(p_comments_enabled, false))
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
  public.add_verse_comment(uuid, integer, text, text),
  public.delete_verse_comment(uuid),
  public.my_supports(),
  public.unsupport_poem(uuid),
  public.unsupport_author(text),
  public.search_public_poems(text, text, integer, boolean),
  public.save_poem(uuid, text, text, text, text, text, text, text[], uuid, text, boolean, boolean)
from public, anon, authenticated;

grant execute on function public.search_public_poems(text, text, integer, boolean) to anon, authenticated;
grant execute on function
  public.add_verse_comment(uuid, integer, text, text),
  public.delete_verse_comment(uuid),
  public.my_supports(),
  public.unsupport_poem(uuid),
  public.unsupport_author(text),
  public.save_poem(uuid, text, text, text, text, text, text, text[], uuid, text, boolean, boolean)
to authenticated;
