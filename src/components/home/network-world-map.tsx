import {
  WORLD_MAP_PATHS,
  WORLD_MAP_VIEWBOX,
} from "@/lib/home/world-map-paths";
import type { ShowcaseCountry } from "@/lib/home/showcase";

const [VIEW_MIN_X, VIEW_MIN_Y, VIEW_WIDTH, VIEW_HEIGHT] = WORLD_MAP_VIEWBOX
  .split(" ")
  .map(Number) as [number, number, number, number];

/** Equirectangular pin placement for the stylized world silhouette. */
export function projectCountryPin(lon: number, lat: number) {
  return {
    x: VIEW_MIN_X + ((lon + 180) / 360) * VIEW_WIDTH,
    y: VIEW_MIN_Y + ((90 - lat) / 180) * VIEW_HEIGHT,
  };
}

type NetworkWorldMapProps = {
  countries: ShowcaseCountry[];
  label: string;
};

export function NetworkWorldMap({ countries, label }: NetworkWorldMapProps) {
  return (
    <svg
      viewBox={WORLD_MAP_VIEWBOX}
      className="h-auto w-full"
      role="img"
      aria-label={label}
    >
      <rect
        width={VIEW_WIDTH}
        height={VIEW_HEIGHT}
        x={VIEW_MIN_X}
        y={VIEW_MIN_Y}
        fill="#0b1220"
      />
      <g fill="#334155" stroke="none" aria-hidden="true">
        {WORLD_MAP_PATHS.map((d, index) => (
          <path key={index} d={d} />
        ))}
      </g>
      {countries.map((country) => {
        const { x, y } = projectCountryPin(country.lon, country.lat);
        return (
          <g key={country.code} className="rq-map-pin">
            <circle cx={x} cy={y} r="5" fill="rgba(249,115,22,0.22)" />
            <circle cx={x} cy={y} r="2.4" fill="#f97316" />
            <title>{country.name}</title>
          </g>
        );
      })}
    </svg>
  );
}
