-- Keep development and production data in the same Supabase project while
-- giving every application table an explicit environment prefix.
--
-- Existing records are development/test records, so the current tables are
-- renamed to dev_*. A structurally identical, empty prod_* set is created for
-- the production deployment. Application RPCs are generated for both sets.

begin;

create temporary table environment_function_templates on commit drop as
select
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as identity_arguments,
  pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = any(array[
    'is_admin',
    'ensure_email_contact',
    'consume_form_rate_limit',
    'register_community_participant',
    'create_contributor_application',
    'create_resource_submission',
    'verify_contributor_application',
    'get_public_community_metrics',
    'claim_agent_job',
    'fail_agent_job',
    'scrub_expired_applications',
    'expire_unverified_applications',
    'delete_community_participant_data',
    'admin_add_identity_contact',
    'merge_community_contacts',
    'run_retention_maintenance'
  ]);

alter table public.community_contacts rename to dev_community_contacts;
alter table public.contact_identities rename to dev_contact_identities;
alter table public.member_count_events rename to dev_member_count_events;
alter table public.community_participants rename to dev_community_participants;
alter table public.contributor_applications rename to dev_contributor_applications;
alter table public.contributors rename to dev_contributors;
alter table public.people rename to dev_people;
alter table public.resources rename to dev_resources;
alter table public.resource_submissions rename to dev_resource_submissions;
alter table public.events rename to dev_events;
alter table public.event_sessions rename to dev_event_sessions;
alter table public.agent_jobs rename to dev_agent_jobs;
alter table public.agent_runs rename to dev_agent_runs;
alter table public.email_deliveries rename to dev_email_deliveries;
alter table public.site_settings rename to dev_site_settings;
alter table public.admin_users rename to dev_admin_users;
alter table public.admin_audit_log rename to dev_admin_audit_log;
alter table public.form_rate_limits rename to dev_form_rate_limits;

create table public.prod_community_contacts (like public.dev_community_contacts including all);
create table public.prod_contact_identities (like public.dev_contact_identities including all);
create table public.prod_member_count_events (like public.dev_member_count_events including all);
create table public.prod_community_participants (like public.dev_community_participants including all);
create table public.prod_contributor_applications (like public.dev_contributor_applications including all);
create table public.prod_contributors (like public.dev_contributors including all);
create table public.prod_people (like public.dev_people including all);
create table public.prod_resources (like public.dev_resources including all);
create table public.prod_resource_submissions (like public.dev_resource_submissions including all);
create table public.prod_events (like public.dev_events including all);
create table public.prod_event_sessions (like public.dev_event_sessions including all);
create table public.prod_agent_jobs (like public.dev_agent_jobs including all);
create table public.prod_agent_runs (like public.dev_agent_runs including all);
create table public.prod_email_deliveries (like public.dev_email_deliveries including all);
create table public.prod_site_settings (like public.dev_site_settings including all);
create table public.prod_admin_users (like public.dev_admin_users including all);
create table public.prod_admin_audit_log (like public.dev_admin_audit_log including all);
create table public.prod_form_rate_limits (like public.dev_form_rate_limits including all);

-- CREATE TABLE LIKE copies columns, defaults, checks, and indexes, but not
-- foreign keys. These existing integrity relationships are repeated so that
-- PostgREST can resolve embedded People, Contributor, and event-session reads.
alter table public.prod_contact_identities
  add foreign key (contact_id) references public.prod_community_contacts(id) on delete cascade;
alter table public.prod_member_count_events
  add foreign key (contact_id) references public.prod_community_contacts(id) on delete set null;
alter table public.prod_community_participants
  add foreign key (contact_id) references public.prod_community_contacts(id);
alter table public.prod_contributor_applications
  add foreign key (contact_id) references public.prod_community_contacts(id);
alter table public.prod_contributors
  add foreign key (contact_id) references public.prod_community_contacts(id),
  add foreign key (application_id) references public.prod_contributor_applications(id);
alter table public.prod_people
  add foreign key (contact_id) references public.prod_community_contacts(id),
  add foreign key (contributor_id) references public.prod_contributors(id),
  add foreign key (nominating_director_id) references public.prod_people(id);
alter table public.prod_resource_submissions
  add foreign key (contact_id) references public.prod_community_contacts(id),
  add foreign key (created_resource_id) references public.prod_resources(id);
alter table public.prod_resources
  add foreign key (source_submission_id) references public.prod_resource_submissions(id);
alter table public.prod_event_sessions
  add foreign key (event_id) references public.prod_events(id) on delete cascade;
alter table public.prod_agent_runs
  add foreign key (agent_job_id) references public.prod_agent_jobs(id);
alter table public.prod_admin_users
  add foreign key (user_id) references auth.users(id) on delete cascade;

-- Remove the policies carried over by the renamed development tables. Both
-- environments receive freshly named policies below.
do $$
declare
  policy_record record;
begin
  for policy_record in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename like 'dev\_%' escape '\'
  loop
    execute format('drop policy %I on public.%I', policy_record.policyname, policy_record.tablename);
  end loop;
end;
$$;

-- Generate matching environment-scoped functions from the already-reviewed
-- function definitions. Every public table/function reference is rewritten.
do $$
declare
  prefix text;
  template record;
  definition text;
  object_name text;
  object_names constant text[] := array[
    'community_contacts',
    'contact_identities',
    'member_count_events',
    'community_participants',
    'contributor_applications',
    'contributors',
    'people',
    'resources',
    'resource_submissions',
    'events',
    'event_sessions',
    'agent_jobs',
    'agent_runs',
    'email_deliveries',
    'site_settings',
    'admin_users',
    'admin_audit_log',
    'form_rate_limits',
    'is_admin',
    'ensure_email_contact',
    'consume_form_rate_limit',
    'register_community_participant',
    'create_contributor_application',
    'create_resource_submission',
    'verify_contributor_application',
    'get_public_community_metrics',
    'claim_agent_job',
    'fail_agent_job',
    'scrub_expired_applications',
    'expire_unverified_applications',
    'delete_community_participant_data',
    'admin_add_identity_contact',
    'merge_community_contacts',
    'run_retention_maintenance'
  ];
begin
  foreach prefix in array array['dev_', 'prod_']
  loop
    for template in select * from environment_function_templates
    loop
      definition := template.definition;
      foreach object_name in array object_names
      loop
        definition := replace(
          definition,
          'public.' || object_name,
          'public.' || prefix || object_name
        );
      end loop;

      -- The original constraint name stays attached to the renamed dev table,
      -- while PostgreSQL generates a different name for the cloned prod table.
      -- Column inference works identically for both environments.
      definition := replace(
        definition,
        'on conflict on constraint community_participants_contact_id_key',
        'on conflict (contact_id)'
      );
      definition := replace(
        definition,
        'RETURNS SETOF agent_jobs',
        'RETURNS SETOF public.' || prefix || 'agent_jobs'
      );

      execute definition;
    end loop;
  end loop;
end;
$$;

-- The unprefixed administrative predicate remains only for the shared Storage
-- bucket policies. Application tables always use an environment-scoped one.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.dev_is_admin() or public.prod_is_admin();
$$;

-- One database scheduler invocation maintains both table sets.
create or replace function public.run_retention_maintenance()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.dev_run_retention_maintenance();
  perform public.prod_run_retention_maintenance();
end;
$$;

do $$
declare
  template record;
begin
  for template in
    select * from environment_function_templates
    where function_name not in ('is_admin', 'run_retention_maintenance')
  loop
    execute format(
      'drop function public.%I(%s)',
      template.function_name,
      template.identity_arguments
    );
  end loop;
end;
$$;

do $$
declare
  prefix text;
  table_name text;
  function_record record;
  full_table_name text;
  full_function_name text;
  table_names constant text[] := array[
    'community_contacts',
    'contact_identities',
    'member_count_events',
    'community_participants',
    'contributor_applications',
    'contributors',
    'people',
    'resources',
    'resource_submissions',
    'events',
    'event_sessions',
    'agent_jobs',
    'agent_runs',
    'email_deliveries',
    'site_settings',
    'admin_users',
    'admin_audit_log',
    'form_rate_limits'
  ];
begin
  foreach prefix in array array['dev_', 'prod_']
  loop
    foreach table_name in array table_names
    loop
      full_table_name := prefix || table_name;
      execute format('alter table public.%I enable row level security', full_table_name);
      execute format('revoke all on table public.%I from anon, authenticated', full_table_name);
      execute format('grant all privileges on table public.%I to service_role', full_table_name);
    end loop;

    execute format(
      'create policy %I on public.%I for select using (publication_status = ''published'' and publication_consent_at is not null)',
      prefix || 'public_people_read', prefix || 'people'
    );
    execute format(
      'create policy %I on public.%I for select using (publication_status = ''published'')',
      prefix || 'public_resources_read', prefix || 'resources'
    );
    execute format(
      'create policy %I on public.%I for select using (publication_status = ''published'')',
      prefix || 'public_events_read', prefix || 'events'
    );
    execute format(
      'create policy %I on public.%I for select using (exists(select 1 from public.%I e where e.id = event_id and e.publication_status = ''published''))',
      prefix || 'public_event_sessions_read', prefix || 'event_sessions', prefix || 'events'
    );

    execute format('grant select on public.%I, public.%I, public.%I, public.%I to anon, authenticated',
      prefix || 'people', prefix || 'resources', prefix || 'events', prefix || 'event_sessions');

    foreach table_name in array table_names
    loop
      full_table_name := prefix || table_name;
      if table_name = 'admin_users' then
        execute format(
          'create policy %I on public.%I for select using (public.%I() or user_id = auth.uid())',
          prefix || 'admin_users_read', full_table_name, prefix || 'is_admin'
        );
      elsif table_name = 'admin_audit_log' then
        execute format(
          'create policy %I on public.%I for select using (public.%I())',
          prefix || 'admin_audit_read', full_table_name, prefix || 'is_admin'
        );
      else
        execute format(
          'create policy %I on public.%I for all using (public.%I()) with check (public.%I())',
          prefix || 'admin_' || table_name, full_table_name, prefix || 'is_admin', prefix || 'is_admin'
        );
      end if;
    end loop;

    for function_record in select * from environment_function_templates
    loop
      full_function_name := prefix || function_record.function_name;
      execute format(
        'revoke all on function public.%I(%s) from public, anon, authenticated',
        full_function_name,
        function_record.identity_arguments
      );

      if function_record.function_name = 'get_public_community_metrics' then
        execute format(
          'grant execute on function public.%I(%s) to anon, authenticated',
          full_function_name,
          function_record.identity_arguments
        );
      elsif function_record.function_name = 'is_admin' then
        execute format(
          'grant execute on function public.%I(%s) to authenticated, service_role',
          full_function_name,
          function_record.identity_arguments
        );
      else
        execute format(
          'grant execute on function public.%I(%s) to service_role',
          full_function_name,
          function_record.identity_arguments
        );
      end if;
    end loop;
  end loop;
end;
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;
revoke all on function public.run_retention_maintenance() from public, anon, authenticated;
grant execute on function public.run_retention_maintenance() to service_role;

commit;
