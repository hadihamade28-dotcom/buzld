import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import {
  COMPAT_THRESHOLD,
  compatibilityScore,
  weightsFromRow,
  type ProfileRow,
  type PrefsRow,
  type WeightsRow,
} from '../_shared/scoring.ts'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

function neighborPrefixes(geohash: string) {
  return geohash.slice(0, 6)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
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

    const { data: mePresence } = await admin.from('presence').select('*').eq('user_id', uid).maybeSingle()
    const { data: meProfile } = await admin.from('profiles').select('*').eq('id', uid).maybeSingle()
    if (!mePresence || !meProfile?.discovery_enabled) {
      return new Response(JSON.stringify({ candidates: [] }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const [{ data: myInterests }, { data: myPrefs }, { data: myWeights }] = await Promise.all([
      admin.from('profile_interests').select('interest').eq('user_id', uid),
      admin.from('physical_prefs').select('*').eq('user_id', uid).maybeSingle(),
      admin.from('user_weights').select('*').eq('user_id', uid).maybeSingle(),
    ])

    const prefix = neighborPrefixes(mePresence.geohash)
    const { data: nearby } = await admin
      .from('presence')
      .select('*')
      .neq('user_id', uid)
      .like('geohash', `${prefix}%`)
      .gt('updated_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())

    const candidates = []
    const nearbyUsers = nearby ?? []

    if (nearbyUsers.length === 0) {
      return new Response(JSON.stringify({ candidates: [] }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const nearbyIds = nearbyUsers.map((p) => p.user_id)

    const [
      { data: otherProfiles },
      { data: allOtherInterests },
      { data: allOtherPrefs },
      { data: existingMatches },
    ] = await Promise.all([
      admin.from('profiles').select('*').in('id', nearbyIds),
      admin.from('profile_interests').select('user_id, interest').in('user_id', nearbyIds),
      admin.from('physical_prefs').select('*').in('user_id', nearbyIds),
      admin
        .from('nearby_matches')
        .select('*')
        .or(
          nearbyIds
            .map((id) => {
              const a = uid < id ? uid : id
              const b = uid < id ? id : uid
              return `and(user_a.eq.${a},user_b.eq.${b})`
            })
            .join(','),
        ),
    ])

    const profileMap = new Map((otherProfiles ?? []).map((p) => [p.id, p]))
    const interestsMap = new Map<string, string[]>()
    for (const row of allOtherInterests ?? []) {
      const list = interestsMap.get(row.user_id) ?? []
      list.push(row.interest)
      interestsMap.set(row.user_id, list)
    }
    const prefsMap = new Map((allOtherPrefs ?? []).map((p) => [p.user_id, p]))
    const matchMap = new Map<string, (typeof existingMatches extends (infer T)[] | null ? T : never)>()
    for (const m of existingMatches ?? []) {
      const peerId = m.user_a === uid ? m.user_b : m.user_a
      matchMap.set(peerId, m)
    }

    const viewer = meProfile as ProfileRow
    const weights = weightsFromRow(myWeights as WeightsRow | null, viewer.intent)
    const now = Date.now()

    for (const p of nearbyUsers) {
      const dist = haversine(mePresence.lat, mePresence.lng, p.lat, p.lng)
      if (dist > (meProfile.radius_m || 150)) continue

      const otherProfile = profileMap.get(p.user_id) as ProfileRow | undefined
      if (!otherProfile?.discovery_enabled) continue

      const presenceAgeSec = Math.max(0, (now - new Date(p.updated_at).getTime()) / 1000)
      const scored = compatibilityScore({
        viewer,
        candidate: otherProfile,
        viewerInterests: (myInterests ?? []).map((i) => i.interest),
        candidateInterests: interestsMap.get(p.user_id) ?? [],
        viewerPrefs: (myPrefs as PrefsRow | null) ?? null,
        candidatePrefs: (prefsMap.get(p.user_id) as PrefsRow | undefined) ?? null,
        distanceM: dist,
        presenceAgeSec,
        weights,
      })

      const score = scored.total
      if (score < COMPAT_THRESHOLD) continue

      const user_a = uid < p.user_id ? uid : p.user_id
      const user_b = uid < p.user_id ? p.user_id : uid
      const existing = matchMap.get(p.user_id)

      if (!existing) {
        await admin.from('nearby_matches').insert({
          user_a,
          user_b,
          status: 'candidate',
          score,
        })
      } else if (existing.status === 'candidate') {
        await admin
          .from('nearby_matches')
          .update({ score, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
      }

      candidates.push({
        user_id: p.user_id,
        ble_token: p.ble_token,
        score,
        distance_m: Math.round(dist),
        meta: scored.components,
      })
    }

    candidates.sort((a, b) => b.score - a.score)
    return new Response(JSON.stringify({ candidates }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
