# Supabase Configuration for Permission Letter Upload

## Changes Made

### 1. Component Updates
- **Removed**: Video file upload (replaced with URL text field)
- **Added**: Permission Letter upload field
- **Modified**: Layout changed from 3 columns to 4 columns

### 2. Database Schema Changes Required

You need to update the `after_event_reports` table in Supabase:

#### Add New Column
```sql
-- Add permission_letter column to store the uploaded file URL
ALTER TABLE after_event_reports
ADD COLUMN permission_letter TEXT;

-- Change event_video to video_url (if not already done)
ALTER TABLE after_event_reports
ADD COLUMN video_url TEXT;

-- Optional: Remove old event_video column if it exists
-- ALTER TABLE after_event_reports DROP COLUMN event_video;
```

### 3. Storage Bucket Configuration

Create a new storage bucket for permission letters:

#### Steps in Supabase Dashboard:

1. Go to **Storage** in your Supabase dashboard
2. Click **New Bucket**
3. Create a bucket named: `permission-letters` (exact name, no spaces)
4. **IMPORTANT**: Set the bucket to **Public** (toggle the "Public bucket" option ON)
5. Click **Create bucket**
6. After creating, click on the bucket name to open it
7. Go to the **Policies** tab
8. Click **New Policy** and add the following policies

#### Storage Policies for `permission-letters` bucket:

**IMPORTANT**: You need to create these policies in the Supabase dashboard under Storage > permission-letters > Policies

**Policy 1: Allow authenticated users to upload**
- Policy name: `Allow authenticated uploads`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- Policy definition:
```sql
(bucket_id = 'permission-letters'::text)
```

**Policy 2: Allow public read access**
- Policy name: `Allow public read access`
- Allowed operation: `SELECT`
- Target roles: `public`
- Policy definition:
```sql
(bucket_id = 'permission-letters'::text)
```

**Policy 3: Allow users to update their own files**
- Policy name: `Allow authenticated updates`
- Allowed operation: `UPDATE`
- Target roles: `authenticated`
- Policy definition:
```sql
(bucket_id = 'permission-letters'::text)
```

**Policy 4: Allow users to delete their own files**
- Policy name: `Allow authenticated deletes`
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- Policy definition:
```sql
(bucket_id = 'permission-letters'::text)
```

#### Alternative: Use SQL Editor to Create Bucket and Policies

If you prefer, you can run this SQL in the Supabase SQL Editor:

```sql
-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('permission-letters', 'permission-letters', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon deletes" ON storage.objects;

-- Create policies for ANON role (since you're using NextAuth, not Supabase Auth)
CREATE POLICY "Allow anon uploads"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'permission-letters');

CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'permission-letters');

CREATE POLICY "Allow anon updates"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'permission-letters');

CREATE POLICY "Allow anon deletes"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'permission-letters');
```

### 4. Existing Buckets to Verify

Make sure these buckets already exist with similar policies:
- `event-images` (for event photos)
- `event-reports` (for PDF/Word reports)

Note: The `event-videos` bucket is no longer needed since videos are now stored as URLs.

### 5. File Size Limits

The permission letter upload accepts:
- **Image files**: JPG, PNG, etc. (max 5MB)
- **PDF files**: (max 5MB)

### 6. Testing

After setting up:
1. Try uploading a permission letter (image or PDF)
2. Verify the file appears in the `permission-letters` bucket
3. Check that the URL is saved in the `permission_letter` column of `after_event_reports`
4. Verify the video URL field accepts and saves YouTube/other video URLs

## Troubleshooting

### Error: "new row violates row-level security policy"

**ROOT CAUSE**: You're using NextAuth for authentication, but Supabase storage policies were set for `authenticated` role. Since the browser client uses the anon key (not Supabase Auth), you need policies for the `anon` role.

**QUICK FIX - Run this SQL now**:
```sql
-- Drop old policies
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Create new policies for anon role
CREATE POLICY "Allow anon uploads"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'permission-letters');

CREATE POLICY "Allow anon updates"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'permission-letters');

CREATE POLICY "Allow anon deletes"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'permission-letters');
```

This error means the storage bucket doesn't exist or the RLS policies aren't configured for the correct role. Follow these steps:

1. **Check if bucket exists**:
   - Go to Storage in Supabase dashboard
   - Look for `permission-letters` bucket
   - If it doesn't exist, create it following the steps above

2. **Verify bucket is public**:
   - Click on the bucket
   - Check if "Public" badge is shown
   - If not, go to bucket settings and enable "Public bucket"

3. **Check policies exist**:
   - Click on the bucket
   - Go to "Policies" tab
   - You should see at least the "Allow authenticated uploads" policy
   - If no policies exist, add them using the SQL provided above

4. **Verify authentication**:
   - Make sure the user is logged in (check NextAuth session)
   - The upload uses the authenticated user's token

5. **Apply the anon role policies** - See the SQL fix at the top of this troubleshooting section

### Verify Other Buckets

Your existing buckets (`event-images`, `event-reports`) likely need the same fix. Run this SQL to update ALL buckets:

```sql
-- Fix event-images bucket
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

CREATE POLICY "Allow anon uploads to event-images"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'event-images');

CREATE POLICY "Allow anon uploads to event-reports"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'event-reports');

CREATE POLICY "Allow anon uploads to permission-letters"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'permission-letters');

-- Public read for all
CREATE POLICY "Allow public read for all buckets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('event-images', 'event-reports', 'permission-letters'));

-- Updates and deletes for anon
CREATE POLICY "Allow anon updates for all buckets"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id IN ('event-images', 'event-reports', 'permission-letters'));

CREATE POLICY "Allow anon deletes for all buckets"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id IN ('event-images', 'event-reports', 'permission-letters'));
```

## Summary

The changes replace the video file upload with a simple URL input field and add a new permission letter upload that stores files in a dedicated Supabase storage bucket. The RLS error you're seeing is expected until you create the bucket and configure the policies in Supabase.
