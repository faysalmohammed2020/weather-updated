// components/NetCDFCsvHeatmap.tsx
"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Papa from "papaparse";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface MapData {
  id: string;
  filename: string;
  plotType: string;
  lats: number[];
  lons: number[];
  z: number[][];
  windOverlay: any[];
  contourData?: any;
}

export default function NetCDFCsvHeatmap() {
  const [maps, setMaps] = useState<MapData[]>([]);

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file, index) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results: any) => {
          const data = results.data.filter((d: any) => d.lat && d.lon);

          const lats = Array.from(new Set(data.map((d: any) => d.lat))).sort(
            (a, b) => a - b
          );
          const lons = Array.from(new Set(data.map((d: any) => d.lon))).sort(
            (a, b) => a - b
          );

          const latLen = lats.length;
          const lonLen = lons.length;

          const z: number[][] = Array.from({ length: latLen }, () =>
            new Array(lonLen).fill(0)
          );

          let variable = "";
          if ("t2_C" in data[0]) variable = "t2_C";
          else if ("rain_mm" in data[0]) variable = "rain_mm";
          else if ("rh2_percent" in data[0]) variable = "rh2_percent";
          else if ("speed" in data[0] && "direction_deg" in data[0])
            variable = "wind_combined";

          let windOverlay: any[] = [];
          let contourData: any = null;

          if (variable === "wind_combined") {
            const zSpeed: number[][] = Array.from({ length: latLen }, () =>
              new Array(lonLen).fill(0)
            );
            const arrows: any[] = [];

            data.forEach((d: any) => {
              const i = lats.indexOf(d.lat);
              const j = lons.indexOf(d.lon);
              const speed = d.speed ?? 0;
              const dir = d.direction_deg ?? 0;
              zSpeed[i][j] = speed;

              // Create wind arrows with speed-based styling
              const angleRad = ((dir - 90) * Math.PI) / 180; // Adjust for meteorological convention
              const arrowLength = Math.min(Math.max(speed / 20, 0.1), 0.5);
              const dx = Math.cos(angleRad) * arrowLength;
              const dy = Math.sin(angleRad) * arrowLength;

              // Color based on wind speed
              const color =
                speed > 15 ? "#FF4444" : speed > 8 ? "#FF8C00" : "#4169E1";
              const width = speed > 15 ? 2 : speed > 8 ? 1.5 : 1;

              arrows.push({
                type: "scatter",
                mode: "lines",
                x: [d.lon, d.lon + dx],
                y: [d.lat, d.lat + dy],
                line: { color: color, width: width },
                showlegend: false,
                hoverinfo: "none",
              });

              // Add arrowhead
              arrows.push({
                type: "scatter",
                mode: "markers",
                x: [d.lon + dx],
                y: [d.lat + dy],
                marker: {
                  color: color,
                  size: 4,
                  symbol: "triangle-up",
                  angle: dir,
                },
                showlegend: false,
                hoverinfo: "none",
              });
            });

            windOverlay = arrows;

            const newMapData: MapData = {
              id: `${file.name}-${Date.now()}-${index}`,
              filename: file.name,
              plotType: variable,
              lats,
              lons,
              z: zSpeed,
              windOverlay: arrows,
            };

            setMaps((prev) => [...prev, newMapData]);
          } else {
            data.forEach((d: any) => {
              const i = lats.indexOf(d.lat);
              const j = lons.indexOf(d.lon);
              const value = d[variable] ?? 0;
              z[i][j] = value;
            });

            // Create contour data for certain variables
            if (variable === "rain_mm" || variable === "t2_C") {
              contourData = {
                z: z,
                x: lons,
                y: lats,
                type: "contour",
                colorscale: getColorScale(variable),
                contours: {
                  showlines: true,
                  linecolor: variable === "rain_mm" ? "#1f77b4" : "#d62728",
                  linewidth: 1,
                },
                showscale: true,
                opacity: 0.7,
              };
            }

            const newMapData: MapData = {
              id: `${file.name}-${Date.now()}-${index}`,
              filename: file.name,
              plotType: variable,
              lats,
              lons,
              z,
              windOverlay: [],
              contourData,
            };

            setMaps((prev) => [...prev, newMapData]);
          }
        },
      });
    });

    e.target.value = "";
  };

  const removeMap = (id: string) => {
    setMaps((prev) => prev.filter((map) => map.id !== id));
  };

  const clearAllMaps = () => {
    setMaps([]);
  };

  const titleMap: Record<string, string> = {
    t2_C: "Temperature Distribution (°C)",
    rain_mm: "Precipitation Distribution (mm)",
    rh2_percent: "Relative Humidity Distribution (%)",
    wind_combined: "Wind Speed & Direction Analysis",
  };

  const getColorScale = (plotType: string) => {
    switch (plotType) {
      case "t2_C":
        return [
          [0, "#313695"], // Deep blue (very cold)
          [0.1, "#4575b4"], // Blue (cold)
          [0.2, "#74add1"], // Light blue (cool)
          [0.3, "#abd9e9"], // Very light blue (mild cool)
          [0.4, "#e0f3f8"], // Almost white (neutral)
          [0.5, "#ffffcc"], // Very light yellow (neutral warm)
          [0.6, "#fee090"], // Light yellow (warm)
          [0.7, "#fdae61"], // Orange (hot)
          [0.8, "#f46d43"], // Red-orange (very hot)
          [0.9, "#d73027"], // Red (extremely hot)
          [1, "#a50026"], // Dark red (scorching)
        ];
      case "rain_mm":
        return [
          [0, "#f7fbff"], // Almost white (no rain)
          [0.1, "#deebf7"], // Very light blue (light drizzle)
          [0.2, "#c6dbef"], // Light blue (light rain)
          [0.3, "#9ecae1"], // Blue (moderate rain)
          [0.4, "#6baed6"], // Medium blue (heavy rain)
          [0.5, "#4292c6"], // Dark blue (very heavy rain)
          [0.6, "#2171b5"], // Darker blue (intense rain)
          [0.7, "#08519c"], // Very dark blue (extreme rain)
          [0.8, "#08306b"], // Navy blue (torrential)
          [0.9, "#041f4a"], // Very dark navy (flood level)
          [1, "#020c1f"], // Almost black (catastrophic)
        ];
      case "rh2_percent":
        return [
          [0, "#fff5f0"], // Very light (dry)
          [0.2, "#fee0d2"], // Light orange (low humidity)
          [0.4, "#fcbba1"], // Orange (moderate low)
          [0.5, "#fc9272"], // Light red (moderate)
          [0.6, "#fb6a4a"], // Red (moderate high)
          [0.7, "#ef3b2c"], // Dark red (high)
          [0.8, "#cb181d"], // Very dark red (very high)
          [0.9, "#a50f15"], // Maroon (extremely high)
          [1, "#67000d"], // Dark maroon (saturated)
        ];
      case "wind_combined":
        return [
          [0, "#440154"], // Purple (calm)
          [0.2, "#31688e"], // Blue (light breeze)
          [0.4, "#35b779"], // Green (moderate breeze)
          [0.6, "#fde725"], // Yellow (strong breeze)
          [0.8, "#fd8d3c"], // Orange (high wind)
          [1, "#d73027"], // Red (extreme wind)
        ];
      default:
        return "Viridis";
    }
  };

  const getPlotData = (mapData: MapData) => {
    const baseData = [];

    if (mapData.plotType === "rain_mm") {
      // For rain: Use filled contour with heatmap overlay
      baseData.push({
        z: mapData.z,
        x: mapData.lons,
        y: mapData.lats,
        type: "contour",
        colorscale: getColorScale(mapData.plotType),
        contours: {
          coloring: "fill",
          showlines: true,
          linecolor: "#1f77b4",
          linewidth: 0.5,
        },
        showscale: true,
        colorbar: {
          title: "mm",
          titleside: "right",
        },
      });
    } else if (mapData.plotType === "t2_C") {
      // For temperature: Smooth heatmap with contour overlay
      baseData.push({
        z: mapData.z,
        x: mapData.lons,
        y: mapData.lats,
        type: "heatmap",
        colorscale: getColorScale(mapData.plotType),
        showscale: true,
        colorbar: {
          title: "°C",
          titleside: "right",
        },
      });

      // Add contour lines
      baseData.push({
        z: mapData.z,
        x: mapData.lons,
        y: mapData.lats,
        type: "contour",
        colorscale: getColorScale(mapData.plotType),
        contours: {
          coloring: "none",
          showlines: true,
          linecolor: "rgba(255,255,255,0.5)",
          linewidth: 1,
        },
        showscale: false,
        hoverinfo: "skip",
      });
    } else if (mapData.plotType === "wind_combined") {
      // For wind: Heatmap for speed + arrows for direction
      baseData.push({
        z: mapData.z,
        x: mapData.lons,
        y: mapData.lats,
        type: "heatmap",
        colorscale: getColorScale(mapData.plotType),
        showscale: true,
        colorbar: {
          title: "m/s",
          titleside: "right",
        },
        opacity: 0.8,
      });
    } else {
      // For humidity: Standard heatmap
      baseData.push({
        z: mapData.z,
        x: mapData.lons,
        y: mapData.lats,
        type: "heatmap",
        colorscale: getColorScale(mapData.plotType),
        showscale: true,
        colorbar: {
          title: "%",
          titleside: "right",
        },
      });
    }

    return [...baseData, ...mapData.windOverlay];
  };

  const getLayoutConfig = (mapData: MapData) => {
    const baseLayout = {
      title: {
        text: `${titleMap[mapData.plotType]} - ${mapData.filename}`,
        font: { size: 14, family: "Arial, sans-serif" },
      },
      xaxis: {
        title: "Longitude (°E)",
        showgrid: true,
        gridcolor: "rgba(255,255,255,0.2)",
      },
      yaxis: {
        title: "Latitude (°N)",
        showgrid: true,
        gridcolor: "rgba(255,255,255,0.2)",
      },
      width: 550,
      height: 450,
      margin: { l: 60, r: 60, t: 60, b: 60 },
      paper_bgcolor: "#f8f9fa",
      plot_bgcolor: "#ffffff",
    };

    // Add specific annotations for different data types
    if (mapData.plotType === "rain_mm") {
      baseLayout.annotations = [
        {
          text: "Precipitation Intensity",
          showarrow: false,
          x: 0.02,
          y: 0.98,
          xref: "paper",
          yref: "paper",
          xanchor: "left",
          yanchor: "top",
          font: { size: 10, color: "#666" },
        },
      ];
    } else if (mapData.plotType === "wind_combined") {
      baseLayout.annotations = [
        {
          text: "Arrow length ∝ Wind Speed<br>Arrow direction = Wind Direction",
          showarrow: false,
          x: 0.02,
          y: 0.98,
          xref: "paper",
          yref: "paper",
          xanchor: "left",
          yanchor: "top",
          font: { size: 9, color: "#666" },
        },
      ];
    }

    return baseLayout;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            Weather Data Spatial Analysis
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Upload Weather Data CSV Files
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSV}
                multiple
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported: Temperature (t2_C), Precipitation (rain_mm), Humidity
                (rh2_percent), Wind (speed + direction_deg)
              </p>
            </div>

            {maps.length > 0 && (
              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  <button
                    onClick={clearAllMaps}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm transition-colors"
                  >
                    Clear All Maps
                  </button>
                  <span className="text-sm text-gray-600 py-2">
                    {maps.length} visualization{maps.length > 1 ? "s" : ""}{" "}
                    active
                  </span>
                </div>

                <div className="text-xs text-gray-500">
                  Professional Weather Visualization
                </div>
              </div>
            )}
          </div>
        </div>

        {maps.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Data Loaded
            </h3>
            <p className="text-gray-500">
              Upload CSV files containing weather data to generate spatial
              visualizations
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {maps.map((mapData) => (
            <div
              key={mapData.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {titleMap[mapData.plotType] || "Spatial Distribution"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Dataset: {mapData.filename}
                    </p>
                  </div>
                  <button
                    onClick={() => removeMap(mapData.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="p-2">
                <Plot
                  data={getPlotData(mapData)}
                  layout={getLayoutConfig(mapData)}
                  config={{
                    responsive: true,
                    displayModeBar: true,
                    modeBarButtonsToRemove: [
                      "lasso2d",
                      "select2d",
                      "autoScale2d",
                    ],
                    displaylogo: false,
                    toImageButtonOptions: {
                      format: "png",
                      filename: `${mapData.plotType}_${mapData.filename}`,
                      height: 450,
                      width: 550,
                      scale: 2,
                    },
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
