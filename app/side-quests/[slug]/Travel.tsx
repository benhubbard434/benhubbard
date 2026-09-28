import { geoContains, geoEqualEarth, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, Geometry } from "geojson";
import countries110m from "world-atlas/countries-110m.json";
import { places } from "@/lib/travel";
import TravelMap from "./TravelMap";

const WIDTH = 1000;

/**
 * The travel side quest: a world map with a pin for everywhere I've been.
 * The map is projected here, on the server, so the page ships plain SVG
 * paths rather than the atlas and a projection library.
 */
export default function Travel({ ground }: { ground: string }) {
  const topology = countries110m as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
  const world = feature(topology, topology.objects.countries);
  // Antarctica takes a fifth of the height and nobody's pinning it
  const land: Feature<Geometry>[] = world.features.filter((f) => f.properties.name !== "Antarctica");

  const projection = geoEqualEarth().fitWidth(WIDTH, { type: "FeatureCollection", features: land });
  const path = geoPath(projection);
  const [[, top], [, bottom]] = path.bounds({ type: "FeatureCollection", features: land });
  const height = Math.ceil(bottom - top);
  projection.translate([projection.translate()[0], projection.translate()[1] - top]);

  // A country lights up when any pin falls inside it
  const countries = land.map((f) => ({
    d: path(f) ?? "",
    visited: places.some((p) => geoContains(f, [p.lon, p.lat])),
  }));

  const pins = places.map((p) => {
    const [x, y] = projection([p.lon, p.lat]) ?? [0, 0];
    return { ...p, x, y };
  });

  return <TravelMap ground={ground} width={WIDTH} height={height} countries={countries} pins={pins} />;
}
