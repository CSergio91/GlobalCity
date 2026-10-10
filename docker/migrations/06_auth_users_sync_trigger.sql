-- ============================================================================
-- EKLIPSE FUNDED — MIGRATION 06: TRIGGER SINCRONIZACIÓN AUTH.USERS -> PROFILES
-- Sincroniza automáticamente los registros de Supabase Auth (GoTrue / Google OAuth)
-- con la tabla de perfiles institucionales (public.profiles)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
DECLARE
  v_full_name text;
  v_avatar_url text;
  v_provider text;
BEGIN
  -- Extraer metadatos si vienen de Google OAuth o registro directo por correo
  v_full_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    TRIM(CONCAT(new.raw_user_meta_data->>'first_name', ' ', new.raw_user_meta_data->>'last_name')),
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );
  v_avatar_url := COALESCE(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    null
  );
  v_provider := COALESCE(
    new.raw_app_meta_data->>'provider',
    'email'
  );

  -- Insertar o actualizar el perfil público correspondiente con todos los datos del cliente
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    first_name,
    last_name,
    phone,
    company,
    address_line1,
    address_line2,
    country,
    postal_code,
    city,
    state,
    avatar_url,
    role,
    provider,
    billing_metadata,
    is_verified,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    v_full_name,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'company',
    new.raw_user_meta_data->>'address_line1',
    new.raw_user_meta_data->>'address_line2',
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'postal_code',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'state',
    v_avatar_url,
    'trader',
    v_provider,
    COALESCE(new.raw_user_meta_data->'billing_metadata', '{}'::jsonb),
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    company = COALESCE(EXCLUDED.company, public.profiles.company),
    address_line1 = COALESCE(EXCLUDED.address_line1, public.profiles.address_line1),
    address_line2 = COALESCE(EXCLUDED.address_line2, public.profiles.address_line2),
    country = COALESCE(EXCLUDED.country, public.profiles.country),
    postal_code = COALESCE(EXCLUDED.postal_code, public.profiles.postal_code),
    city = COALESCE(EXCLUDED.city, public.profiles.city),
    state = COALESCE(EXCLUDED.state, public.profiles.state),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    billing_metadata = COALESCE(EXCLUDED.billing_metadata, public.profiles.billing_metadata),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparador después de crear un usuario en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Otorgar permisos al rol de autenticación
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT SELECT ON auth.users TO anon, authenticated, service_role;
