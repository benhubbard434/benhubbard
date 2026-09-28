/**
 * Everywhere I've travelled, pinned on the map at /side-quests/travel.
 * Countries light up on their own when a pin falls inside them, so only the
 * place and its coordinates need adding.
 */

export type Place = {
  name: string;
  country: string;
  /** Decimal degrees: north and east positive. */
  lat: number;
  lon: number;
};

export const places: Place[] = [];
