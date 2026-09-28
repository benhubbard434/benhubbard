/**
 * Everywhere I've travelled, pinned on the map at /side-quests/travel.
 * Countries light up on their own when a pin falls inside them, so only the
 * place and its coordinates need adding.
 *
 * A whole country is a place named after itself, pinned near its middle
 * rather than on a city, so it doesn't claim a city I haven't been to.
 */

export type Place = {
  name: string;
  country: string;
  /** Decimal degrees: north and east positive. */
  lat: number;
  lon: number;
};

export type Photo = {
  /** A path under /public, or a full URL on an allowed image host. */
  src: string;
  alt: string;
  caption?: string;
};

/**
 * A city within a visited country. Cities stay hidden until their country
 * is selected on the map (or the list's "show all cities" is on), and only
 * appear on the map once it's zoomed in far enough to tell them apart.
 */
export type City = {
  name: string;
  /** Must match the `country` of a place below, which it's grouped under. */
  country: string;
  lat: number;
  lon: number;
  /** Photos from the trip. The pin gets a photo button that opens them. */
  album?: Photo[];
};

/**
 * Far-flung parts of a visited country that I haven't been to, so they stay
 * unfilled. Each is a point inside the territory: whichever piece of its
 * country's outline contains it is left out.
 */
export const notVisited: { name: string; lat: number; lon: number }[] = [
  // Part of France, but in South America
  { name: "French Guiana", lat: 4.0, lon: -53.0 },
];

export const places: Place[] = [
  { name: "United States", country: "United States", lat: 39.8, lon: -98.6 },
  { name: "Mexico", country: "Mexico", lat: 23.6, lon: -102.5 },
  { name: "United Kingdom", country: "United Kingdom", lat: 53.5, lon: -1.9 },
  { name: "Ireland", country: "Ireland", lat: 53.2, lon: -8.0 },
  { name: "France", country: "France", lat: 46.6, lon: 2.4 },
  { name: "Spain", country: "Spain", lat: 40.2, lon: -3.7 },
  { name: "Italy", country: "Italy", lat: 42.8, lon: 12.6 },
  { name: "Netherlands", country: "Netherlands", lat: 52.2, lon: 5.5 },
  { name: "Denmark", country: "Denmark", lat: 56.0, lon: 9.3 },
  { name: "Sweden", country: "Sweden", lat: 62.0, lon: 15.0 },
  { name: "Germany", country: "Germany", lat: 51.2, lon: 10.4 },
  { name: "Croatia", country: "Croatia", lat: 45.1, lon: 15.4 },
  { name: "Greece", country: "Greece", lat: 39.1, lon: 22.0 },
  { name: "Turkey", country: "Turkey", lat: 39.0, lon: 35.2 },
  { name: "Dubai", country: "United Arab Emirates", lat: 25.2048, lon: 55.2708 },
  // Too small to draw at this scale, so it's a pin without a fill
  { name: "Maldives", country: "Maldives", lat: 4.1755, lon: 73.5093 },
];

export const cities: City[] = [
  // Spain
  { name: "Barcelona", country: "Spain", lat: 41.3874, lon: 2.1686 },
  { name: "Seville", country: "Spain", lat: 37.3891, lon: -5.9845 },
  { name: "Valencia", country: "Spain", lat: 39.4699, lon: -0.3763 },
  { name: "Marbella", country: "Spain", lat: 36.5101, lon: -4.8825 },
  { name: "Benidorm", country: "Spain", lat: 38.5411, lon: -0.1225 },
  { name: "Palma de Mallorca", country: "Spain", lat: 39.5696, lon: 2.6502 },
  { name: "Pollensa", country: "Spain", lat: 39.877, lon: 3.016 },
  { name: "Puerto Pollensa", country: "Spain", lat: 39.9056, lon: 3.0853 },
];
