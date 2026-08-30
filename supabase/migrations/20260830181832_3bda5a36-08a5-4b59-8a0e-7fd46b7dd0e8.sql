-- 1) Role change log
CREATE TABLE public.role_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  old_role public.app_role,
  new_role public.app_role,
  action text NOT NULL,
  changed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.role_change_log TO authenticated;
GRANT ALL ON public.role_change_log TO service_role;
ALTER TABLE public.role_change_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view role change log"
  ON public.role_change_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "No one can update role change log"
  ON public.role_change_log AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (false);
CREATE POLICY "No one can delete role change log"
  ON public.role_change_log AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (false);

CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.role_change_log(user_id, old_role, new_role, action, changed_by)
    VALUES (NEW.user_id, NULL, NEW.role, 'granted', auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      INSERT INTO public.role_change_log(user_id, old_role, new_role, action, changed_by)
      VALUES (NEW.user_id, OLD.role, NEW.role, 'changed', auth.uid());
    END IF;
    RETURN NEW;
  ELSE
    INSERT INTO public.role_change_log(user_id, old_role, new_role, action, changed_by)
    VALUES (OLD.user_id, OLD.role, NULL, 'revoked', auth.uid());
    RETURN OLD;
  END IF;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.log_role_change() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_log_role_change
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.log_role_change();

-- 2) Prevent self role assignment (admins cannot modify their own role rows)
CREATE POLICY "No self role insert"
  ON public.user_roles AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (user_id <> auth.uid());
CREATE POLICY "No self role update"
  ON public.user_roles AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (user_id <> auth.uid()) WITH CHECK (user_id <> auth.uid());
CREATE POLICY "No self role delete"
  ON public.user_roles AS RESTRICTIVE FOR DELETE TO authenticated
  USING (user_id <> auth.uid());

-- 3) Audit log
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  old_value text,
  new_value text,
  details text,
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_created_at ON public.audit_log (created_at DESC);
CREATE INDEX idx_audit_log_entity ON public.audit_log (entity_type, entity_id);

GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
  ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "No one can update audit log"
  ON public.audit_log AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (false);
CREATE POLICY "No one can delete audit log"
  ON public.audit_log AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (false);

CREATE OR REPLACE FUNCTION public.log_order_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.audit_log(entity_type, entity_id, action, old_value, new_value, details, actor_id)
    VALUES ('order', NEW.id, 'status_change', OLD.status::text, NEW.status::text, NEW.order_number, auth.uid());
  END IF;
  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
    INSERT INTO public.audit_log(entity_type, entity_id, action, old_value, new_value, details, actor_id)
    VALUES ('order', NEW.id, 'payment_status_change', OLD.payment_status::text, NEW.payment_status::text, NEW.order_number, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.log_order_changes() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_log_order_changes
AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.log_order_changes();

CREATE OR REPLACE FUNCTION public.log_receipt_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_log(entity_type, entity_id, action, old_value, new_value, details, actor_id)
  VALUES (
    'receipt',
    NEW.order_id,
    CASE WHEN TG_OP = 'INSERT' THEN 'receipt_submitted' ELSE 'receipt_updated' END,
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.receipt_number ELSE NULL END,
    NEW.receipt_number,
    CASE WHEN NEW.receipt_image IS NOT NULL THEN 'مع صورة' ELSE 'بدون صورة' END,
    auth.uid()
  );
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.log_receipt_changes() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_log_receipt_changes
AFTER INSERT OR UPDATE ON public.order_receipts
FOR EACH ROW EXECUTE FUNCTION public.log_receipt_changes();