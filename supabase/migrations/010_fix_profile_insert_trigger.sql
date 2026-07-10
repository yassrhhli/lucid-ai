-- Migration 010: Ajouter BEFORE INSERT au trigger
CREATE OR REPLACE FUNCTION prevent_privileged_client_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF current_setting('request.jwt.claims', true)::json->>'role' != 'service_role' THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.is_pro IS DISTINCT FROM false 
         OR NEW.role IS DISTINCT FROM 'user'
         OR NEW.stripe_customer_id IS NOT NULL THEN
        RAISE EXCEPTION 'Cannot insert privileged columns without service_role';
      END IF;
    ELSIF TG_OP = 'UPDATE' THEN
      IF OLD.is_pro IS DISTINCT FROM NEW.is_pro
        OR OLD.role IS DISTINCT FROM NEW.role
        OR OLD.stripe_customer_id IS DISTINCT FROM NEW.stripe_customer_id THEN
        RAISE EXCEPTION 'Cannot modify privileged columns without service_role';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_privileged_columns ON profiles;
CREATE TRIGGER protect_privileged_columns
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_privileged_client_write();
