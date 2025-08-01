-- Allow anonymous (registration-time) uploads to the avatars bucket
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;

CREATE POLICY "Public insert to avatars bucket during signup"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() IN ('anon', 'authenticated'));

-- Preserve read-only public access
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

CREATE POLICY "Public read for avatars bucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');
