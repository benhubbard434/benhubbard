import { geoArea, geoContains, geoEqualEarth, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, Geometry, MultiPolygon, Polygon } from "geojson";
import countries110m from "world-atlas/countries-110m.json";
import countries50m from "world-atlas/countries-50m.json";
import { cities, notVisited, places } from "@/lib/travel";
import TravelMap, { type MapCountry } from "./TravelMap";

const WIDTH = 1000;
/** How much of the map the starting view gives to everywhere I've been. */
const HOME_FIT = 0.92;

type Box = [number, number, number, number];

function polygons(f: Feature<Geometry>): Feature<Polygon>[] {
  if (f.geometry.type === "Polygon") return [f as Feature<Polygon>];
  if (f.geometry.type !== "MultiPolygon") return [];
  return f.geometry.coordinates.map((coordinates) => ({
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates },
  }));
}

function multi(parts: Feature<Polygon>[]): Feature<MultiPolygon> {
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "MultiPolygon", coordinates: parts.map((p) => p.geometry.coordinates) },
  };
}

/**
 * A country's main landmass, the part the map zooms to fit: mainland France
 * rather than France plus French Guiana, the lower 48 rather than a box
 * stretched out to Alaska.
 */
function mainland(f: Feature<Geometry>): Feature<Geometry> {
  const parts = polygons(f);
  if (parts.length < 2) return f;
  return parts.reduce((a, b) => (geoArea(b) > geoArea(a) ? b : a));
}

/**
 * The travel side quest: a world map with a pin for everywhere I've been.
 * The map is projected here, on the server, so the page ships plain SVG
 * paths rather than the atlas and a projection library.
 *
 * The world is drawn from the coarse 1:110m atlas, which keeps the page
 * light. Where a pin or a city falls outside its country's coarse outline,
 * on an island it leaves out like Mallorca, or there's no coarse outline at
 * all, like the Maldives, that country is drawn from the 1:50m atlas instead.
 */
export default function Travel({ ground }: { ground: string }) {
  const topology = countries110m as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
  const world = feature(topology, topology.objects.countries);
  const fine = countries50m as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
  const detailed = new Map(feature(fine, fine.objects.countries).features.map((f) => [f.id, f as Feature<Geometry>]));
  // Antarctica takes a fifth of the height and nobody's pinning it
  const land: Feature<Geometry>[] = world.features.filter((f) => f.properties.name !== "Antarctica");

  const projection = geoEqualEarth().fitWidth(WIDTH, { type: "FeatureCollection", features: land });
  // A tenth of a unit is under a pixel even at full zoom; the default three
  // decimal places just make the page heavier.
  const path = geoPath(projection).digits(1);
  const [[, top], [, bottom]] = path.bounds({ type: "FeatureCollection", features: land });
  const height = Math.ceil(bottom - top);
  projection.translate([projection.translate()[0], projection.translate()[1] - top]);

  // A country lights up when any pin falls inside it, and then carries the
  // box its mainland fills, for zooming to. Territories listed in notVisited
  // are cut out of it and drawn last, unfilled. Anything added goes on the
  // end, so every coarse country keeps its index, which pins refer to it by.
  const cutOut: Feature<Polygon>[] = [];
  const inside = (f: Feature<Geometry>, p: { lat: number; lon: number }) => geoContains(f, [p.lon, p.lat]);
  const visitedCountry = (coarse: Feature<Geometry>): MapCountry => {
    // Its places, and the cities listed under them
    const names = new Set(places.filter((p) => inside(coarse, p)).map((p) => p.country));
    const spots = [...places, ...cities].filter((p) => names.has(p.country));
    const needsDetail = spots.some((p) => !inside(coarse, p));
    const fine = needsDetail && coarse.id !== undefined ? detailed.get(coarse.id) : undefined;
    const f = fine ?? coarse;
    const parts = polygons(f);
    const skipped = parts.filter((part) => notVisited.some((t) => geoContains(part, [t.lon, t.lat])));
    cutOut.push(...skipped);
    const kept = skipped.length ? multi(parts.filter((part) => !skipped.includes(part))) : f;
    return {
      d: path(kept) ?? "",
      visited: true,
      bounds: path.bounds(mainland(kept)).flat() as Box,
    };
  };
  const countries: MapCountry[] = land.map((f) =>
    places.some((p) => inside(f, p)) ? visitedCountry(f) : { d: path(f) ?? "", visited: false },
  );

  // Places too small for the coarse atlas, like the Maldives, are looked for
  // in the fine one and drawn on the end, after every coarse country.
  const countryOf: (number | null)[] = places.map((p) => {
    const i = land.findIndex((f) => inside(f, p));
    if (i !== -1) return i;
    const small = [...detailed.values()].find((f) => inside(f, p));
    if (!small) return null;
    countries.push(visitedCountry(small));
    return countries.length - 1;
  });
  countries.push(...cutOut.map((part) => ({ d: path(part) ?? "", visited: false })));

  const pins = places.map((p, i) => {
    const [x, y] = projection([p.lon, p.lat]) ?? [0, 0];
    return { ...p, x, y, countryIndex: countryOf[i] };
  });

  const cityPins = cities.map((c) => {
    const [x, y] = projection([c.lon, c.lat]) ?? [0, 0];
    return { ...c, x, y };
  });

  // The starting view: everywhere I've been, filling most of the map. Most of
  // it is in Europe, which is a speck on the whole world.
  const boxes: Box[] = [
    ...countries.flatMap((c) => (c.bounds ? [c.bounds] : [])),
    ...pins.map((p): Box => [p.x, p.y, p.x, p.y]),
  ];
  const home = fitView(
    [
      Math.min(...boxes.map((b) => b[0])),
      Math.min(...boxes.map((b) => b[1])),
      Math.max(...boxes.map((b) => b[2])),
      Math.max(...boxes.map((b) => b[3])),
    ],
    WIDTH,
    height,
    HOME_FIT,
  );

  return (
    <TravelMap
      ground={ground}
      width={WIDTH}
      height={height}
      countries={countries}
      pins={pins}
      cities={cityPins}
      home={home}
    />
  );
}

/**
 * The view that fits a box, in the SVG's units, into the map with a margin.
 * Offsets are fractions of the map's size, as TravelMap keeps them.
 */
function fitView([x0, y0, x1, y1]: Box, width: number, height: number, fill: number) {
  if (!isFinite(x0)) return { k: 1, x: 0, y: 0 };
  const k = Math.max(1, fill * Math.min(width / Math.max(x1 - x0, 1), height / Math.max(y1 - y0, 1)));
  const cx = (x0 + x1) / 2 / width;
  const cy = (y0 + y1) / 2 / height;
  // Clamped so the map still covers its frame
  return {
    k,
    x: Math.min(0, Math.max(1 - k, 0.5 - cx * k)),
    y: Math.min(0, Math.max(1 - k, 0.5 - cy * k)),
  };
}
