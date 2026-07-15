-- Theme Assets Storage Bucket
-- Allows admins to upload images and videos for the homepage theme editor.

-- 1. Create the public bucket (50MB limit, images + videos)
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'theme-assets',
  'theme-assets',
  true,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'video/mp4',
    'video/webm'
  ]
)
on conflict (id) do nothing;

-- 2. Public read access for anyone
create policy "Theme assets public read"
on storage.objects for select
using (bucket_id = 'theme-assets');

-- 3. Authenticated users can upload
-- (The app-level /api/admin/upload-theme-asset route performs additional admin checks.)
create policy "Authenticated users can upload theme assets"
on storage.objects for insert
to authenticated
with check (bucket_id = 'theme-assets');

-- 4. Authenticated users can update their own uploads
create policy "Authenticated users can update theme assets"
on storage.objects for update
to authenticated
using (bucket_id = 'theme-assets')
with check (bucket_id = 'theme-assets');

-- 5. Authenticated users can delete theme assets
create policy "Authenticated users can delete theme assets"
on storage.objects for delete
to authenticated
using (bucket_id = 'theme-assets');
