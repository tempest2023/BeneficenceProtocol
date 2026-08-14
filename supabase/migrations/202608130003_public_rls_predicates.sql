-- Public read policies and administrator policies are OR-combined by RLS.
-- Anonymous reads therefore need permission to evaluate the environment's
-- boolean administrator predicate; unauthenticated requests still receive
-- false because auth.uid() is null.

begin;

grant execute on function public.dev_is_admin() to anon;
grant execute on function public.prod_is_admin() to anon;

notify pgrst, 'reload schema';

commit;
