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
 * A city within a visited country. It's listed beside its country, but only
 * appears on the map once its country is selected and the map is zoomed in
 * far enough to tell cities apart.
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
  // France's other overseas departments. Only the detailed outline has
  // them, which France is drawn from if a pin or city ever needs it.
  { name: "Martinique", lat: 14.66, lon: -61.02 },
  { name: "Guadeloupe", lat: 16.17, lon: -61.67 },
  { name: "Réunion", lat: -21.12, lon: 55.54 },
  { name: "Mayotte", lat: -12.82, lon: 45.13 },
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
  { name: "United Arab Emirates", country: "United Arab Emirates", lat: 23.9, lon: 54.3 },
  { name: "Estonia", country: "Estonia", lat: 58.7, lon: 25.5 },
  // Too small for the coarse outline, so drawn from the detailed one
  { name: "Maldives", country: "Maldives", lat: 4.1755, lon: 73.5093 },
];

export const cities: City[] = [
  // Spain
  { name: "Barcelona", country: "Spain", lat: 41.3874, lon: 2.1686 },
  { name: "Seville", country: "Spain", lat: 37.3891, lon: -5.9845 },
  { name: "Valencia", country: "Spain", lat: 39.4699, lon: -0.3763 },
  { name: "Marbella", country: "Spain", lat: 36.5101, lon: -4.8825 },
  // Nudged inland from the centre, which the outline puts just offshore
  { name: "Benidorm", country: "Spain", lat: 38.548, lon: -0.14 },
  { name: "Palma de Mallorca", country: "Spain", lat: 39.5696, lon: 2.6502 },
  { name: "Ibiza Town", country: "Spain", lat: 38.9067, lon: 1.4206 },
  { name: "Pollensa", country: "Spain", lat: 39.877, lon: 3.016 },
  { name: "Puerto Pollensa", country: "Spain", lat: 39.9056, lon: 3.0853 },
  // United Kingdom. The two regions are pinned near their middles.
  { name: "London", country: "United Kingdom", lat: 51.5072, lon: -0.1276 },
  { name: "Birmingham", country: "United Kingdom", lat: 52.4862, lon: -1.8904 },
  { name: "Manchester", country: "United Kingdom", lat: 53.4808, lon: -2.2426 },
  // Nudged inland from the centre, which the outline puts in the Mersey
  { name: "Liverpool", country: "United Kingdom", lat: 53.41, lon: -2.95 },
  { name: "Leeds", country: "United Kingdom", lat: 53.8008, lon: -1.5491 },
  { name: "Aberdeen", country: "United Kingdom", lat: 57.1497, lon: -2.0943 },
  { name: "Bristol", country: "United Kingdom", lat: 51.4545, lon: -2.5879 },
  { name: "Bath", country: "United Kingdom", lat: 51.3811, lon: -2.359 },
  { name: "Newbury", country: "United Kingdom", lat: 51.4014, lon: -1.3231 },
  { name: "Brighton", country: "United Kingdom", lat: 50.8225, lon: -0.1372 },
  { name: "Newquay", country: "United Kingdom", lat: 50.4155, lon: -5.0737 },
  { name: "Cotswolds", country: "United Kingdom", lat: 51.93, lon: -1.72 },
  { name: "North Norfolk", country: "United Kingdom", lat: 52.9, lon: 1.08 },
  // Ireland
  { name: "Dublin", country: "Ireland", lat: 53.3498, lon: -6.2603 },
  // France
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
  { name: "Saint-Tropez", country: "France", lat: 43.2727, lon: 6.6406 },
  // Italy
  { name: "Venice", country: "Italy", lat: 45.4408, lon: 12.3155 },
  // Netherlands
  { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lon: 4.9041 },
  // Germany
  { name: "Munich", country: "Germany", lat: 48.1351, lon: 11.582 },
  { name: "Berlin", country: "Germany", lat: 52.52, lon: 13.405 },
  // Denmark
  { name: "Copenhagen", country: "Denmark", lat: 55.6761, lon: 12.5683 },
  // Sweden
  { name: "Stockholm", country: "Sweden", lat: 59.3293, lon: 18.0686 },
  // Estonia
  { name: "Tallinn", country: "Estonia", lat: 59.437, lon: 24.7536 },
  // Greece
  { name: "Kos", country: "Greece", lat: 36.8933, lon: 27.2889 },
  { name: "Heraklion", country: "Greece", lat: 35.3387, lon: 25.1442 },
  { name: "Chania", country: "Greece", lat: 35.5138, lon: 24.018 },
  { name: "Sougia", country: "Greece", lat: 35.25, lon: 23.8083 },
  // Croatia
  { name: "Split", country: "Croatia", lat: 43.5081, lon: 16.4402 },
  // Turkey
  // Old Istanbul, rather than the centre point on the Golden Horn
  { name: "Istanbul", country: "Turkey", lat: 41.015, lon: 28.95 },
  // United States
  { name: "Boston", country: "United States", lat: 42.3601, lon: -71.0589 },
  { name: "Minneapolis", country: "United States", lat: 44.9778, lon: -93.265 },
  { name: "Denver", country: "United States", lat: 39.7392, lon: -104.9903 },
  { name: "Los Angeles", country: "United States", lat: 34.0522, lon: -118.2437 },
  // Mexico
  { name: "Cancún", country: "Mexico", lat: 21.1619, lon: -86.8515 },
  // United Arab Emirates
  { name: "Dubai", country: "United Arab Emirates", lat: 25.2048, lon: 55.2708 },
  // Maldives
  { name: "Ari Atoll", country: "Maldives", lat: 3.87, lon: 72.83 },
];
