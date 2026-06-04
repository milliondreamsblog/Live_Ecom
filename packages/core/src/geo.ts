/** Geo helpers for hyperlocal routing (nearest dark store, ETA inputs). */

export interface LatLng {
  lat: number;
  lng: number;
}

const toRad = (deg: number): number => (deg * Math.PI) / 180;

/** Great-circle distance between two points in kilometres (haversine). */
export const haversineKm = (a: LatLng, b: LatLng): number => {
  const R = 6371; // earth radius km
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

/** The store closest to `point`, or null if the list is empty. */
export const nearestStore = <T extends LatLng>(stores: T[], point: LatLng): T | null => {
  if (stores.length === 0) return null;
  return stores.reduce((best, store) =>
    haversineKm(store, point) < haversineKm(best, point) ? store : best,
  );
};
