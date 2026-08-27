-- 1) Lock down SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.deduct_stock_on_order_confirm() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_order_number() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_orders_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.submit_order_receipt(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_order_receipt(uuid, text, text) TO authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;

-- 2) order_status_history: append-only, no anon access
REVOKE ALL ON TABLE public.order_status_history FROM anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.order_status_history TO authenticated;
GRANT ALL ON TABLE public.order_status_history TO service_role;

DROP POLICY IF EXISTS "No one can update status history" ON public.order_status_history;
DROP POLICY IF EXISTS "No one can delete status history" ON public.order_status_history;
CREATE POLICY "No one can update status history"
  ON public.order_status_history AS RESTRICTIVE FOR UPDATE TO authenticated, anon
  USING (false);
CREATE POLICY "No one can delete status history"
  ON public.order_status_history AS RESTRICTIVE FOR DELETE TO authenticated, anon
  USING (false);

-- 3) user_roles: no anon access, admin-only writes, self read-only
REVOKE ALL ON TABLE public.user_roles FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_roles TO authenticated;
GRANT ALL ON TABLE public.user_roles TO service_role;

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

CREATE POLICY "Admins can manage user roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Restrictive guard: only admins may ever write to user_roles
CREATE POLICY "Only admins can insert roles"
  ON public.user_roles AS RESTRICTIVE FOR INSERT TO authenticated, anon
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update roles"
  ON public.user_roles AS RESTRICTIVE FOR UPDATE TO authenticated, anon
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete roles"
  ON public.user_roles AS RESTRICTIVE FOR DELETE TO authenticated, anon
  USING (public.has_role(auth.uid(), 'admin'));