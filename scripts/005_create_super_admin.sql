-- Create Super Admin User
-- This script creates the first super admin user for the system
-- Email: admin@iems.com
-- Password: Admin@123456
-- Role: super_admin

-- First, you need to create the user through Supabase Auth
-- Then run this script to set their role to super_admin

-- Update the user profile to super_admin role
-- Replace 'USER_ID_HERE' with the actual UUID from auth.users after signup

-- Example usage after signup:
-- 1. Sign up with email: admin@iems.com and password: Admin@123456
-- 2. Get the user ID from Supabase Auth dashboard
-- 3. Run this command with the actual UUID:

-- UPDATE public.user_profiles 
-- SET role = 'super_admin', 
--     full_name = 'System Administrator',
--     updated_at = now()
-- WHERE id = 'USER_ID_FROM_AUTH';

-- Or use this function to promote a user to super_admin:
CREATE OR REPLACE FUNCTION promote_to_super_admin(user_email TEXT)
RETURNS void AS $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = user_email;
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Update user profile to super_admin
  UPDATE public.user_profiles
  SET role = 'super_admin',
      full_name = 'System Administrator',
      updated_at = now()
  WHERE id = user_uuid;
  
  RAISE NOTICE 'User % promoted to super_admin', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION promote_to_super_admin(TEXT) TO authenticated;
