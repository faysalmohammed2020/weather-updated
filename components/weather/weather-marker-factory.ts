import L from "leaflet";

export type WeatherMarkerType =
  | "station"
  | "temperature"
  | "wind"
  | "humidity"
  | "pressure"
  | "dewpoint"
  | "solarRadiation"
  | "forecast";

export type WeatherMarkerZoomMode = "compact" | "normal" | "detailed";

type WeatherMarkerIconOptions = {
  type: WeatherMarkerType;
  value?: string | number | null;
  unit?: string;
  direction?: number;
  selected?: boolean;
  hovered?: boolean;
  disabled?: boolean;
  zoom?: number;
  label?: string;
};

type MarkerTheme = {
  className: string;
  accent: string;
  icon: () => string;
};

const iconCache = new Map<string, L.DivIcon>();

const markerThemes: Record<WeatherMarkerType, MarkerTheme> = {
  station: {
    className: "station",
    accent: "#0284c7",
    icon: stationIcon,
  },
  temperature: {
    className: "temperature",
    accent: "#f97316",
    icon: thermometerIcon,
  },
  wind: {
    className: "wind",
    accent: "#0f766e",
    icon: windIcon,
  },
  humidity: {
    className: "humidity",
    accent: "#2563eb",
    icon: dropletIcon,
  },
  pressure: {
    className: "pressure",
    accent: "#7c3aed",
    icon: gaugeIcon,
  },
  dewpoint: {
    className: "dewpoint",
    accent: "#0891b2",
    icon: dewPointIcon,
  },
  solarRadiation: {
    className: "solar",
    accent: "#d97706",
    icon: sunIcon,
  },
  forecast: {
    className: "forecast",
    accent: "#475569",
    icon: stationIcon,
  },
};

export function getWeatherMarkerTypeFromLayer(
  layerKey?: string | null,
  layerKind?: string
): WeatherMarkerType {
  if (!layerKey) {
    return "station";
  }

  if (layerKind === "forecast") {
    return "forecast";
  }

  if (layerKey === "dewPoint") {
    return "dewpoint";
  }

  if (isWeatherMarkerType(layerKey)) {
    return layerKey;
  }

  return "station";
}

export function getZoomMode(zoom = 7): WeatherMarkerZoomMode {
  if (zoom <= 7) {
    return "compact";
  }

  if (zoom >= 10) {
    return "detailed";
  }

  return "normal";
}

export function createWeatherMarkerIcon({
  type,
  value,
  unit = "",
  direction = 0,
  selected = false,
  hovered = false,
  disabled = false,
  zoom = 7,
  label = "Weather station",
}: WeatherMarkerIconOptions) {
  const zoomMode = getZoomMode(zoom);
  const displayUnit = zoomMode === "compact" ? "" : unit;
  const displayValue = value ?? "";
  const cacheKey = [
    type,
    displayValue,
    displayUnit,
    Math.round(direction),
    selected,
    hovered,
    disabled,
    zoomMode,
    label,
  ].join("|");
  const cachedIcon = iconCache.get(cacheKey);

  if (cachedIcon) {
    return cachedIcon;
  }

  const theme = markerThemes[type];
  const size = getMarkerSize(type, zoomMode, selected, hovered);
  const html = createMarkerHtml({
    type,
    theme,
    value: displayValue,
    unit: displayUnit,
    direction,
    selected,
    hovered,
    disabled,
    zoomMode,
    label,
  });
  const icon = L.divIcon({
    html,
    className: "bd-weather-marker-shell",
    iconAnchor: [size.width / 2, size.height / 2],
    iconSize: [size.width, size.height],
  });

  iconCache.set(cacheKey, icon);

  return icon;
}

function createMarkerHtml({
  type,
  theme,
  value,
  unit,
  direction,
  selected,
  hovered,
  disabled,
  zoomMode,
  label,
}: {
  type: WeatherMarkerType;
  theme: MarkerTheme;
  value: string | number;
  unit: string;
  direction: number;
  selected: boolean;
  hovered: boolean;
  disabled: boolean;
  zoomMode: WeatherMarkerZoomMode;
  label: string;
}) {
  const stateClasses = [
    selected ? "is-selected" : "",
    hovered ? "is-hovered" : "",
    disabled ? "is-disabled" : "",
    `is-${zoomMode}`,
  ]
    .filter(Boolean)
    .join(" ");
  const content = getMarkerContent(type, theme, value, unit, direction, zoomMode);

  return `<div
    class="bd-weather-marker bd-weather-marker-${theme.className} ${stateClasses}"
    style="--marker-accent:${theme.accent}"
    role="img"
    aria-label="${escapeHtml(label)}"
  >${content}</div>`;
}

function getMarkerContent(
  type: WeatherMarkerType,
  theme: MarkerTheme,
  value: string | number,
  unit: string,
  direction: number,
  zoomMode: WeatherMarkerZoomMode
) {
  if (type === "station") {
    return `<span class="bd-marker-station-core">${theme.icon()}</span>`;
  }

  if (type === "forecast") {
    return `<span class="bd-marker-forecast-core">${theme.icon()}</span>`;
  }

  if (type === "wind") {
    return `<span class="bd-marker-wind-arrow" style="transform:rotate(${direction}deg)">↑</span><span class="bd-marker-value">${value}</span><span class="bd-marker-unit">${unit}</span>`;
  }

  if (type === "pressure") {
    return `<span class="bd-marker-icon">${theme.icon()}</span><span class="bd-marker-pressure-value">${value}</span><span class="bd-marker-unit">${unit}</span>`;
  }

  if (type === "solarRadiation") {
    return `<span class="bd-marker-icon bd-marker-sun-icon">${theme.icon()}</span><span class="bd-marker-value">${value}</span><span class="bd-marker-unit">${unit}</span>`;
  }

  const hiddenIcon = zoomMode === "compact" ? " aria-hidden=\"true\"" : "";

  return `<span class="bd-marker-icon"${hiddenIcon}>${theme.icon()}</span><span class="bd-marker-value">${value}</span><span class="bd-marker-unit">${unit}</span>`;
}

function getMarkerSize(
  type: WeatherMarkerType,
  zoomMode: WeatherMarkerZoomMode,
  selected: boolean,
  hovered: boolean
) {
  const baseSize =
    type === "station"
      ? { compact: [26, 26], normal: [30, 30], detailed: [34, 34] }
      : type === "forecast"
        ? { compact: [24, 24], normal: [28, 28], detailed: [32, 32] }
        : type === "solarRadiation"
          ? { compact: [46, 34], normal: [62, 38], detailed: [74, 42] }
          : type === "pressure"
            ? { compact: [40, 40], normal: [46, 46], detailed: [52, 52] }
            : type === "wind"
              ? { compact: [44, 36], normal: [56, 40], detailed: [64, 44] }
              : { compact: [42, 34], normal: [54, 38], detailed: [62, 42] };
  const [width, height] = baseSize[zoomMode];
  const stateGrowth = selected ? 8 : hovered ? 4 : 0;

  return { width: width + stateGrowth, height: height + stateGrowth };
}

function isWeatherMarkerType(value: string): value is WeatherMarkerType {
  return [
    "station",
    "temperature",
    "wind",
    "humidity",
    "pressure",
    "dewpoint",
    "solarRadiation",
    "forecast",
  ].includes(value);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[char];
  });
}

function thermometerIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 14.8V5a4 4 0 0 0-8 0v9.8a6 6 0 1 0 8 0Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="18" r="2.4" fill="currentColor"/></svg>`;
}

function dropletIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2S5.7 10.1 5.7 15a6.3 6.3 0 0 0 12.6 0C18.3 10.1 12 3.2 12 3.2Z" fill="currentColor"/><path d="M9.2 16.2c.6 1.4 1.7 2.1 3.3 2.1" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="1.7" stroke-linecap="round"/></svg>`;
}

function windIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h10.2a2.8 2.8 0 1 0-2.7-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M3 13h15.2a2.8 2.8 0 1 1-2.7 3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
}

function gaugeIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.6 15.8a7.6 7.6 0 1 1 14.8 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="m12 14 3.2-4.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="14" r="1.6" fill="currentColor"/></svg>`;
}

function dewPointIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.4 17.7h8.1a3.7 3.7 0 0 0 .6-7.4 5.1 5.1 0 0 0-9.7-1.4A4.5 4.5 0 0 0 8.4 17.7Z" fill="currentColor"/><path d="M7.4 13.2S5.2 15.8 5.2 17.5a2.2 2.2 0 0 0 4.4 0c0-1.7-2.2-4.3-2.2-4.3Z" fill="rgba(255,255,255,.9)"/></svg>`;
}

function sunIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="currentColor"/><path d="M12 2.8v2.1M12 19.1v2.1M21.2 12h-2.1M4.9 12H2.8M18.5 5.5 17 7M7 17l-1.5 1.5M18.5 18.5 17 17M7 7 5.5 5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
}

function stationIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7" r="2.7" fill="currentColor"/><path d="M7.2 11.2a6.8 6.8 0 0 1 0-8.4M16.8 2.8a6.8 6.8 0 0 1 0 8.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8.2 20h7.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
}
