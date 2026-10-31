-- CISNE · nombre público único, dirección que lo sigue y pseudónimos sin suplantación (F27)
--
-- Compatible con el frontend anterior: no cambia ninguna firma pública, solo
-- añade reglas (triggers) y una columna que el usuario no puede escribir.
-- Los duplicados que ya existan se respetan: las reglas solo se aplican cuando
-- el nombre cambia o se crea uno nuevo.

-- ───────────────────────────── Utilidades

-- «  Ana   LÍA » → «ana lia». Sin la extensión unaccent: translate() directo.
-- Misma regla que `normalizeName` en src/data/names.ts.
create function public.normalize_name(raw text) returns text
language sql immutable parallel safe set search_path = ''
as $$
  select btrim(regexp_replace(lower(translate(
    normalize(coalesce(raw, ''), NFC),
    'ÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜÑÇáàâäãéèêëíìîïóòôöõúùûüñç',
    'AAAAAEEEEIIIIOOOOOUUUUNCaaaaaeeeeiiiiooooouuuunc'
  )), '\s+', ' ', 'g'))
$$;

-- Nombres que nadie puede usar como nombre público ni como pseudónimo.
-- Ojo: «anonimo» y «sin nombre» son los textos que las vistas usan como marcador.
create function public.is_reserved_name(norm text) returns boolean
language sql immutable parallel safe set search_path = ''
as $$
  select norm = any (array[
    'cisne', 'cisneverso', 'equipo de cisne', 'administracion', 'administrador', 'admin',
    'moderacion', 'soporte', 'anonimo', 'anonima', 'sin nombre'
  ])
$$;

-- «12 de noviembre de 2026» (UTC), para los mensajes de error.
create function public.format_date_es(d timestamptz) returns text
language sql immutable parallel safe set search_path = ''
as $$
  select extract(day from d at time zone 'utc')::int::text || ' de '
    || (array['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
              'septiembre', 'octubre', 'noviembre', 'diciembre'])[extract(month from d at time zone 'utc')::int]
    || ' de ' || extract(year from d at time zone 'utc')::int::text
$$;

-- ───────────────────────────── Columna y tabla nuevas

-- Fecha del último cambio de nombre público. La pone solo el trigger (no está
-- en el grant de update). `null` = aún no lo ha cambiado: el primero es libre.
alter table public.profiles add column display_name_changed_at timestamptz;

-- Direcciones /autor/... abandonadas. Siguen reservadas (nadie más las usa) y no
-- redirigen. Sin políticas y sin grants: solo las funciones SECURITY DEFINER.
create table public.retired_account_names (
  account_name text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  retired_at timestamptz not null default now()
);
alter table public.retired_account_names enable row level security;
revoke all on public.retired_account_names from anon, authenticated;

-- ───────────────────────────── Comprobaciones

-- Nombre público libre: ni reservado ni de otra persona. Serializa por nombre
-- normalizado para evitar carreras (dos personas eligiendo el mismo a la vez).
create function public.assert_name_free(norm text, uid uuid) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if public.is_reserved_name(norm) then
    raise exception 'Ese nombre está reservado. Elige otro.';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('cisne:nombre:' || norm, 0));
  if exists (
    select 1 from public.profiles
    where id <> uid and public.normalize_name(display_name) = norm
  ) then
    raise exception 'Ese nombre ya lo usa otra persona. Elige otro.';
  end if;
end $$;

-- Pseudónimo: libre, pero ni reservado ni el nombre público de otra persona.
create function public.assert_pseudonym_allowed(p text, uid uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare norm text := public.normalize_name(p);
begin
  if norm = '' then return; end if;
  if public.is_reserved_name(norm) then
    raise exception 'Ese pseudónimo está reservado. Elige otro.';
  end if;
  if exists (
    select 1 from public.profiles
    where id <> uid and public.normalize_name(display_name) = norm
  ) then
    raise exception 'Ese pseudónimo coincide con el nombre público de otra persona. Elige otro.';
  end if;
end $$;

-- ───────────────────────────── Triggers de profiles

create function public.profiles_name_guard() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  norm text;
  base text;
  candidate text;
  n integer := 2;
begin
  if tg_op = 'UPDATE' and new.display_name is not distinct from old.display_name then
    return new;
  end if;
  new.display_name := btrim(new.display_name);
  norm := public.normalize_name(new.display_name);

  if tg_op = 'INSERT' then
    if norm <> '' then perform public.assert_name_free(norm, new.id); end if;
    return new;
  end if;

  if norm = '' then
    raise exception 'Tu nombre público no puede quedar vacío.';
  end if;
  -- Solo cambian mayúsculas, tildes o espacios: sigue siendo el mismo nombre.
  if norm = public.normalize_name(old.display_name) then
    return new;
  end if;

  if old.display_name <> '' and old.display_name_changed_at is not null
     and old.display_name_changed_at + interval '30 days' > now() then
    raise exception 'Solo puedes cambiar tu nombre público una vez cada 30 días. Podrás volver a cambiarlo a partir del %.',
      public.format_date_es(old.display_name_changed_at + interval '30 days');
  end if;
  perform public.assert_name_free(norm, new.id);

  -- La dirección sigue al nombre. La anterior queda reservada y no redirige.
  base := coalesce(nullif(public.slugify(new.display_name), ''), 'autor');
  perform pg_advisory_xact_lock(hashtextextended('cisne:cuenta:' || base, 0));
  candidate := base;
  while candidate <> old.account_name and (
    exists (select 1 from public.profiles where account_name = candidate and id <> new.id)
    or exists (select 1 from public.retired_account_names where account_name = candidate and user_id <> new.id)
  ) loop
    candidate := base || '-' || n;
    n := n + 1;
  end loop;
  if candidate <> old.account_name then
    insert into public.retired_account_names (account_name, user_id)
    values (old.account_name, new.id) on conflict do nothing;
    delete from public.retired_account_names where account_name = candidate and user_id = new.id;
    new.account_name := candidate;
  end if;

  -- Elegir el primer nombre (venía vacío) no cuenta como cambio.
  if old.display_name <> '' then new.display_name_changed_at := now(); end if;
  return new;
end $$;

create trigger profiles_name_guard before insert or update of display_name on public.profiles
  for each row execute function public.profiles_name_guard();

create function public.profiles_pseudonym_guard() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.primary_pseudonym is not distinct from old.primary_pseudonym then
    return new;
  end if;
  if new.primary_pseudonym is not null then
    perform public.assert_pseudonym_allowed(new.primary_pseudonym, new.id);
  end if;
  return new;
end $$;

create trigger profiles_pseudonym_guard before insert or update of primary_pseudonym on public.profiles
  for each row execute function public.profiles_pseudonym_guard();

-- ───────────────────────────── Alta de usuarios

-- Si el nombre elegido al registrarse está reservado o ya lo usa otra persona,
-- el perfil se crea sin nombre público (se elige después en Ajustes) en lugar de
-- romper el registro. La dirección no se deriva de un nombre rechazado.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  shown text := left(btrim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), 60);
  norm text := public.normalize_name(shown);
  base text;
  candidate text;
  n integer := 2;
begin
  if norm <> '' then
    perform pg_advisory_xact_lock(hashtextextended('cisne:nombre:' || norm, 0));
    if public.is_reserved_name(norm)
       or exists (select 1 from public.profiles where public.normalize_name(display_name) = norm) then
      shown := '';
    end if;
  end if;
  base := coalesce(nullif(public.slugify(shown), ''), 'autor');
  perform pg_advisory_xact_lock(hashtextextended('cisne:cuenta:' || base, 0));
  candidate := base;
  while exists (select 1 from public.profiles where account_name = candidate)
     or exists (select 1 from public.retired_account_names where account_name = candidate) loop
    candidate := base || '-' || n;
    n := n + 1;
  end loop;
  insert into public.profiles (id, account_name, display_name) values (new.id, candidate, shown);
  return new;
end $$;

-- ───────────────────────────── save_poem: pseudónimo sin suplantación

create or replace function public.save_poem(
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
  -- Un pseudónimo que ya tenía el poema no se vuelve a comprobar (no bloquea editarlo).
  if pseudonym is not null
     and pseudonym is distinct from (select displayed_pseudonym from public.poems where id = p_id and author_id = uid) then
    perform public.assert_pseudonym_allowed(pseudonym, uid);
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

-- ───────────────────────────── Permisos

-- Funciones internas: solo las llaman triggers y funciones SECURITY DEFINER.
revoke execute on function
  public.assert_name_free(text, uuid),
  public.assert_pseudonym_allowed(text, uuid),
  public.profiles_name_guard(),
  public.profiles_pseudonym_guard()
from public, anon, authenticated;
