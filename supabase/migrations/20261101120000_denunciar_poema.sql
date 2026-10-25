-- F09: denunciar un poema. Se hace solo por la función `report_poem` (no por
-- insert directo), que valida y da mensajes claros. Se revisan desde el panel.

alter table public.reports
  add column category text check (category in ('odio', 'acoso', 'plagio', 'otro')),
  add column detail text check (detail is null or char_length(detail) <= 600);

-- Una denuncia por persona y poema.
alter table public.reports add constraint reports_one_per_person unique (reporter_id, poem_id);

-- Sin insert directo: solo la función de abajo.
drop policy "denunciar un poema visible" on public.reports;
revoke insert, select, update, delete on public.reports from anon, authenticated;

create function public.report_poem(p uuid, p_category text, p_detail text default null) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  label text;
  d text := nullif(btrim(coalesce(p_detail, '')), '');
begin
  if uid is null then raise exception 'Necesitas entrar en tu cuenta para denunciar.'; end if;
  label := case p_category
    when 'odio' then 'Contenido de odio u ofensivo'
    when 'acoso' then 'Acoso a una persona'
    when 'plagio' then 'Plagio: no es de quien lo firma'
    when 'otro' then 'Otro motivo'
  end;
  if label is null then raise exception 'Elige un motivo.'; end if;
  if d is not null and (public.word_count(d) > 50 or char_length(d) > 600) then
    raise exception 'La explicación admite hasta 50 palabras.';
  end if;
  if p_category = 'otro' and d is null then
    raise exception 'Cuéntanos brevemente el motivo.';
  end if;
  if not public.can_read_poem(p) then raise exception 'Este poema no existe o es privado.'; end if;
  if exists (select 1 from public.poems where id = p and author_id = uid) then
    raise exception 'No puedes denunciar tu propio poema.';
  end if;
  if exists (select 1 from public.reports where reporter_id = uid and poem_id = p) then
    raise exception 'Ya has denunciado este poema. Lo revisaremos.';
  end if;
  insert into public.reports (reporter_id, poem_id, category, detail, reason)
  values (uid, p, p_category, d, case when d is null then label else label || ' — ' || d end);
end $$;

revoke execute on function public.report_poem(uuid, text, text) from public, anon, authenticated;
grant execute on function public.report_poem(uuid, text, text) to authenticated;
