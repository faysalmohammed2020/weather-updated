import type { WeatherGrid } from "@/lib/weather/grid-types";
import { interpolateGridAtIndex } from "@/lib/weather/timeline-interpolation";

type ContourPoint = {
  x: number;
  y: number;
};

export type ContourSegment = {
  level: number;
  start: ContourPoint;
  end: ContourPoint;
  label?: ContourPoint;
};

export function buildPressureContours(
  current: WeatherGrid,
  next: WeatherGrid,
  progress: number,
  levels: number[]
) {
  const segments: ContourSegment[] = [];
  const { width, height } = current;

  for (const level of levels) {
    for (let y = 0; y < height - 1; y += 1) {
      for (let x = 0; x < width - 1; x += 1) {
        const i00 = y * width + x;
        const i10 = y * width + x + 1;
        const i01 = (y + 1) * width + x;
        const i11 = (y + 1) * width + x + 1;
        const values = [
          interpolateGridAtIndex(current, next, i00, progress).scalar,
          interpolateGridAtIndex(current, next, i10, progress).scalar,
          interpolateGridAtIndex(current, next, i11, progress).scalar,
          interpolateGridAtIndex(current, next, i01, progress).scalar,
        ];
        const points = cellIntersections(x, y, values, level);

        if (points.length === 2) {
          segments.push({
            level,
            start: points[0],
            end: points[1],
          });
        } else if (points.length === 4) {
          segments.push(
            { level, start: points[0], end: points[1] },
            { level, start: points[2], end: points[3] }
          );
        }
      }
    }
  }

  return segments;
}

function cellIntersections(
  x: number,
  y: number,
  values: number[],
  level: number
) {
  const points: ContourPoint[] = [];
  const corners: ContourPoint[] = [
    { x, y },
    { x: x + 1, y },
    { x: x + 1, y: y + 1 },
    { x, y: y + 1 },
  ];

  for (let index = 0; index < 4; index += 1) {
    const nextIndex = (index + 1) % 4;
    const first = values[index];
    const second = values[nextIndex];

    if ((first < level && second >= level) || (first >= level && second < level)) {
      const ratio = (level - first) / (second - first);
      const start = corners[index];
      const end = corners[nextIndex];

      points.push({
        x: start.x + (end.x - start.x) * ratio,
        y: start.y + (end.y - start.y) * ratio,
      });
    }
  }

  return points;
}
