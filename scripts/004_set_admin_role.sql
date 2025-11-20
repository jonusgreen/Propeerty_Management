-- Set a user as admin by their email
-- Replace 'your-email@example.com' with the actual email address

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';

-- Verify the update
SELECT id, email, full_name, role 
FROM public.profiles 
WHERE email = 'your-email@example.com';
