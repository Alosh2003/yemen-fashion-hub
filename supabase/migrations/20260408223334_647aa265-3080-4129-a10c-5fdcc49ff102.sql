
-- Add images array column to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Function to deduct stock when order is confirmed
CREATE OR REPLACE FUNCTION public.deduct_stock_on_order_confirm()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When order status changes to confirmed, deduct stock
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    UPDATE public.products p
    SET stock = GREATEST(0, p.stock - oi.quantity)
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id AND p.id = oi.product_id::uuid;
  END IF;

  -- When order is cancelled or returned, restore stock
  IF (NEW.status IN ('cancelled', 'returned')) AND OLD.status NOT IN ('cancelled', 'returned') THEN
    UPDATE public.products p
    SET stock = p.stock + oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id AND p.id = oi.product_id::uuid;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS trigger_deduct_stock ON public.orders;
CREATE TRIGGER trigger_deduct_stock
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.deduct_stock_on_order_confirm();
