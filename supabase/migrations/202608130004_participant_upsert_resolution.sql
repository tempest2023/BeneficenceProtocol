-- The table-independent ON CONFLICT target shares a name with the function's
-- contact_id output parameter. Resolve that PL/pgSQL ambiguity in both copies
-- while preserving the atomic participant upsert.

begin;

create or replace function public.dev_register_community_participant(
  p_email text, p_name text, p_industry text, p_industry_other text, p_location_scope text,
  p_country text, p_us_state text, p_city_region text, p_communications_consent boolean, p_privacy_consent boolean
) returns table(contact_id uuid, participant_id uuid, is_new_member boolean)
language plpgsql security definer set search_path = public, pg_temp as $$
#variable_conflict use_column
declare v_contact uuid; v_new boolean; v_participant uuid;
begin
  if not p_communications_consent or not p_privacy_consent then raise exception 'consent_required'; end if;
  select e.contact_id, e.is_new into v_contact, v_new from public.dev_ensure_email_contact(p_email, 'community_registration') e;
  insert into public.dev_community_participants(contact_id,email,name,industry,industry_other,location_scope,country,us_state,city_region,communications_consent_at,privacy_consent_at)
  values (v_contact,lower(trim(p_email)),nullif(trim(p_name),''),p_industry,nullif(trim(p_industry_other),''),p_location_scope,p_country,p_us_state,p_city_region,now(),now())
  on conflict (contact_id) do update set email=excluded.email,name=coalesce(excluded.name,public.dev_community_participants.name),industry=excluded.industry,industry_other=excluded.industry_other,location_scope=excluded.location_scope,country=excluded.country,us_state=excluded.us_state,city_region=excluded.city_region,communications_consent_at=now(),privacy_consent_at=now(),subscription_status='subscribed',unsubscribed_at=null,updated_at=now()
  returning id into v_participant;
  return query select v_contact, v_participant, v_new;
end;
$$;

create or replace function public.prod_register_community_participant(
  p_email text, p_name text, p_industry text, p_industry_other text, p_location_scope text,
  p_country text, p_us_state text, p_city_region text, p_communications_consent boolean, p_privacy_consent boolean
) returns table(contact_id uuid, participant_id uuid, is_new_member boolean)
language plpgsql security definer set search_path = public, pg_temp as $$
#variable_conflict use_column
declare v_contact uuid; v_new boolean; v_participant uuid;
begin
  if not p_communications_consent or not p_privacy_consent then raise exception 'consent_required'; end if;
  select e.contact_id, e.is_new into v_contact, v_new from public.prod_ensure_email_contact(p_email, 'community_registration') e;
  insert into public.prod_community_participants(contact_id,email,name,industry,industry_other,location_scope,country,us_state,city_region,communications_consent_at,privacy_consent_at)
  values (v_contact,lower(trim(p_email)),nullif(trim(p_name),''),p_industry,nullif(trim(p_industry_other),''),p_location_scope,p_country,p_us_state,p_city_region,now(),now())
  on conflict (contact_id) do update set email=excluded.email,name=coalesce(excluded.name,public.prod_community_participants.name),industry=excluded.industry,industry_other=excluded.industry_other,location_scope=excluded.location_scope,country=excluded.country,us_state=excluded.us_state,city_region=excluded.city_region,communications_consent_at=now(),privacy_consent_at=now(),subscription_status='subscribed',unsubscribed_at=null,updated_at=now()
  returning id into v_participant;
  return query select v_contact, v_participant, v_new;
end;
$$;

revoke all on function public.dev_register_community_participant(text,text,text,text,text,text,text,text,boolean,boolean) from public, anon, authenticated;
grant execute on function public.dev_register_community_participant(text,text,text,text,text,text,text,text,boolean,boolean) to service_role;
revoke all on function public.prod_register_community_participant(text,text,text,text,text,text,text,text,boolean,boolean) from public, anon, authenticated;
grant execute on function public.prod_register_community_participant(text,text,text,text,text,text,text,text,boolean,boolean) to service_role;

notify pgrst, 'reload schema';

commit;
