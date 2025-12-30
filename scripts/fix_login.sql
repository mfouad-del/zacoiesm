-- Confirm email for the user (fixes 400 Bad Request if email is unconfirmed)
UPDATE auth.users
SET email_confirmed_at = now(),
    encrypted_password = crypt('Doda@55002004', gen_salt('bf')) -- Optional: Reset password if needed
WHERE email = 'admin@zaco.sa';

-- Ensure the user has a profile in public.users and is a super_admin
INSERT INTO public.users (id, email, full_name, role)
SELECT id, email, 'System Administrator', 'super_admin'
FROM auth.users
WHERE email = 'admin@zaco.sa'
ON CONFLICT (id) DO UPDATE
SET role = 'super_admin';
