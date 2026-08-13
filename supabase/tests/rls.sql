begin;
select plan(6);

select ok((select relrowsecurity from pg_class where oid='public.community_participants'::regclass),'participant RLS is enabled');
select ok((select relrowsecurity from pg_class where oid='public.contributor_applications'::regclass),'application RLS is enabled');
select ok((select relrowsecurity from pg_class where oid='public.agent_runs'::regclass),'Agent run RLS is enabled');
select ok((select relrowsecurity from pg_class where oid='public.form_rate_limits'::regclass),'rate-limit RLS is enabled');
select policies_are('public','resources',array['admin_resources','public_resources_read'],'resources expose only public read and admin access policies');
select policies_are('public','people',array['admin_people','public_people_read'],'People expose only consented public read and admin access policies');

select * from finish();
rollback;
