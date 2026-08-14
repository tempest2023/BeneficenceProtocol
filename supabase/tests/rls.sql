begin;
select plan(12);

select ok((select relrowsecurity from pg_class where oid='public.dev_community_participants'::regclass),'participant RLS is enabled');
select ok((select relrowsecurity from pg_class where oid='public.dev_contributor_applications'::regclass),'application RLS is enabled');
select ok((select relrowsecurity from pg_class where oid='public.dev_agent_runs'::regclass),'Agent run RLS is enabled');
select ok((select relrowsecurity from pg_class where oid='public.dev_form_rate_limits'::regclass),'rate-limit RLS is enabled');
select policies_are('public','dev_resources',array['dev_admin_resources','dev_public_resources_read'],'development resources expose only public read and admin access policies');
select policies_are('public','dev_people',array['dev_admin_people','dev_public_people_read'],'development People expose only consented public read and admin access policies');

select ok((select relrowsecurity from pg_class where oid='public.prod_community_participants'::regclass),'production participant RLS is enabled');
select ok((select relrowsecurity from pg_class where oid='public.prod_contributor_applications'::regclass),'production application RLS is enabled');
select ok((select relrowsecurity from pg_class where oid='public.prod_agent_runs'::regclass),'production Agent run RLS is enabled');
select ok((select relrowsecurity from pg_class where oid='public.prod_form_rate_limits'::regclass),'production rate-limit RLS is enabled');
select policies_are('public','prod_resources',array['prod_admin_resources','prod_public_resources_read'],'production resources expose only public read and admin access policies');
select policies_are('public','prod_people',array['prod_admin_people','prod_public_people_read'],'production People expose only consented public read and admin access policies');

select * from finish();
rollback;
