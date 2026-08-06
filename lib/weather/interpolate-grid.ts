import type { WeatherGrid } from "@/lib/weather/grid-types";

export type WindSample = {
  u: number;
  v: number;
  speed: number;
};

export function interpolateWind(
  lng: number,
  lat: number,
  grid: WeatherGrid
): WindSample | null {
  const sample = interpolateComponents(lng, lat, grid);

  if (!sample) {
    return null;
  }

  return {
    ...sample,
    speed: Math.hypot(sample.u, sample.v),
  };
}

export function interpolateScalar(
  lng: number,
  lat: number,
  grid: WeatherGrid
): number | null {
  if (!grid.scalar) {
    return null;
  }

  return bilinear(lng, lat, grid, grid.scalar);
}

export function interpolateComponents(
  lng: number,
  lat: number,
  grid: WeatherGrid
): { u: number; v: number } | null {
  const u = bilinear(lng, lat, grid, grid.u);
  const v = bilinear(lng, lat, grid, grid.v);

  if (u === null || v === null) {
    return null;
  }

  return { u, v };
}

function bilinear(
  lng: number,
  lat: number,
  grid: WeatherGrid,
  values: Float32Array
) {
  const { bounds, width, height } = grid;

  if (
    lng < bounds.west ||
    lng > bounds.east ||
    lat < bounds.south ||
    lat > bounds.north
  ) {
    return null;
  }

  const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * (width - 1);
  const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * (height - 1);
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(width - 1, x0 + 1);
  const y1 = Math.min(height - 1, y0 + 1);
  const tx = x - x0;
  const ty = y - y0;

  const i00 = y0 * width + x0;
  const i10 = y0 * width + x1;
  const i01 = y1 * width + x0;
  const i11 = y1 * width + x1;

  const top = values[i00] * (1 - tx) + values[i10] * tx;
  const bottom = values[i01] * (1 - tx) + values[i11] * tx;

  return top * (1 - ty) + bottom * ty;
}
