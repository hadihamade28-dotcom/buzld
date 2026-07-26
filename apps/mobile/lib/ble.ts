import { Platform } from 'react-native';

import { BLE_RSSI_THRESHOLD, VICINO_BLE_SERVICE_UUID } from '@/constants/theme';

type SightingHandler = (bleToken: string, rssi: number) => void;

let BleManager: any = null;
let manager: any = null;
let scanning = false;

async function getManager() {
  if (Platform.OS === 'web') return null;
  if (manager) return manager;
  try {
    // Dynamic import — native module only on device/dev builds
    const mod = await import('react-native-ble-plx');
    BleManager = mod.BleManager;
    manager = new BleManager();
    return manager;
  } catch (e) {
    console.warn('[vicino] BLE unavailable', e);
    return null;
  }
}

/**
 * Scan for Vicino advertisements. Tokens are expected in localName as `vp_...`
 * or in manufacturer/service data when available.
 */
export async function startBleScan(onSighting: SightingHandler): Promise<() => void> {
  const m = await getManager();
  if (!m) {
    return () => undefined;
  }

  scanning = true;
  m.startDeviceScan(
    [VICINO_BLE_SERVICE_UUID],
    { allowDuplicates: true },
    (error: Error | null, device: { localName?: string | null; name?: string | null; rssi?: number | null } | null) => {
      if (!scanning) return;
      if (error) {
        console.warn('[vicino] BLE scan error', error.message);
        return;
      }
      if (!device) return;
      const name = device.localName || device.name || '';
      const match = name.match(/vp_[a-zA-Z0-9]+/);
      if (!match) return;
      const rssi = device.rssi ?? -100;
      if (rssi < BLE_RSSI_THRESHOLD) return;
      onSighting(match[0], rssi);
    },
  );

  return () => {
    scanning = false;
    try {
      m.stopDeviceScan();
    } catch {
      /* ignore */
    }
  };
}

/**
 * Advertising as a BLE peripheral is not fully covered by react-native-ble-plx.
 * On device builds, plug in a peripheral advertiser; for MVP we expose the token
 * On device builds, plug in a native peripheral advertiser for production BLE discovery.
 */
export async function startBleAdvertise(bleToken: string): Promise<() => void> {
  console.log('[vicino] BLE advertise token ready:', bleToken);
  // Placeholder stop — wire native peripheral advertiser in EAS build if needed
  return () => {
    console.log('[vicino] BLE advertise stopped');
  };
}

export function isBleLikelyAvailable() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}
