begin;

do $$
declare total bigint; job_state text; verified record; application_job uuid; expired_application uuid; erasable_participant uuid; erasable_contact uuid;
begin
  perform * from public.register_community_participant('same@example.org',null,'Student',null,'united_states','United States','CA','Oakland',true,true);
  perform * from public.register_community_participant('SAME@example.org','Updated','Education',null,'united_states','United States','CA','Berkeley',true,true);
  select count(*) into total from public.member_count_events;
  if total <> 1 then raise exception 'repeated email incremented all-time count'; end if;

  perform * from public.create_resource_submission('same@example.org',null,'Resource','https://example.org/resource','Article / Document','English','Description','Agent relevance','Publisher',true,true,true);
  select count(*) into total from public.member_count_events;
  if total <> 1 then raise exception 'cross-form identity incremented all-time count'; end if;

  perform * from public.create_contributor_application('Applicant','applicant@example.org',null,null,'international','Japan',null,'Tokyo',array['Learn more about AI Agents'],null,array['Research and paper discussions'],null,null,null,null,null,null,'verification-test-hash',now()+interval '24 hours',true,true);
  select count(*) into total from public.member_count_events;
  if total <> 2 then raise exception 'unverified application did not increment count'; end if;
  select status into job_state from public.agent_jobs where job_type='contributor_application';
  if job_state <> 'waiting_verification' then raise exception 'application Agent job was not blocked for verification'; end if;
  select * into verified from public.verify_contributor_application('verification-test-hash');
  if verified.application_id is null then raise exception 'valid verification token did not work'; end if;
  select status into job_state from public.agent_jobs where id=verified.job_id;
  if job_state <> 'pending' then raise exception 'verified application job was not released'; end if;
  if exists(select 1 from public.verify_contributor_application('verification-test-hash')) then raise exception 'verification token was reusable'; end if;

  application_job := verified.job_id;
  insert into public.agent_runs(agent_job_id,workflow,model,prompt_version,structured_output,moderation_output,evidence,confidence)
  values(application_job,'contributor_application','test-model','test-prompt','{"summary":"private"}','{"flagged":false}','["private excerpt"]',0.9);
  insert into public.email_deliveries(recipient_email,category,related_type,related_id,status)
  values('applicant@example.org','application_confirmation','contributor_application',verified.application_id,'sent');
  update public.contributor_applications set status='closed',retention_expires_at=now() where email='applicant@example.org';
  perform public.scrub_expired_applications();
  select count(*) into total from public.member_count_events;
  if total <> 2 then raise exception 'retention scrub decremented count'; end if;
  if exists(select 1 from public.contributor_applications where id=verified.application_id and (email <> 'deleted' or name <> 'Deleted applicant')) then raise exception 'expired application PII was not scrubbed'; end if;
  if exists(select 1 from public.agent_runs where agent_job_id=application_job and structured_output <> '{}'::jsonb) then raise exception 'expired Agent output was not scrubbed'; end if;
  if exists(select 1 from public.email_deliveries where related_id=verified.application_id and recipient_email <> 'deleted') then raise exception 'expired delivery recipient was not scrubbed'; end if;

  select application_id into expired_application from public.create_contributor_application('Expired','expired@example.org',null,null,'international','Japan',null,'Tokyo',array['Learn more about AI Agents'],null,array['Research and paper discussions'],null,null,null,null,null,null,'expired-token-hash',now()-interval '1 hour',true,true);
  perform public.expire_unverified_applications();
  if not exists(select 1 from public.contributor_applications where id=expired_application and status='closed' and verification_token_hash is null and retention_expires_at > now()) then raise exception 'expired verification was not closed with retention'; end if;
  if not exists(select 1 from public.agent_jobs where record_id=expired_application and status='completed') then raise exception 'expired verification Agent job was not closed'; end if;
  select count(*) into total from public.member_count_events;
  if total <> 3 then raise exception 'verification expiry changed the cumulative count'; end if;

  select participant_id,contact_id into erasable_participant,erasable_contact from public.register_community_participant('erase@example.org','Erase Me','Education',null,'united_states','United States','CA','Oakland',true,true);
  insert into public.email_deliveries(recipient_email,category,related_type,related_id,status)
  values('erase@example.org','participant_confirmation','community_participant',erasable_participant,'sent');
  perform public.delete_community_participant_data(erasable_participant);
  if exists(select 1 from public.community_participants where id=erasable_participant) then raise exception 'unsubscribed participant data was retained'; end if;
  if exists(select 1 from public.contact_identities where contact_id=erasable_contact) then raise exception 'standalone participant identity was retained'; end if;
  if exists(select 1 from public.email_deliveries where related_id=erasable_participant and recipient_email <> 'deleted') then raise exception 'participant email delivery was not scrubbed'; end if;
  select count(*) into total from public.member_count_events;
  if total <> 4 then raise exception 'participant deletion decremented the cumulative count'; end if;

  insert into public.resources(slug,title,summary,public_url,resource_type,language) values ('verification-required','Verification required','Test','https://example.org/free','Course','English');
  begin
    update public.resources set publication_status='published' where slug='verification-required';
    raise exception 'unverified resource publication unexpectedly succeeded';
  exception when check_violation then null;
  end;
  update public.resources set publication_status='published',access_verified_at=now(),access_verified_by=gen_random_uuid() where slug='verification-required';
end;
$$;

set local role anon;
select * from public.get_public_community_metrics();
select count(*) from public.resources;
do $$
begin
  begin
    insert into public.resources(slug,title,summary,public_url,resource_type,language) values ('forbidden','Forbidden','No','https://example.org','Course','English');
    raise exception 'anonymous insert unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;

rollback;
