-- Beneficence community, publishing, administration, and Agent workflow schema.
-- Apply with the Supabase CLI after reviewing against the target project.

create extension if not exists pgcrypto;

create table public.community_contacts (
  id uuid primary key default gen_random_uuid(),
  first_source text not null check (first_source in ('community_registration','contributor_application','resource_submission','github_contributor','director','core_contributor','manual')),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.contact_identities (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.community_contacts(id) on delete cascade,
  identity_kind text not null check (identity_kind in ('email','github')),
  normalized_value text not null,
  created_at timestamptz not null default now(),
  unique (identity_kind, normalized_value)
);
create index contact_identities_contact_idx on public.contact_identities(contact_id);

create table public.member_count_events (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid unique references public.community_contacts(id) on delete set null,
  source text not null check (source in ('community_registration','contributor_application','resource_submission','github_contributor','director','core_contributor','manual')),
  occurred_at timestamptz not null default now()
);
create index member_count_events_occurred_idx on public.member_count_events(occurred_at);

create table public.community_participants (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null unique references public.community_contacts(id),
  email text not null,
  name text,
  industry text not null,
  industry_other text,
  location_scope text not null check (location_scope in ('united_states','international')),
  country text not null,
  us_state text,
  city_region text not null,
  communications_consent_at timestamptz not null,
  privacy_consent_at timestamptz not null,
  subscription_status text not null default 'subscribed' check (subscription_status in ('subscribed','unsubscribed','deleted')),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index community_participants_filter_idx on public.community_participants(industry, country, us_state, city_region);

create table public.contributor_applications (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.community_contacts(id),
  name text not null,
  email text not null,
  industry text,
  industry_other text,
  location_scope text not null check (location_scope in ('united_states','international')),
  country text not null,
  us_state text,
  city_region text not null,
  participation_reasons text[] not null,
  participation_reason_other text,
  contribution_areas text[] not null,
  contribution_area_other text,
  personal_website text,
  github_url text,
  scholar_url text,
  linkedin_url text,
  profile_willingness text check (profile_willingness is null or profile_willingness in ('yes_if_invited','not_now','discuss_later')),
  privacy_consent_at timestamptz not null,
  conduct_consent_at timestamptz not null,
  status text not null default 'email_pending' check (status in ('email_pending','submitted','agent_processing','reviewing','auto_rejected','invitation_sent','meeting_scheduled','conversation_complete','contributor','closed')),
  verification_token_hash text,
  verification_expires_at timestamptz,
  verification_used_at timestamptz,
  email_verified_at timestamptz,
  agent_output jsonb,
  agent_processed_at timestamptz,
  auto_reject_disabled boolean not null default false,
  closed_at timestamptz,
  retention_expires_at timestamptz,
  meeting_notes text,
  host_decision text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index contributor_verification_token_idx on public.contributor_applications(verification_token_hash) where verification_token_hash is not null;
create index contributor_applications_status_idx on public.contributor_applications(status, created_at desc);

create table public.contributors (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null unique references public.community_contacts(id),
  application_id uuid references public.contributor_applications(id),
  status text not null default 'active' check (status in ('active','inactive')),
  became_contributor_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.people (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid unique references public.community_contacts(id),
  contributor_id uuid unique references public.contributors(id),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  display_name text not null,
  person_type text not null check (person_type in ('director','core_contributor')),
  role text not null,
  responsibilities text,
  biography text,
  region text,
  photo_url text,
  photo_alt text,
  photo_source text,
  photo_permission_notes text,
  website_url text,
  github_url text,
  scholar_url text,
  linkedin_url text,
  current_work text,
  active_since date,
  nominating_director_id uuid references public.people(id),
  effective_date date,
  publication_consent_at timestamptz,
  publication_status text not null default 'draft' check (publication_status in ('draft','published','withdrawn','archived')),
  featured boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint core_contributor_nomination check (person_type <> 'core_contributor' or (contributor_id is not null and nominating_director_id is not null and effective_date is not null)),
  constraint published_people_require_consent check (publication_status <> 'published' or publication_consent_at is not null),
  constraint photos_require_metadata check (photo_url is null or (photo_alt is not null and photo_source is not null and photo_permission_notes is not null))
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  summary text not null,
  public_url text not null,
  public_url_normalized text generated always as (lower(trim(public_url))) stored,
  resource_type text not null check (resource_type in ('Video','Article / Document','Course','Paper Discussion','Tool / Reference')),
  language text not null,
  difficulty text,
  topics text[] not null default '{}',
  author_publisher text,
  access_notes text,
  access_verified_at timestamptz,
  access_verified_by uuid,
  publication_status text not null default 'draft' check (publication_status in ('draft','published','archived')),
  featured boolean not null default false,
  sort_order integer not null default 100,
  source_submission_id uuid,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_resources_require_verification check (publication_status <> 'published' or (access_verified_at is not null and access_verified_by is not null))
);
create index resources_public_idx on public.resources(publication_status, sort_order, published_at desc);

create table public.resource_submissions (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.community_contacts(id),
  contact_email text not null,
  submitter_name text,
  title text not null,
  public_url text not null,
  public_url_normalized text generated always as (lower(trim(public_url))) stored,
  format text not null check (format in ('Video','Article / Document','Course','Paper Discussion','Tool / Reference')),
  language text not null,
  description text not null,
  ai_agent_relevance text not null,
  author_publisher text not null,
  access_confirmed_at timestamptz not null,
  copyright_confirmed_at timestamptz not null,
  privacy_consent_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','in_review','changes_requested','approved','rejected')),
  agent_output jsonb,
  reviewed_by uuid,
  reviewed_at timestamptz,
  review_notes text,
  created_resource_id uuid references public.resources(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.resources add constraint resources_source_submission_fk foreign key (source_submission_id) references public.resource_submissions(id);
create index resource_submissions_status_idx on public.resource_submissions(status, created_at desc);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  summary text not null,
  body text,
  format text not null check (format in ('online','in_person','hybrid')),
  timezone text not null,
  country text,
  state_region text,
  city text,
  venue_description text,
  attendance_limit integer check (attendance_limit is null or attendance_limit > 0),
  attendance_status text not null default 'open' check (attendance_status in ('open','waitlist','full','closed')),
  external_registration_url text not null,
  organizers text,
  partners text,
  conference_relationship text,
  relationship text not null check (relationship in ('Independent','Beneficence-hosted','Co-hosted','Partner event','Official conference event')),
  approval_reference text,
  image_url text,
  image_alt text,
  image_source text,
  image_permission_notes text,
  publication_status text not null default 'draft' check (publication_status in ('draft','published','cancelled','archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint relationship_approval check (relationship not in ('Partner event','Official conference event') or approval_reference is not null),
  constraint event_images_require_metadata check (image_url is null or (image_alt is not null and image_source is not null and image_permission_notes is not null))
);

create table public.event_sessions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  constraint session_order check (ends_at > starts_at)
);
create index event_sessions_event_idx on public.event_sessions(event_id, starts_at);

create table public.agent_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null check (job_type in ('contributor_application','resource_submission')),
  record_id uuid not null,
  status text not null default 'pending' check (status in ('waiting_verification','pending','in_progress','retry','completed','failed')),
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  claimed_at timestamptz,
  completed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index agent_jobs_retry_idx on public.agent_jobs(status, available_at);

create table public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_job_id uuid not null references public.agent_jobs(id),
  workflow text not null,
  model text not null,
  prompt_version text not null,
  provider_response_id text,
  structured_output jsonb not null,
  moderation_output jsonb,
  evidence jsonb not null default '[]',
  confidence numeric,
  decision text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.email_deliveries (
  id uuid primary key default gen_random_uuid(),
  recipient_email text not null,
  category text not null,
  related_type text,
  related_id uuid,
  provider_id text,
  status text not null check (status in ('sent','failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  setting_key text primary key,
  setting_value text not null,
  updated_by uuid,
  updated_at timestamptz not null default now()
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_type text not null check (actor_type in ('admin','agent','system')),
  actor_id text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index admin_audit_created_idx on public.admin_audit_log(created_at desc);

create table public.form_rate_limits (
  rate_key text not null,
  form_type text not null,
  window_start timestamptz not null,
  attempt_count integer not null default 1,
  expires_at timestamptz not null,
  primary key (rate_key, form_type, window_start)
);
create index form_rate_limits_expiry_idx on public.form_rate_limits(expires_at);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid() and active = true);
$$;

create or replace function public.ensure_email_contact(p_email text, p_source text)
returns table(contact_id uuid, is_new boolean)
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_email text := lower(trim(p_email));
  v_contact uuid;
  v_new uuid;
begin
  select ci.contact_id into v_contact from public.contact_identities ci where ci.identity_kind = 'email' and ci.normalized_value = v_email;
  if v_contact is not null then
    update public.community_contacts set last_seen_at = now() where id = v_contact;
    return query select v_contact, false;
    return;
  end if;
  insert into public.community_contacts(first_source) values (p_source) returning id into v_new;
  insert into public.contact_identities(contact_id, identity_kind, normalized_value)
    values (v_new, 'email', v_email) on conflict (identity_kind, normalized_value) do nothing;
  if not found then
    delete from public.community_contacts where id = v_new;
    select ci.contact_id into v_contact from public.contact_identities ci where ci.identity_kind = 'email' and ci.normalized_value = v_email;
    update public.community_contacts set last_seen_at = now() where id = v_contact;
    return query select v_contact, false;
  else
    insert into public.member_count_events(contact_id, source) values (v_new, p_source) on conflict do nothing;
    return query select v_new, true;
  end if;
end;
$$;

create or replace function public.consume_form_rate_limit(p_rate_key text, p_form_type text, p_window_start timestamptz, p_limit integer, p_expires_at timestamptz)
returns boolean language plpgsql security definer set search_path = public, pg_temp as $$
declare v_count integer;
begin
  insert into public.form_rate_limits(rate_key, form_type, window_start, attempt_count, expires_at)
  values (p_rate_key, p_form_type, p_window_start, 1, p_expires_at)
  on conflict (rate_key, form_type, window_start) do update set attempt_count = public.form_rate_limits.attempt_count + 1
  returning attempt_count into v_count;
  return v_count <= p_limit;
end;
$$;

create or replace function public.register_community_participant(
  p_email text, p_name text, p_industry text, p_industry_other text, p_location_scope text,
  p_country text, p_us_state text, p_city_region text, p_communications_consent boolean, p_privacy_consent boolean
) returns table(contact_id uuid, participant_id uuid, is_new_member boolean)
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_contact uuid; v_new boolean; v_participant uuid;
begin
  if not p_communications_consent or not p_privacy_consent then raise exception 'consent_required'; end if;
  select e.contact_id, e.is_new into v_contact, v_new from public.ensure_email_contact(p_email, 'community_registration') e;
  insert into public.community_participants(contact_id,email,name,industry,industry_other,location_scope,country,us_state,city_region,communications_consent_at,privacy_consent_at)
  values (v_contact,lower(trim(p_email)),nullif(trim(p_name),''),p_industry,nullif(trim(p_industry_other),''),p_location_scope,p_country,p_us_state,p_city_region,now(),now())
  on conflict on constraint community_participants_contact_id_key do update set email=excluded.email,name=coalesce(excluded.name,public.community_participants.name),industry=excluded.industry,industry_other=excluded.industry_other,location_scope=excluded.location_scope,country=excluded.country,us_state=excluded.us_state,city_region=excluded.city_region,communications_consent_at=now(),privacy_consent_at=now(),subscription_status='subscribed',unsubscribed_at=null,updated_at=now()
  returning id into v_participant;
  return query select v_contact, v_participant, v_new;
end;
$$;

create or replace function public.create_contributor_application(
  p_name text, p_email text, p_industry text, p_industry_other text, p_location_scope text,
  p_country text, p_us_state text, p_city_region text, p_participation_reasons text[], p_participation_reason_other text,
  p_contribution_areas text[], p_contribution_area_other text, p_personal_website text, p_github_url text,
  p_scholar_url text, p_linkedin_url text, p_profile_willingness text, p_verification_token_hash text,
  p_verification_expires_at timestamptz, p_privacy_consent boolean, p_conduct_consent boolean
) returns table(application_id uuid, contact_id uuid, job_id uuid, is_new_member boolean)
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_contact uuid; v_new boolean; v_application uuid; v_job uuid;
begin
  if not p_privacy_consent or not p_conduct_consent then raise exception 'consent_required'; end if;
  select e.contact_id, e.is_new into v_contact, v_new from public.ensure_email_contact(p_email, 'contributor_application') e;
  insert into public.contributor_applications(contact_id,name,email,industry,industry_other,location_scope,country,us_state,city_region,participation_reasons,participation_reason_other,contribution_areas,contribution_area_other,personal_website,github_url,scholar_url,linkedin_url,profile_willingness,privacy_consent_at,conduct_consent_at,verification_token_hash,verification_expires_at)
  values (v_contact,p_name,lower(trim(p_email)),p_industry,p_industry_other,p_location_scope,p_country,p_us_state,p_city_region,p_participation_reasons,p_participation_reason_other,p_contribution_areas,p_contribution_area_other,p_personal_website,p_github_url,p_scholar_url,p_linkedin_url,p_profile_willingness,now(),now(),p_verification_token_hash,p_verification_expires_at)
  returning id into v_application;
  insert into public.agent_jobs(job_type,record_id,status) values ('contributor_application',v_application,'waiting_verification') returning id into v_job;
  return query select v_application, v_contact, v_job, v_new;
end;
$$;

create or replace function public.create_resource_submission(
  p_contact_email text, p_submitter_name text, p_title text, p_public_url text, p_format text, p_language text,
  p_description text, p_ai_agent_relevance text, p_author_publisher text, p_access_confirmation boolean,
  p_copyright_confirmation boolean, p_privacy_consent boolean
) returns table(submission_id uuid, contact_id uuid, job_id uuid, is_new_member boolean)
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_contact uuid; v_new boolean; v_submission uuid; v_job uuid;
begin
  if not p_access_confirmation or not p_copyright_confirmation or not p_privacy_consent then raise exception 'consent_required'; end if;
  select e.contact_id, e.is_new into v_contact, v_new from public.ensure_email_contact(p_contact_email, 'resource_submission') e;
  insert into public.resource_submissions(contact_id,contact_email,submitter_name,title,public_url,format,language,description,ai_agent_relevance,author_publisher,access_confirmed_at,copyright_confirmed_at,privacy_consent_at)
  values (v_contact,lower(trim(p_contact_email)),nullif(trim(p_submitter_name),''),p_title,p_public_url,p_format,p_language,p_description,p_ai_agent_relevance,p_author_publisher,now(),now(),now()) returning id into v_submission;
  insert into public.agent_jobs(job_type,record_id) values ('resource_submission',v_submission) returning id into v_job;
  return query select v_submission, v_contact, v_job, v_new;
end;
$$;

create or replace function public.verify_contributor_application(p_token_hash text)
returns table(application_id uuid, job_id uuid, email text, name text)
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_application public.contributor_applications%rowtype; v_job uuid;
begin
  select * into v_application from public.contributor_applications
  where verification_token_hash = p_token_hash and verification_used_at is null and verification_expires_at > now() and status = 'email_pending'
  for update;
  if not found then return; end if;
  update public.contributor_applications set status='submitted',verification_used_at=now(),email_verified_at=now(),verification_token_hash=null,updated_at=now() where id=v_application.id;
  select id into v_job from public.agent_jobs where job_type='contributor_application' and record_id=v_application.id and status='waiting_verification' order by created_at desc limit 1 for update;
  if v_job is null then
    insert into public.agent_jobs(job_type,record_id) values ('contributor_application',v_application.id) returning id into v_job;
  else
    update public.agent_jobs set status='pending',available_at=now(),updated_at=now() where id=v_job;
  end if;
  return query select v_application.id,v_job,v_application.email,v_application.name;
end;
$$;

create or replace function public.get_public_community_metrics()
returns table(all_time bigint, this_month bigint, by_source jsonb)
language sql stable security definer set search_path = public, pg_temp as $$
  select count(*)::bigint,
    count(*) filter (where occurred_at >= date_trunc('month', now()))::bigint,
    coalesce((select jsonb_object_agg(source,total) from (select source,count(*)::bigint total from public.member_count_events group by source) s),'{}'::jsonb)
  from public.member_count_events;
$$;

create or replace function public.claim_agent_job(p_job_id uuid)
returns setof public.agent_jobs language sql security definer set search_path = public, pg_temp as $$
  update public.agent_jobs set status='in_progress',attempts=attempts+1,claimed_at=now(),updated_at=now()
  where id=p_job_id and status in ('pending','retry') and available_at <= now()
  returning *;
$$;

create or replace function public.fail_agent_job(p_job_id uuid, p_error text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_attempts integer;
begin
  select attempts into v_attempts from public.agent_jobs where id=p_job_id for update;
  update public.agent_jobs set status=case when v_attempts >= 3 then 'failed' else 'retry' end,
    available_at=case when v_attempts >= 3 then available_at else now() + make_interval(mins => (2 ^ greatest(v_attempts-1,0))::integer) end,
    last_error=p_error,updated_at=now() where id=p_job_id;
end;
$$;

create or replace function public.list_retryable_agent_jobs(p_limit integer default 10)
returns setof public.agent_jobs language sql security definer set search_path = public, pg_temp as $$
  select * from public.agent_jobs where status in ('pending','retry') and available_at <= now() order by available_at for update skip locked limit p_limit;
$$;

create or replace function public.scrub_expired_applications()
returns integer language plpgsql security definer set search_path = public, pg_temp as $$
declare v_count integer; v_contact uuid;
begin
  update public.agent_runs ar set structured_output='{}'::jsonb,moderation_output=null,evidence='[]'::jsonb,confidence=null
  where exists(
    select 1 from public.agent_jobs j join public.contributor_applications a on a.id=j.record_id
    where j.id=ar.agent_job_id and j.job_type='contributor_application' and a.status in ('closed','auto_rejected') and a.retention_expires_at <= now()
  );
  update public.email_deliveries d set recipient_email='deleted',error_message=null
  where related_type='contributor_application' and exists(
    select 1 from public.contributor_applications a where a.id=d.related_id and a.status in ('closed','auto_rejected') and a.retention_expires_at <= now()
  );
  update public.contributor_applications set name='Deleted applicant',email='deleted',industry=null,industry_other=null,country='deleted',us_state=null,city_region='deleted',participation_reasons='{}',participation_reason_other=null,contribution_areas='{}',contribution_area_other=null,personal_website=null,github_url=null,scholar_url=null,linkedin_url=null,profile_willingness=null,agent_output=null,meeting_notes=null,updated_at=now()
  where status in ('closed','auto_rejected') and retention_expires_at <= now() and email <> 'deleted';
  get diagnostics v_count = row_count;
  for v_contact in
    select distinct a.contact_id from public.contributor_applications a
    where a.email='deleted' and not exists(select 1 from public.contributor_applications a2 where a2.contact_id=a.contact_id and a2.email<>'deleted')
      and not exists(select 1 from public.community_participants p where p.contact_id=a.contact_id)
      and not exists(select 1 from public.resource_submissions r where r.contact_id=a.contact_id)
      and not exists(select 1 from public.contributors c where c.contact_id=a.contact_id)
      and not exists(select 1 from public.people pe where pe.contact_id=a.contact_id)
  loop
    delete from public.contact_identities where contact_id=v_contact;
    update public.community_contacts set deleted_at=now() where id=v_contact;
  end loop;
  return v_count;
end;
$$;

create or replace function public.expire_unverified_applications()
returns integer language plpgsql security definer set search_path = public, pg_temp as $$
declare v_count integer;
begin
  with expired as (
    update public.contributor_applications set status='closed',closed_at=now(),retention_expires_at=now()+interval '12 months',verification_token_hash=null,updated_at=now()
    where status='email_pending' and verification_expires_at <= now()
    returning id
  )
  update public.agent_jobs j set status='completed',completed_at=now(),last_error='Email verification expired; Agent processing was not started.',updated_at=now()
  where j.job_type='contributor_application' and j.status='waiting_verification' and j.record_id in (select id from expired);
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.delete_community_participant_data(p_participant_id uuid)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare v_contact uuid;
begin
  select contact_id into v_contact from public.community_participants where id=p_participant_id for update;
  if v_contact is null then raise exception 'participant_not_found'; end if;
  update public.email_deliveries set recipient_email='deleted',error_message=null
    where related_type='community_participant' and related_id=p_participant_id;
  delete from public.community_participants where id=p_participant_id;
  if not exists(select 1 from public.contributor_applications where contact_id=v_contact and email<>'deleted')
    and not exists(select 1 from public.resource_submissions where contact_id=v_contact)
    and not exists(select 1 from public.contributors where contact_id=v_contact)
    and not exists(select 1 from public.people where contact_id=v_contact)
  then
    delete from public.contact_identities where contact_id=v_contact;
    update public.community_contacts set deleted_at=now() where id=v_contact;
  end if;
  return v_contact;
end;
$$;

create or replace function public.admin_add_identity_contact(p_identity_kind text, p_normalized_value text, p_source text)
returns table(contact_id uuid, is_new_member boolean)
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_contact uuid; v_new uuid;
begin
  if p_identity_kind not in ('email','github') then raise exception 'invalid_identity_kind'; end if;
  select ci.contact_id into v_contact from public.contact_identities ci where ci.identity_kind=p_identity_kind and ci.normalized_value=p_normalized_value;
  if v_contact is not null then
    update public.community_contacts set last_seen_at=now() where id=v_contact;
    return query select v_contact,false;
    return;
  end if;
  insert into public.community_contacts(first_source) values (p_source) returning id into v_new;
  insert into public.contact_identities(contact_id,identity_kind,normalized_value) values (v_new,p_identity_kind,p_normalized_value);
  insert into public.member_count_events(contact_id,source) values (v_new,p_source);
  return query select v_new,true;
end;
$$;

create or replace function public.merge_community_contacts(p_source_contact_id uuid, p_target_contact_id uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if p_source_contact_id=p_target_contact_id then raise exception 'same_contact'; end if;
  perform 1 from public.community_contacts where id=p_source_contact_id for update;
  if not found then raise exception 'source_not_found'; end if;
  perform 1 from public.community_contacts where id=p_target_contact_id for update;
  if not found then raise exception 'target_not_found'; end if;
  update public.contact_identities set contact_id=p_target_contact_id where contact_id=p_source_contact_id;
  if exists(select 1 from public.community_participants where contact_id=p_source_contact_id) then
    if exists(select 1 from public.community_participants where contact_id=p_target_contact_id) then raise exception 'participant_merge_conflict'; end if;
    update public.community_participants set contact_id=p_target_contact_id where contact_id=p_source_contact_id;
  end if;
  update public.contributor_applications set contact_id=p_target_contact_id where contact_id=p_source_contact_id;
  update public.resource_submissions set contact_id=p_target_contact_id where contact_id=p_source_contact_id;
  if exists(select 1 from public.contributors where contact_id=p_source_contact_id) then
    if exists(select 1 from public.contributors where contact_id=p_target_contact_id) then raise exception 'contributor_merge_conflict'; end if;
    update public.contributors set contact_id=p_target_contact_id where contact_id=p_source_contact_id;
  end if;
  if exists(select 1 from public.people where contact_id=p_source_contact_id) then
    if exists(select 1 from public.people where contact_id=p_target_contact_id) then raise exception 'people_merge_conflict'; end if;
    update public.people set contact_id=p_target_contact_id where contact_id=p_source_contact_id;
  end if;
  update public.member_count_events set contact_id=null where contact_id=p_source_contact_id;
  update public.community_contacts set deleted_at=now(),last_seen_at=now() where id=p_source_contact_id;
  update public.community_contacts set last_seen_at=now() where id=p_target_contact_id;
end;
$$;

alter table public.community_contacts enable row level security;
alter table public.contact_identities enable row level security;
alter table public.member_count_events enable row level security;
alter table public.community_participants enable row level security;
alter table public.contributor_applications enable row level security;
alter table public.contributors enable row level security;
alter table public.people enable row level security;
alter table public.resources enable row level security;
alter table public.resource_submissions enable row level security;
alter table public.events enable row level security;
alter table public.event_sessions enable row level security;
alter table public.agent_jobs enable row level security;
alter table public.agent_runs enable row level security;
alter table public.email_deliveries enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_users enable row level security;
alter table public.admin_audit_log enable row level security;
alter table public.form_rate_limits enable row level security;

create policy public_people_read on public.people for select using (publication_status='published' and publication_consent_at is not null);
create policy public_resources_read on public.resources for select using (publication_status='published');
create policy public_events_read on public.events for select using (publication_status='published');
create policy public_event_sessions_read on public.event_sessions for select using (exists(select 1 from public.events e where e.id=event_id and e.publication_status='published'));

create policy admin_contacts on public.community_contacts for all using (public.is_admin()) with check (public.is_admin());
create policy admin_identities on public.contact_identities for all using (public.is_admin()) with check (public.is_admin());
create policy admin_count_events on public.member_count_events for all using (public.is_admin()) with check (public.is_admin());
create policy admin_participants on public.community_participants for all using (public.is_admin()) with check (public.is_admin());
create policy admin_applications on public.contributor_applications for all using (public.is_admin()) with check (public.is_admin());
create policy admin_contributors on public.contributors for all using (public.is_admin()) with check (public.is_admin());
create policy admin_people on public.people for all using (public.is_admin()) with check (public.is_admin());
create policy admin_resources on public.resources for all using (public.is_admin()) with check (public.is_admin());
create policy admin_resource_submissions on public.resource_submissions for all using (public.is_admin()) with check (public.is_admin());
create policy admin_events on public.events for all using (public.is_admin()) with check (public.is_admin());
create policy admin_event_sessions on public.event_sessions for all using (public.is_admin()) with check (public.is_admin());
create policy admin_agent_jobs on public.agent_jobs for all using (public.is_admin()) with check (public.is_admin());
create policy admin_agent_runs on public.agent_runs for all using (public.is_admin()) with check (public.is_admin());
create policy admin_email_deliveries on public.email_deliveries for all using (public.is_admin()) with check (public.is_admin());
create policy admin_settings on public.site_settings for all using (public.is_admin()) with check (public.is_admin());
create policy admin_users_read on public.admin_users for select using (public.is_admin() or user_id=auth.uid());
create policy admin_audit on public.admin_audit_log for select using (public.is_admin());

revoke all on function public.ensure_email_contact(text,text) from public, anon, authenticated;
revoke all on function public.consume_form_rate_limit(text,text,timestamptz,integer,timestamptz) from public, anon, authenticated;
revoke all on function public.register_community_participant(text,text,text,text,text,text,text,text,boolean,boolean) from public, anon, authenticated;
revoke all on function public.create_contributor_application(text,text,text,text,text,text,text,text,text[],text,text[],text,text,text,text,text,text,text,timestamptz,boolean,boolean) from public, anon, authenticated;
revoke all on function public.create_resource_submission(text,text,text,text,text,text,text,text,text,boolean,boolean,boolean) from public, anon, authenticated;
revoke all on function public.verify_contributor_application(text) from public, anon, authenticated;
revoke all on function public.claim_agent_job(uuid) from public, anon, authenticated;
revoke all on function public.fail_agent_job(uuid,text) from public, anon, authenticated;
revoke all on function public.list_retryable_agent_jobs(integer) from public, anon, authenticated;
revoke all on function public.scrub_expired_applications() from public, anon, authenticated;
revoke all on function public.expire_unverified_applications() from public, anon, authenticated;
revoke all on function public.delete_community_participant_data(uuid) from public, anon, authenticated;
revoke all on function public.admin_add_identity_contact(text,text,text) from public, anon, authenticated;
revoke all on function public.merge_community_contacts(uuid,uuid) from public, anon, authenticated;
revoke all on function public.get_public_community_metrics() from public;
grant execute on function public.get_public_community_metrics() to anon, authenticated;

grant execute on function public.ensure_email_contact(text,text) to service_role;
grant execute on function public.consume_form_rate_limit(text,text,timestamptz,integer,timestamptz) to service_role;
grant execute on function public.register_community_participant(text,text,text,text,text,text,text,text,boolean,boolean) to service_role;
grant execute on function public.create_contributor_application(text,text,text,text,text,text,text,text,text[],text,text[],text,text,text,text,text,text,text,timestamptz,boolean,boolean) to service_role;
grant execute on function public.create_resource_submission(text,text,text,text,text,text,text,text,text,boolean,boolean,boolean) to service_role;
grant execute on function public.verify_contributor_application(text) to service_role;
grant execute on function public.claim_agent_job(uuid) to service_role;
grant execute on function public.fail_agent_job(uuid,text) to service_role;
grant execute on function public.list_retryable_agent_jobs(integer) to service_role;
grant execute on function public.scrub_expired_applications() to service_role;
grant execute on function public.expire_unverified_applications() to service_role;
grant execute on function public.delete_community_participant_data(uuid) to service_role;
grant execute on function public.admin_add_identity_contact(text,text,text) to service_role;
grant execute on function public.merge_community_contacts(uuid,uuid) to service_role;

grant usage on schema public to anon, authenticated, service_role;
grant select on public.people, public.resources, public.events, public.event_sessions to anon, authenticated;
grant all privileges on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('community-images','community-images',true,10485760,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy community_images_public_read on storage.objects for select using (bucket_id='community-images');
create policy community_images_admin_insert on storage.objects for insert with check (bucket_id='community-images' and public.is_admin());
create policy community_images_admin_update on storage.objects for update using (bucket_id='community-images' and public.is_admin()) with check (bucket_id='community-images' and public.is_admin());
create policy community_images_admin_delete on storage.objects for delete using (bucket_id='community-images' and public.is_admin());
