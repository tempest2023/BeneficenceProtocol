-- Store the raw submitting IP for short-lived form rate limiting and move
-- retention maintenance entirely inside PostgreSQL/Supabase Cron.

truncate table public.form_rate_limits;

drop function if exists public.consume_form_rate_limit(text,text,timestamptz,integer,timestamptz);
drop function if exists public.list_retryable_agent_jobs(integer);

alter table public.form_rate_limits drop constraint form_rate_limits_pkey;
alter table public.form_rate_limits
  add column identifier_type text not null default 'ip'
  check (identifier_type in ('ip','email_hash'));
alter table public.form_rate_limits alter column identifier_type drop default;
alter table public.form_rate_limits
  add primary key (rate_key, identifier_type, form_type, window_start);

create or replace function public.consume_form_rate_limit(
  p_rate_key text,
  p_identifier_type text,
  p_form_type text,
  p_window_start timestamptz,
  p_limit integer,
  p_expires_at timestamptz
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
begin
  if p_identifier_type not in ('ip','email_hash') then
    raise exception 'invalid_rate_identifier';
  end if;

  insert into public.form_rate_limits(
    rate_key, identifier_type, form_type, window_start, attempt_count, expires_at
  ) values (
    p_rate_key, p_identifier_type, p_form_type, p_window_start, 1, p_expires_at
  )
  on conflict (rate_key, identifier_type, form_type, window_start)
  do update set attempt_count = public.form_rate_limits.attempt_count + 1
  returning attempt_count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.consume_form_rate_limit(text,text,text,timestamptz,integer,timestamptz)
  from public, anon, authenticated;
grant execute on function public.consume_form_rate_limit(text,text,text,timestamptz,integer,timestamptz)
  to service_role;

create or replace function public.run_retention_maintenance()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.expire_unverified_applications();
  perform public.scrub_expired_applications();
  delete from public.form_rate_limits where expires_at <= now();
end;
$$;

revoke all on function public.run_retention_maintenance()
  from public, anon, authenticated;
grant execute on function public.run_retention_maintenance()
  to service_role;

-- Supabase supports pg_cron. Local PostgreSQL installations that do not ship
-- the extension still apply this migration; production Supabase schedules it.
do $$
declare
  v_job_id bigint;
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;

    select jobid into v_job_id
    from cron.job
    where jobname = 'beneficence-retention-maintenance'
    limit 1;

    if v_job_id is not null then
      perform cron.unschedule(v_job_id);
    end if;

    perform cron.schedule(
      'beneficence-retention-maintenance',
      '17 3 * * *',
      'select public.run_retention_maintenance();'
    );
  end if;
end;
$$;
