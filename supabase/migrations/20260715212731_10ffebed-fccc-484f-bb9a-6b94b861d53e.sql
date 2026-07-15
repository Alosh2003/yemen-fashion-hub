CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'ORD-' || to_char(now(), 'YYMMDD') || '-' || lpad(floor(random() * 999999)::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_order_number ON public.orders;
CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_order_number();

CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  NEW.status_updated_at = CASE WHEN NEW.status IS DISTINCT FROM OLD.status THEN now() ELSE OLD.status_updated_at END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_orders_updated_at();

CREATE OR REPLACE FUNCTION public.deduct_stock_on_order_item_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_stock integer;
BEGIN
  SELECT stock INTO current_stock
  FROM public.products
  WHERE id = NEW.product_id::uuid
  FOR UPDATE;

  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'المنتج غير موجود';
  END IF;

  IF current_stock < NEW.quantity THEN
    RAISE EXCEPTION 'الكمية المطلوبة غير متوفرة في المخزون';
  END IF;

  UPDATE public.products
  SET stock = stock - NEW.quantity,
      updated_at = now()
  WHERE id = NEW.product_id::uuid;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_deduct_stock_on_order_item ON public.order_items;
CREATE TRIGGER trigger_deduct_stock_on_order_item
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.deduct_stock_on_order_item_insert();

CREATE OR REPLACE FUNCTION public.restore_stock_on_order_cancel()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('cancelled', 'returned') AND OLD.status NOT IN ('cancelled', 'returned') THEN
    UPDATE public.products p
    SET stock = p.stock + oi.quantity,
        updated_at = now()
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id
      AND p.id = oi.product_id::uuid;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_deduct_stock ON public.orders;
DROP TRIGGER IF EXISTS trigger_restore_stock_on_order_cancel ON public.orders;
CREATE TRIGGER trigger_restore_stock_on_order_cancel
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.restore_stock_on_order_cancel();

CREATE INDEX IF NOT EXISTS idx_products_active_rating ON public.products (is_active, rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_active_category_created ON public.products (category, is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_active_offers_rating ON public.products (is_active, original_price, rating DESC) WHERE original_price IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_categories_active_sort ON public.categories (is_active, sort_order);