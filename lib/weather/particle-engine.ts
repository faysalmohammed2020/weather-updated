import { colorForWindSpeed } from "@/lib/weather/color-scales";
import type {
  AnimationQuality,
  WeatherGrid,
} from "@/lib/weather/grid-types";
import { interpolateWind } from "@/lib/weather/interpolate-grid";
import { interpolateValue } from "@/lib/weather/timeline-interpolation";

type Particle = {
  lng: number;
  lat: number;
  age: number;
  maxAge: number;
};

type WindFrame = {
  current: WeatherGrid;
  next: WeatherGrid;
  progress: number;
};

type Project = (lat: number, lng: number) => { x: number; y: number };

const particleCounts: Record<AnimationQuality, number> = {
  low: 1400,
  medium: 3200,
  high: 5600,
};

export class WindParticleEngine {
  private particles: Particle[] = [];
  private quality: AnimationQuality = "medium";
  private reducedMotion = false;

  setQuality(quality: AnimationQuality, reducedMotion: boolean) {
    this.quality = quality;
    this.reducedMotion = reducedMotion;
    this.ensureParticleCount();
  }

  reset(grid: WeatherGrid) {
    this.particles = [];
    this.ensureParticleCount(grid);
  }

  draw(
    context: CanvasRenderingContext2D,
    project: Project,
    frame: WindFrame,
    opacity: number,
    isMapMoving: boolean
  ) {
    this.ensureParticleCount(frame.current);

    const speedScale = this.reducedMotion ? 0.00045 : isMapMoving ? 0.0007 : 0.00105;
    context.globalCompositeOperation = "destination-in";
    context.fillStyle = `rgba(0, 0, 0, ${isMapMoving ? 0.86 : 0.92})`;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.globalCompositeOperation = "source-over";
    context.lineCap = "round";
    context.lineJoin = "round";

    for (const particle of this.particles) {
      particle.age += this.reducedMotion ? 0.45 : 1;

      if (particle.age > particle.maxAge) {
        this.respawn(particle, frame.current);
        continue;
      }

      const wind = sampleInterpolatedWind(
        particle.lng,
        particle.lat,
        frame.current,
        frame.next,
        frame.progress
      );

      if (!wind || wind.speed < 0.4) {
        this.respawn(particle, frame.current);
        continue;
      }

      const from = project(particle.lat, particle.lng);
      particle.lng += wind.u * speedScale;
      particle.lat += wind.v * speedScale;

      if (!insideBounds(particle.lng, particle.lat, frame.current)) {
        this.respawn(particle, frame.current);
        continue;
      }

      const to = project(particle.lat, particle.lng);
      const alpha = Math.min(1, opacity * (0.35 + wind.speed / 80));
      const width = Math.min(1.8, 0.7 + wind.speed / 55);

      context.beginPath();
      context.strokeStyle = colorForWindSpeed(wind.speed, alpha);
      context.lineWidth = width;
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
    }
  }

  private ensureParticleCount(grid?: WeatherGrid) {
    const target = this.reducedMotion
      ? Math.floor(particleCounts.low * 0.45)
      : particleCounts[this.quality];

    if (this.particles.length === target) {
      return;
    }

    if (this.particles.length > target) {
      this.particles.length = target;
      return;
    }

    if (!grid) {
      return;
    }

    while (this.particles.length < target) {
      const particle: Particle = {
        lng: 0,
        lat: 0,
        age: 0,
        maxAge: 90,
      };
      this.respawn(particle, grid);
      this.particles.push(particle);
    }
  }

  private respawn(particle: Particle, grid: WeatherGrid) {
    const { bounds } = grid;
    particle.lng = bounds.west + Math.random() * (bounds.east - bounds.west);
    particle.lat = bounds.south + Math.random() * (bounds.north - bounds.south);
    particle.age = Math.random() * 40;
    particle.maxAge = 60 + Math.random() * 70;
  }
}

function sampleInterpolatedWind(
  lng: number,
  lat: number,
  current: WeatherGrid,
  next: WeatherGrid,
  progress: number
) {
  const currentWind = interpolateWind(lng, lat, current);
  const nextWind = interpolateWind(lng, lat, next);

  if (!currentWind || !nextWind) {
    return null;
  }

  const u = interpolateValue(currentWind.u, nextWind.u, progress);
  const v = interpolateValue(currentWind.v, nextWind.v, progress);

  return {
    u,
    v,
    speed: Math.hypot(u, v),
  };
}

function insideBounds(lng: number, lat: number, grid: WeatherGrid) {
  const { bounds } = grid;
  return (
    lng >= bounds.west &&
    lng <= bounds.east &&
    lat >= bounds.south &&
    lat <= bounds.north
  );
}
