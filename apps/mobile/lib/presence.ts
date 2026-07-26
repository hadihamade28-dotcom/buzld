import * as Location from 'expo-location';

import { api } from './api';
import { startBleAdvertise, startBleScan } from './ble';
import type { CandidatePeer, RevealedPeer } from './types';

type PresenceCallbacks = {
  onCandidates?: (c: CandidatePeer[]) => void;
  onReveal?: (r: RevealedPeer) => void;
  onStatus?: (s: string) => void;
  onProximity?: (rssi: number) => void;
};

/**
 * Hybrid loop: GPS presence → candidate fetch → BLE advertise/scan → confirm.
 */
export async function startDiscoveryLoop(cb: PresenceCallbacks = {}) {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    cb.onStatus?.('Location permission needed for nearby matching');
    throw new Error('Location permission denied');
  }

  const profile = await api.getProfile();
  if (!profile) throw new Error('Missing profile');

  const bleToken = await api.makeBleToken(profile.id);
  let stopScan: () => void = () => {};
  let stopAdvertise: () => void = () => {};
  let stopped = false;
  const seen = new Set<string>();

  const tick = async () => {
    if (stopped) return;
    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await api.upsertPresence(pos.coords.latitude, pos.coords.longitude, bleToken);
      cb.onStatus?.('Presence updated — searching for matches');

      const candidates = await api.findCandidates();
      cb.onCandidates?.(candidates);

      if (candidates.length) {
        stopAdvertise = await startBleAdvertise(bleToken);
        stopScan();
        stopScan = await startBleScan(async (token, rssi) => {
          if (seen.has(token)) return;
          const known = candidates.some((c) => c.ble_token === token);
          if (!known) return;
          seen.add(token);
          cb.onProximity?.(rssi);
          cb.onStatus?.('Close-range signal found');
          const reveal = await api.reportSighting(token);
          if (reveal) cb.onReveal?.(reveal);
        });
        cb.onStatus?.(`${candidates.length} compatible nearby — confirming with Bluetooth`);
      } else {
        cb.onStatus?.('No compatible matches in range yet');
      }
    } catch (e) {
      cb.onStatus?.(e instanceof Error ? e.message : 'Discovery error');
    }
  };

  await tick();
  const interval = setInterval(tick, 20_000);

  return () => {
    stopped = true;
    clearInterval(interval);
    stopScan();
    stopAdvertise();
  };
}
