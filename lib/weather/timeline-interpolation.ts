import type { WeatherGrid } from "@/lib/weather/grid-types";

export type InterpolatedWeatherFrame = {
  current: WeatherGrid;
  next: WeatherGrid;
  progress: number;
};

export function getInterpolatedWeatherFrame(
  frames: WeatherGrid[],
  timelineIndex: number,
  progress: number
): InterpolatedWeatherFrame | null {
  if (frames.length === 0) {
    return null;
  }

  const currentIndex = positiveModulo(timelineIndex, frames.length);
  const nextIndex = positiveModulo(currentIndex + 1, frames.length);

  return {
    current: frames[currentIndex],
    next: frames[nextIndex],
    progress: Math.min(1, Math.max(0, progress)),
  };
}

export function interpolateValue(
  currentValue: number,
  nextValue: number,
  progress: number
) {
  return currentValue * (1 - progress) + nextValue * progress;
}

export function interpolateGridAtIndex(
  current: WeatherGrid,
  next: WeatherGrid,
  index: number,
  progress: number
) {
  const scalarCurrent = current.scalar?.[index] ?? 0;
  const scalarNext = next.scalar?.[index] ?? scalarCurrent;

  return {
    u: interpolateValue(current.u[index], next.u[index], progress),
    v: interpolateValue(current.v[index], next.v[index], progress),
    scalar: interpolateValue(scalarCurrent, scalarNext, progress),
  };
}

function positiveModulo(value: number, length: number) {
  return ((value % length) + length) % length;
}
