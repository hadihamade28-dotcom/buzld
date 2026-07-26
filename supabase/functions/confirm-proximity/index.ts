import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const body = await req.json().catch(() => ({}))
    const bleToken: string | null = body.ble_token ?? null

    if (!bleToken) {
      return new Response(JSON.stringify({ error: 'ble_token required' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } },
    )
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }
    const uid = auth.user.id

    const { data: presence } = await admin
      .from('presence')
      .select('user_id')
      .eq('ble_token', bleToken)
      .maybeSingle()

    const peerId = presence?.user_id ?? null
    if (!peerId || peerId === uid) {
      return new Response(JSON.stringify({ reveal: null }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const user_a = uid < peerId ? uid : peerId
    const user_b = uid < peerId ? peerId : uid

    const { data: match } = await admin
      .from('nearby_matches')
      .select('*')
      .eq('user_a', user_a)
      .eq('user_b', user_b)
      .maybeSingle()

    if (!match || match.status === 'passed' || match.status === 'expired') {
      return new Response(JSON.stringify({ reveal: null }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    let updated = match
    if (match.status === 'candidate') {
      const { data: row } = await admin
        .from('nearby_matches')
        .update({ status: 'ble_confirmed', updated_at: new Date().toISOString() })
        .eq('id', match.id)
        .select()
        .single()
      updated = row ?? match
    } else if (match.status !== 'ble_confirmed' && match.status !== 'continued' && match.status !== 'mutual') {
      return new Response(JSON.stringify({ reveal: null }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const { data: peer } = await admin
      .from('profiles')
      .select('id, display_name, photo_urls, bio')
      .eq('id', peerId)
      .single()

    return new Response(
      JSON.stringify({
        reveal: {
          match: updated,
          peer,
        },
      }),
      { headers: { ...cors, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
