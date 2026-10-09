import { geoDistance, geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { MultiPoint } from "geojson";
import countries10m from "world-atlas/countries-10m.json";
import type { VenueTally } from "@/lib/parkrun";
import type { MapView } from "./ParkrunMap";

/**
 * The parkrun map, projected here on the server so the page ships a couple of
 * SVG paths rather than the atlas and a projection library (as the travel map
 * does). The coastline is clipped to each view, so only the visible stretch
 * of it is sent.
 */

const WIDTH = 720;
const HEIGHT = 480;
const PAD = 40;

/** Charing Cross, and how far from it a venue still counts as London. */
const LONDON: [number, number] = [-0.1276, 51.5072];
const LONDON_KM = 25;

const UK_ID = "826";

function uk() {
  const topology = countries10m as unknown as Topology<{ countries: GeometryCollection }>;
  return feature(topology, topology.objects.countries).features.find((f) => f.id === UK_ID)!;
}

function view(id: string, label: string, venues: VenueTally[]): MapView {
  const points: MultiPoint = { type: "MultiPoint", coordinates: venues.map((v) => [v.lng, v.lat]) };
  const projection = geoMercator().fitExtent([[PAD, PAD], [WIDTH - PAD, HEIGHT - PAD]], points);
  const path = geoPath(projection).digits(1);

  return {
    id,
    label,
    width: WIDTH,
    height: HEIGHT,
    land: path(uk()) ?? "",
    venues: venues.map((v) => {
      const [x, y] = projection([v.lng, v.lat]) ?? [0, 0];
      return { name: v.name, count: v.count, x: Math.round(x), y: Math.round(y) };
    }),
  };
}

export function parkrunMapViews(venues: VenueTally[]): MapView[] {
  const london = venues.filter(
    (v) => geoDistance(LONDON, [v.lng, v.lat]) * 6371 <= LONDON_KM
  );
  return [
    view("all", "Everywhere", venues),
    ...(london.length > 1 ? [view("london", "London", london)] : []),
  ];
}
