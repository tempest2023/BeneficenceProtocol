begin;
select plan(6);

select has_table('public','member_count_events','member count ledger exists');
select has_function('public','get_public_community_metrics',array[]::text[],'public aggregate function exists');

select * from public.register_community_participant('same@example.org',null,'Student',null,'united_states','United States','CA','Oakland',true,true);
select * from public.register_community_participant('SAME@example.org','Updated name','Education',null,'united_states','United States','CA','Berkeley',true,true);
select is((select count(*) from public.member_count_events),1::bigint,'a repeated normalized email is counted once');

select * from public.create_resource_submission('same@example.org',null,'Public resource','https://example.org/resource','Article / Document','English','Description','Agent relevance','Publisher',true,true,true);
select is((select count(*) from public.member_count_events),1::bigint,'the same email across forms remains one count event');

select * from public.create_contributor_application('Applicant','other@example.org',null,null,'international','Japan',null,'Tokyo',array['Learn more about AI Agents'],null,array['Research and paper discussions'],null,null,null,null,null,null,'test-token-hash',now()+interval '24 hours',true,true);
select is((select count(*) from public.member_count_events),2::bigint,'an unverified application counts immediately');
update public.contributor_applications set status='closed',closed_at=now(),retention_expires_at=now() where email='other@example.org';
select public.scrub_expired_applications();
select is((select count(*) from public.member_count_events),2::bigint,'closure and PII scrubbing never decrement the total');

select * from finish();
rollback;
