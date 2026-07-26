-- Storage policies for profile photos (apply after storage bucket exists)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'objects') then
    -- Drop existing policies so they can be recreated with updated rules
    execute $pol$ drop policy if exists "photo upload own folder" on storage.objects $pol$;
    execute $pol$ drop policy if exists "photo update own folder" on storage.objects $pol$;
    execute $pol$ drop policy if exists "photo select public" on storage.objects $pol$;
    execute $pol$ drop policy if exists "photo select matched or own" on storage.objects $pol$;

    execute $pol$
      create policy "photo upload own folder"
      on storage.objects for insert to authenticated
      with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text)
    $pol$;
    execute $pol$
      create policy "photo update own folder"
      on storage.objects for update to authenticated
      using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text)
    $pol$;
    -- Select: own photos or photos of a confirmed/mutual match peer
    execute $pol$
      create policy "photo select matched or own"
      on storage.objects for select to authenticated
      using (
        bucket_id = 'photos' and (
          (storage.foldername(name))[1] = auth.uid()::text
          or exists (
            select 1 from public.nearby_matches m
            where m.status in ('ble_confirmed', 'continued', 'mutual')
              and (
                (m.user_a = auth.uid() and m.user_b::text = (storage.foldername(name))[1])
                or (m.user_b = auth.uid() and m.user_a::text = (storage.foldername(name))[1])
              )
          )
        )
      )
    $pol$;
  end if;
exception when others then
  raise notice 'Skipping storage policies: %', sqlerrm;
end $$;
