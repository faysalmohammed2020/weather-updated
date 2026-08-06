import type { ForecastAnimationLayer } from "@/lib/weather/grid-types";

type ColorStop = {
  value: number;
  color: [number, number, number];
};

export type LayerLegend = {
  label: string;
  unit: string;
  ticks: string[];
  gradient: string;
  min: number;
  max: number;
};

const scales: Record<ForecastAnimationLayer, ColorStop[]> = {
  windForecast: [
    { value: 0, color: [37, 99, 235] },
    { value: 10, color: [6, 182, 212] },
    { value: 25, color: [34, 197, 94] },
    { value: 40, color: [234, 179, 8] },
    { value: 60, color: [249, 115, 22] },
    { value: 80, color: [239, 68, 68] },
  ],
  temperatureForecast: [
    { value: 8, color: [30, 64, 175] },
    { value: 18, color: [6, 182, 212] },
    { value: 27, color: [34, 197, 94] },
    { value: 33, color: [234, 179, 8] },
    { value: 39, color: [249, 115, 22] },
    { value: 44, color: [220, 38, 38] },
  ],
  humidityForecast: [
    { value: 0, color: [202, 138, 4] },
    { value: 30, color: [163, 230, 53] },
    { value: 55, color: [34, 211, 238] },
    { value: 75, color: [59, 130, 246] },
    { value: 100, color: [30, 64, 175] },
  ],
  pressureIsolines: [
    { value: 996, color: [96, 165, 250] },
    { value: 1004, color: [34, 211, 238] },
    { value: 1012, color: [167, 139, 250] },
    { value: 1020, color: [244, 114, 182] },
  ],
  meanSeaLevelPressure: [
    { value: 996, color: [37, 99, 235] },
    { value: 1004, color: [14, 165, 233] },
    { value: 1012, color: [168, 85, 247] },
    { value: 1020, color: [244, 63, 94] },
  ],
  geopotential: [
    { value: 560, color: [20, 184, 166] },
    { value: 575, color: [132, 204, 22] },
    { value: 590, color: [234, 179, 8] },
    { value: 605, color: [249, 115, 22] },
  ],
  dewPointForecast: [
    { value: 10, color: [15, 118, 110] },
    { value: 18, color: [20, 184, 166] },
    { value: 24, color: [34, 211, 238] },
    { value: 30, color: [59, 130, 246] },
  ],
  lowCloud: [
    { value: 0, color: [148, 163, 184] },
    { value: 35, color: [203, 213, 225] },
    { value: 70, color: [241, 245, 249] },
    { value: 100, color: [255, 255, 255] },
  ],
  totalCloud: [
    { value: 0, color: [100, 116, 139] },
    { value: 35, color: [148, 163, 184] },
    { value: 70, color: [226, 232, 240] },
    { value: 100, color: [255, 255, 255] },
  ],
};

export const layerLegends: Record<ForecastAnimationLayer, LayerLegend> = {
  windForecast: {
    label: "Wind speed",
    unit: "km/h",
    ticks: ["0", "15", "30", "50", "75+"],
    gradient: gradientFor("windForecast"),
    min: 0,
    max: 80,
  },
  temperatureForecast: {
    label: "Temperature",
    unit: "°C",
    ticks: ["10", "20", "28", "34", "40+"],
    gradient: gradientFor("temperatureForecast"),
    min: 8,
    max: 44,
  },
  humidityForecast: {
    label: "Humidity",
    unit: "%",
    ticks: ["0", "30", "55", "75", "100"],
    gradient: gradientFor("humidityForecast"),
    min: 0,
    max: 100,
  },
  pressureIsolines: {
    label: "Pressure isolines",
    unit: "hPa",
    ticks: ["996", "1004", "1012", "1020"],
    gradient: gradientFor("pressureIsolines"),
    min: 996,
    max: 1020,
  },
  meanSeaLevelPressure: {
    label: "Mean sea level pressure",
    unit: "hPa",
    ticks: ["996", "1004", "1012", "1020"],
    gradient: gradientFor("meanSeaLevelPressure"),
    min: 996,
    max: 1020,
  },
  geopotential: {
    label: "Geopotential height",
    unit: "dam",
    ticks: ["560", "575", "590", "605"],
    gradient: gradientFor("geopotential"),
    min: 560,
    max: 605,
  },
  dewPointForecast: {
    label: "Dew point",
    unit: "°C",
    ticks: ["10", "18", "24", "30"],
    gradient: gradientFor("dewPointForecast"),
    min: 10,
    max: 30,
  },
  lowCloud: {
    label: "Low cloud",
    unit: "%",
    ticks: ["0", "35", "70", "100"],
    gradient: gradientFor("lowCloud"),
    min: 0,
    max: 100,
  },
  totalCloud: {
    label: "Total cloud",
    unit: "%",
    ticks: ["0", "35", "70", "100"],
    gradient: gradientFor("totalCloud"),
    min: 0,
    max: 100,
  },
};

export function colorForLayer(
  layerKey: ForecastAnimationLayer,
  value: number,
  alpha = 1
) {
  const [r, g, b] = interpolateColor(scales[layerKey], value);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function colorTupleForLayer(
  layerKey: ForecastAnimationLayer,
  value: number
) {
  return interpolateColor(scales[layerKey], value);
}

export function colorForWindSpeed(speed: number, alpha = 1) {
  const [r, g, b] = interpolateColor(scales.windForecast, speed);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function colorTupleForWindSpeed(speed: number) {
  return interpolateColor(scales.windForecast, speed);
}

function interpolateColor(scale: ColorStop[], value: number) {
  if (value <= scale[0].value) {
    return scale[0].color;
  }

  for (let index = 1; index < scale.length; index += 1) {
    const stop = scale[index];
    const previous = scale[index - 1];

    if (value <= stop.value) {
      const ratio = (value - previous.value) / (stop.value - previous.value);

      return previous.color.map((channel, channelIndex) =>
        Math.round(channel + (stop.color[channelIndex] - channel) * ratio)
      ) as [number, number, number];
    }
  }

  return scale[scale.length - 1].color;
}

function gradientFor(layerKey: ForecastAnimationLayer) {
  const scale = scales[layerKey];
  const min = scale[0].value;
  const max = scale[scale.length - 1].value;

  return scale
    .map((stop) => {
      const position = ((stop.value - min) / (max - min)) * 100;
      return `rgb(${stop.color.join(" ")}) ${position.toFixed(1)}%`;
    })
    .join(", ");
}
