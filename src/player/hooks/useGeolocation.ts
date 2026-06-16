import { useEffect, useRef } from "react";
import type { Stop } from "../../types";

// GPS auto mode (M3). Watches position and fires onArrive(seq) when the bus
// enters a stop's trigger radius. De-bounced: a stop must be hit a few samples
// in a row, and each stop only fires once.

const EARTH_R = 6371000; // metres

function haversine(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(s));
}

export function useGeolocation(
  enabled: boolean,
  stops: Stop[],
  onArrive: (seq: number) => void,
  samplesToConfirm = 2,
) {
  const fired = useRef<Set<number>>(new Set());
  const streak = useRef<{ seq: number; count: number } | null>(null);

  useEffect(() => {
    if (!enabled || !("geolocation" in navigator)) return;
    fired.current.clear();
    streak.current = null;

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let hit: Stop | null = null;
        for (const s of stops) {
          if (!s.gps || fired.current.has(s.seq)) continue;
          const d = haversine(latitude, longitude, s.gps.lat, s.gps.lng);
          if (d <= s.gps.radius) {
            hit = s;
            break;
          }
        }
        if (!hit) {
          streak.current = null;
          return;
        }
        if (streak.current?.seq === hit.seq) {
          streak.current.count += 1;
        } else {
          streak.current = { seq: hit.seq, count: 1 };
        }
        if (streak.current.count >= samplesToConfirm) {
          fired.current.add(hit.seq);
          streak.current = null;
          onArrive(hit.seq);
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [enabled, stops, onArrive, samplesToConfirm]);
}
