import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlotlyWrapper } from "@/components/PlotlyWrapper";
import {
  Upload,
  FileText,
  Activity,
  LineChart,
  ScatterChart,
  BarChart3,
  Map,
  BoxSelect,
  Box,
  Globe,
  Download,
  Database,
  Eye,
  AlertCircle,
  Zap,
  TrendingUp,
} from "lucide-react";
import { saveAs } from "file-saver";
import type { Data, Layout, PlotData } from "plotly.js";
import { NetCDFReader } from "netcdfjs";

interface NCVariable {
  dimensions: string[];
  attributes: Array<{ name: string; value: any }>;
  data: number[];
  shape?: number[];
}

interface NCData {
  metadata: {
    dimensions: Record<string, number>;
    globalAttributes: Array<{ name: string; value: any }>;
  };
  variables: Record<string, NCVariable>;
}

interface SpatialCoordinates {
  lat: number[];
  lon: number[];
  hasValidCoords: boolean;
}

interface BackendVisualization {
  [key: string]: string;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ncData, setNcData] = useState<NCData | null>(null);
  const [selectedVariable, setSelectedVariable] = useState<string>("");
  const [plotType, setPlotType] = useState<string>("line");
  const [error, setError] = useState<string>("");
  const [backendVisualizations, setBackendVisualizations] =
    useState<BackendVisualization | null>(null);
  const [isLoadingBackend, setIsLoadingBackend] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<string>("interactive");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
      setNcData(null);
      setBackendVisualizations(null);
    }
  };

  const processFileLocally = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      const reader = new NetCDFReader(buffer);

      const dimensions = Object.fromEntries(
        Object.entries(reader.dimensions).map(([name, { size }]) => [
          name,
          size,
        ])
      );

      const globalAttributes = reader.globalAttributes.map((attr) => ({
        name: attr.name,
        value: attr.value,
      }));

      const variables: Record<string, NCVariable> = {};
      for (const variable of reader.variables) {
        variables[variable.name] = {
          dimensions: variable.dimensions,
          attributes: variable.attributes.map((attr) => ({
            name: attr.name,
            value: attr.value,
          })),
          data: downsampleData(reader.getDataVariable(variable.name)),
        };
      }

      const processedData = {
        metadata: { dimensions, globalAttributes },
        variables,
      };

      setNcData(processedData);
      if (Object.keys(variables).length > 0) {
        setSelectedVariable(Object.keys(variables)[0]);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      setError(
        "Failed to process NetCDF file locally. Please check the file format."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const processFileWithBackend = async () => {
    if (!file) return;

    if (!file.name.endsWith(".nc")) {
      setError("Please upload a valid NetCDF file (.nc extension)");
      return;
    }

    setIsLoadingBackend(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "https://django-netcdf-visualizer.onrender.com/api/upload/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setBackendVisualizations(data.images);
    } catch (err) {
      console.error("Backend upload failed:", err);
      setError(
        "Failed to process file with backend. Please try again or use local processing."
      );
    } finally {
      setIsLoadingBackend(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    // Process both locally and with backend
    await Promise.all([processFileLocally(), processFileWithBackend()]);
  };

  const downsampleData = (data: any[], maxPoints = 10000) => {
    if (data.length <= maxPoints) return data;
    const step = Math.ceil(data.length / maxPoints);
    const downsampled = [];
    for (let i = 0; i < data.length; i += step) {
      downsampled.push(data[i]);
    }
    return downsampled;
  };

  const extractSpatialCoordinates = (): SpatialCoordinates => {
    if (!ncData) return { lat: [], lon: [], hasValidCoords: false };

    const latNames = ["lat", "latitude", "LAT", "LATITUDE", "y", "Y", "lats"];
    const lonNames = ["lon", "longitude", "LON", "LONGITUDE", "x", "X", "lons"];

    let latVar = null;
    let lonVar = null;

    for (const name of latNames) {
      if (ncData.variables[name]) {
        latVar = ncData.variables[name];
        break;
      }
    }

    for (const name of lonNames) {
      if (ncData.variables[name]) {
        lonVar = ncData.variables[name];
        break;
      }
    }

    if (!latVar || !lonVar) {
      return { lat: [], lon: [], hasValidCoords: false };
    }

    let lat = Array.isArray(latVar.data) ? latVar.data : [latVar.data];
    let lon = Array.isArray(lonVar.data) ? lonVar.data : [lonVar.data];

    lat = lat
      .map((val) => (typeof val === "number" ? val : parseFloat(val)))
      .filter((val) => !isNaN(val));
    lon = lon
      .map((val) => (typeof val === "number" ? val : parseFloat(val)))
      .filter((val) => !isNaN(val));

    lon = lon.map((val) => (val > 180 ? val - 360 : val));

    const validLat = lat.every((val) => val >= -90 && val <= 90);
    const validLon = lon.every((val) => val >= -180 && val <= 180);

    return {
      lat,
      lon,
      hasValidCoords: validLat && validLon && lat.length > 0 && lon.length > 0,
    };
  };

  const hasSpatialDimensions = (): boolean => {
    if (!selectedVariable || !ncData) return false;

    const variable = ncData.variables[selectedVariable];
    const dims = variable.dimensions;

    const hasLatDim = dims.some((dim) =>
      ["lat", "latitude", "LAT", "LATITUDE", "y", "Y", "lats"].includes(dim)
    );
    const hasLonDim = dims.some((dim) =>
      ["lon", "longitude", "LON", "LONGITUDE", "x", "X", "lons"].includes(dim)
    );

    const coords = extractSpatialCoordinates();
    return (hasLatDim && hasLonDim) || coords.hasValidCoords;
  };

  const preparePlotData = (): Data[] | null => {
    if (!selectedVariable || !ncData) return null;

    const variable = ncData.variables[selectedVariable];
    const data = variable.data;

    switch (plotType) {
      case "line":
        return [
          {
            type: "scatter",
            mode: "lines+markers",
            x: Array.from({ length: data.length }, (_, i) => i),
            y: data,
            name: selectedVariable,
            line: { color: "#3b82f6", width: 2 },
            marker: { size: 4 },
          } as PlotData,
        ];

      case "scatter":
        return [
          {
            type: "scatter",
            mode: "markers",
            x: Array.from({ length: data.length }, (_, i) => i),
            y: data,
            name: selectedVariable,
            marker: { color: "#3b82f6", size: 6, opacity: 0.7 },
          } as PlotData,
        ];

      case "histogram":
        return [
          {
            type: "histogram",
            x: data,
            name: selectedVariable,
            marker: { color: "#3b82f6", opacity: 0.8 },
            nbinsx: 30,
          } as PlotData,
        ];

      case "heatmap":
        const reshaped = reshapeTo2D(data, variable.dimensions);
        return [
          {
            type: "heatmap",
            z: reshaped,
            name: selectedVariable,
            colorscale: "Viridis",
            showscale: true,
          } as PlotData,
        ];

      case "contour":
        const contourData = reshapeTo2D(data, variable.dimensions);
        return [
          {
            type: "contour",
            z: contourData,
            name: selectedVariable,
            colorscale: "Viridis",
            showscale: true,
            contours: {
              showlabels: true,
              labelfont: { size: 12, color: "white" },
            },
          } as PlotData,
        ];

      case "surface":
        const surfaceData = reshapeTo2D(data, variable.dimensions);
        return [
          {
            type: "surface",
            z: surfaceData,
            name: selectedVariable,
            colorscale: "Viridis",
            showscale: true,
          } as PlotData,
        ];

      case "map":
        return prepareMapData();

      default:
        return null;
    }
  };

  const prepareMapData = (): Data[] | null => {
    if (!selectedVariable || !ncData) return null;

    const coords = extractSpatialCoordinates();
    if (!coords.hasValidCoords) return null;

    const variable = ncData.variables[selectedVariable];
    const data = variable.data;

    const minLength = Math.min(
      coords.lat.length,
      coords.lon.length,
      data.length
    );
    if (minLength === 0) return null;

    return [
      {
        type: "scattermapbox",
        lat: coords.lat.slice(0, minLength),
        lon: coords.lon.slice(0, minLength),
        mode: "markers",
        marker: {
          size: 8,
          color: data.slice(0, minLength),
          colorscale: "RdYlBu_r",
          showscale: true,
          colorbar: {
            title: { text: selectedVariable, side: "right" },
            thickness: 15,
            len: 0.7,
          },
          opacity: 0.8,
        },
        text: data
          .slice(0, minLength)
          .map(
            (val, i) =>
              `${selectedVariable}: ${val.toFixed(2)}<br>Lat: ${coords.lat[i].toFixed(3)}<br>Lon: ${coords.lon[i].toFixed(3)}`
          ),
        hovertemplate: "%{text}<extra></extra>",
        name: selectedVariable,
      } as PlotData,
    ];
  };

  const reshapeTo2D = (data: number[], dims: string[]) => {
    if (!ncData?.metadata.dimensions) return [data];

    const dimSizes = dims.map(
      (dim) => ncData.metadata.dimensions[dim] || Math.sqrt(data.length)
    );

    if (dimSizes.length >= 2) {
      const rows = Math.floor(dimSizes[0]);
      const cols = Math.floor(dimSizes[1]);
      const result = [];
      for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
          const index = i * cols + j;
          row.push(data[index] || 0);
        }
        result.push(row);
      }
      return result;
    }

    return [data];
  };

  const getPlotLayout = (): Partial<Layout> => {
    const baseLayout: Partial<Layout> = {
      title: {
        text: selectedVariable,
        font: { size: 18, family: "Inter, sans-serif" },
      },
      autosize: true,
      margin: { l: 60, r: 40, b: 60, t: 80, pad: 4 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: { family: "Inter, sans-serif" },
    };

    switch (plotType) {
      case "map":
        const coords = extractSpatialCoordinates();
        if (coords.hasValidCoords) {
          const centerLat =
            coords.lat.reduce((a, b) => a + b, 0) / coords.lat.length;
          const centerLon =
            coords.lon.reduce((a, b) => a + b, 0) / coords.lon.length;

          const latRange = Math.max(...coords.lat) - Math.min(...coords.lat);
          const lonRange = Math.max(...coords.lon) - Math.min(...coords.lon);
          const maxRange = Math.max(latRange, lonRange);

          let zoom = 2;
          if (maxRange < 1) zoom = 8;
          else if (maxRange < 5) zoom = 6;
          else if (maxRange < 20) zoom = 4;
          else if (maxRange < 50) zoom = 3;

          return {
            ...baseLayout,
            mapbox: {
              style: "open-street-map",
              center: { lat: centerLat, lon: centerLon },
              zoom: zoom,
            },
            margin: { l: 0, r: 0, b: 0, t: 40, pad: 4 },
            height: 500,
          };
        }
        return baseLayout;

      case "surface":
        return {
          ...baseLayout,
          scene: {
            xaxis: { title: { text: "X" } },
            yaxis: { title: { text: "Y" } },
            zaxis: { title: { text: selectedVariable } },
            camera: {
              eye: { x: 1.2, y: 1.2, z: 0.6 },
            },
          },
        };

      default:
        return {
          ...baseLayout,
          xaxis: { title: { text: "Index" }, gridcolor: "#f0f0f0" },
          yaxis: { title: { text: selectedVariable }, gridcolor: "#f0f0f0" },
        };
    }
  };

  const exportToCSV = () => {
    if (!selectedVariable || !ncData) return;

    const variable = ncData.variables[selectedVariable];
    const headers = "index,value";
    const rows = variable.data.map((value, index) => `${index},${value}`);
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${selectedVariable}.csv`);
  };

  const exportToJSON = () => {
    if (!selectedVariable || !ncData) return;

    const variable = ncData.variables[selectedVariable];
    const exportData = {
      variable: selectedVariable,
      dimensions: variable.dimensions,
      attributes: variable.attributes,
      data: variable.data,
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], {
      type: "application/json;charset=utf-8;",
    });
    saveAs(blob, `${selectedVariable}.json`);
  };

  const renderVisualization = () => {
    if (!selectedVariable || !ncData) return null;

    const plotData = preparePlotData();
    if (!plotData) {
      return (
        <div className="flex items-center justify-center h-96 text-gray-500 bg-gray-50 rounded-lg">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Unable to generate visualization for this data.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-96">
        <PlotlyWrapper
          data={plotData}
          layout={getPlotLayout()}
          style={{ width: "100%", height: "100%" }}
          config={{
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ["pan2d", "lasso2d"],
            responsive: true,
          }}
        />
      </div>
    );
  };

  const plotTypes = [
    {
      type: "line",
      icon: LineChart,
      label: "Line Chart",
      description: "Time series and trends",
    },
    {
      type: "scatter",
      icon: ScatterChart,
      label: "Scatter Plot",
      description: "Data distribution",
    },
    {
      type: "histogram",
      icon: BarChart3,
      label: "Histogram",
      description: "Value frequency",
    },
    {
      type: "heatmap",
      icon: Map,
      label: "Heatmap",
      description: "2D data intensity",
    },
    {
      type: "contour",
      icon: BoxSelect,
      label: "Contour",
      description: "Elevation lines",
    },
    {
      type: "surface",
      icon: Box,
      label: "3D Surface",
      description: "3D visualization",
    },
    // {
    //   type: "map",
    //   icon: Globe,
    //   label: "Geographic Map",
    //   description: "Spatial mapping",
    // },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    NetCDF Visualizer
                  </h1>
                  <p className="text-xl text-blue-100">
                    Advanced scientific data visualization and analysis platform
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Upload className="h-5 w-5 text-blue-600" />
              </div>
              Upload NetCDF File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Label
                  htmlFor="file-upload"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Select NetCDF File (.nc)
                </Label>
                <div className="relative">
                  <Input
                    id="file-upload"
                    type="file"
                    ref={fileInputRef}
                    accept=".nc"
                    onChange={handleFileChange}
                    className="h-12 text-sm border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors"
                  />
                  {file && (
                    <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {file.name}
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Error</span>
                  </div>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={!file || isProcessing || isLoadingBackend}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isProcessing || isLoadingBackend ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Analyze & Visualize
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Loading State */}
        {(isProcessing || isLoadingBackend) && (
          <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center">
                <div className="relative mb-6">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Database className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Processing NetCDF File
                </h3>
                <p className="text-gray-600 mb-4 text-center max-w-md">
                  Analyzing your data and generating visualizations. This may
                  take a few moments.
                </p>
                {/* <div className="flex gap-6 text-sm">
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-full ${isProcessing ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}
                  >
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent"></div>
                    ) : (
                      <div className="h-3 w-3 bg-green-600 rounded-full"></div>
                    )}
                    Local Processing
                  </div>
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-full ${isLoadingBackend ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}
                  >
                    {isLoadingBackend ? (
                      <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent"></div>
                    ) : (
                      <div className="h-3 w-3 bg-green-600 rounded-full"></div>
                    )}
                    Backend Processing
                  </div>
                </div> */}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {(ncData || backendVisualizations) && (
          <div className="space-y-8">
            <Tabs
              defaultValue="interactive"
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg rounded-xl p-1">
                <TabsTrigger
                  value="interactive"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg transition-all"
                >
                  <Activity className="h-4 w-4" />
                  Interactive Visualizations
                </TabsTrigger>
                <TabsTrigger
                  value="backend"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg transition-all"
                >
                  <Eye className="h-4 w-4" />
                  Spatial Distribution Maps
                </TabsTrigger>
              </TabsList>
              <div className="h-7 text-lg ">Interactive Visualizations</div>

              {/* Interactive Visualizations Tab */}
              <TabsContent value="interactive">
                {ncData ? (
                  <div className="space-y-6">
                    {/* Plot Type Selector */}
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-xl">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Activity className="h-5 w-5 text-purple-600" />
                          </div>
                          Visualization Types
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                          {plotTypes.map(
                            ({ type, icon: Icon, label, description }) => (
                              <button
                                key={type}
                                onClick={() => setPlotType(type)}
                                disabled={
                                  type === "map" && !hasSpatialDimensions()
                                }
                                className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                                  plotType === type
                                    ? "border-blue-500 bg-blue-50 shadow-lg"
                                    : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                                } ${type === "map" && !hasSpatialDimensions() ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                              >
                                <div className="flex flex-col items-center text-center space-y-2">
                                  <div
                                    className={`p-3 rounded-lg transition-colors ${
                                      plotType === type
                                        ? "bg-blue-100"
                                        : "bg-gray-100 group-hover:bg-blue-50"
                                    }`}
                                  >
                                    <Icon
                                      className={`h-6 w-6 ${
                                        plotType === type
                                          ? "text-blue-600"
                                          : "text-gray-600 group-hover:text-blue-500"
                                      }`}
                                    />
                                  </div>
                                  <div>
                                    <div
                                      className={`font-medium text-sm ${
                                        plotType === type
                                          ? "text-blue-900"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {label}
                                    </div>
                                    <div
                                      className={`text-xs mt-1 ${
                                        plotType === type
                                          ? "text-blue-600"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {description}
                                    </div>
                                  </div>
                                </div>
                                {plotType === type && (
                                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full"></div>
                                )}
                              </button>
                            )
                          )}
                        </div>
                        {plotType === "map" && !hasSpatialDimensions() && (
                          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-center gap-2 text-amber-800">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                Geographic mapping requires spatial coordinates
                                (lat/lon)
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Interactive Visualization Tabs */}
                    <Tabs defaultValue="plot" className="space-y-6">
                      <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg rounded-xl p-1">
                        <TabsTrigger
                          value="plot"
                          className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg transition-all"
                        >
                          <Activity className="h-4 w-4" />
                          Visualization
                        </TabsTrigger>
                        <TabsTrigger
                          value="export"
                          className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg transition-all"
                        >
                          <Download className="h-4 w-4" />
                          Export Data
                        </TabsTrigger>
                        <TabsTrigger
                          value="metadata"
                          className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg transition-all"
                        >
                          <Database className="h-4 w-4" />
                          Metadata
                        </TabsTrigger>
                      </TabsList>

                      {/* Plot Tab */}
                      <TabsContent value="plot">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                          {/* Variables Panel */}
                          <div className="lg:col-span-1">
                            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                              <CardHeader className="pb-4">
                                <CardTitle className="text-lg">
                                  Variables
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                  {Object.keys(ncData.variables).map(
                                    (varName) => (
                                      <button
                                        key={varName}
                                        onClick={() =>
                                          setSelectedVariable(varName)
                                        }
                                        className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                                          selectedVariable === varName
                                            ? "border-blue-500 bg-blue-50 text-blue-900 shadow-md"
                                            : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                                        }`}
                                      >
                                        <div className="font-medium">
                                          {varName}
                                        </div>
                                      </button>
                                    )
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Visualization Panel */}
                          <div className="lg:col-span-3">
                            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                              <CardHeader className="pb-4">
                                <CardTitle className="text-lg">
                                  {selectedVariable
                                    ? `${selectedVariable} - ${plotTypes.find((p) => p.type === plotType)?.label}`
                                    : "Select a variable"}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {selectedVariable ? (
                                  renderVisualization()
                                ) : (
                                  <div className="flex items-center justify-center h-96 text-gray-500 bg-gray-50 rounded-lg">
                                    <div className="text-center">
                                      <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                      <p className="text-lg font-medium">
                                        Select a variable to begin visualization
                                      </p>
                                      <p className="text-sm text-gray-400 mt-1">
                                        Choose from the variables panel on the
                                        left
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Export Tab */}
                      <TabsContent value="export">
                        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3 text-lg">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <Download className="h-5 w-5 text-green-600" />
                              </div>
                              Export Data
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <Button
                                onClick={exportToCSV}
                                disabled={!selectedVariable}
                                className="flex items-center gap-2 h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all"
                              >
                                <FileText className="h-4 w-4" />
                                Export to CSV
                              </Button>
                              <Button
                                onClick={exportToJSON}
                                disabled={!selectedVariable}
                                className="flex items-center gap-2 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all"
                              >
                                <FileText className="h-4 w-4" />
                                Export to JSON
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Metadata Tab */}
                      <TabsContent value="metadata">
                        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg">
                              File Metadata
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div>
                              <h4 className="font-semibold mb-3 text-gray-800">
                                Dimensions
                              </h4>
                              <div className="bg-gray-50 p-4 rounded-lg border">
                                <pre className="text-sm overflow-x-auto text-gray-700">
                                  {JSON.stringify(
                                    ncData.metadata.dimensions,
                                    null,
                                    2
                                  )}
                                </pre>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-3 text-gray-800">
                                Global Attributes
                              </h4>
                              <div className="bg-gray-50 p-4 rounded-lg border max-h-64 overflow-y-auto">
                                <pre className="text-sm text-gray-700">
                                  {JSON.stringify(
                                    ncData.metadata.globalAttributes,
                                    null,
                                    2
                                  )}
                                </pre>
                              </div>
                            </div>

                            {selectedVariable && (
                              <div>
                                <h4 className="font-semibold mb-3 text-gray-800">
                                  Variable Attributes: {selectedVariable}
                                </h4>
                                <div className="bg-gray-50 p-4 rounded-lg border max-h-64 overflow-y-auto">
                                  <pre className="text-sm text-gray-700">
                                    {JSON.stringify(
                                      ncData.variables[selectedVariable]
                                        .attributes,
                                      null,
                                      2
                                    )}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="py-12">
                      <div className="text-center text-gray-500">
                        <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">
                          No interactive data available
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Upload a NetCDF file to enable interactive
                          visualizations
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Backend Visualizations Tab */}
              <TabsContent value="backend">
                {backendVisualizations ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(backendVisualizations).map(([key, url]) => (
                      <Card
                        key={key}
                        className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden"
                      >
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg capitalize">
                            {key.replace(/_/g, " ")}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="bg-gray-50 overflow-hidden">
                            <img
                              src={`https://django-netcdf-visualizer.onrender.com${url}`}
                              alt={`${key} visualization`}
                              className="w-full h-auto transition-transform hover:scale-105"
                              loading="lazy"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="py-12">
                      <div className="text-center text-gray-500">
                        <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">
                          No spatial distribution maps available
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Upload a NetCDF file to generate visualizations
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* No Data State */}
        {!ncData &&
          !backendVisualizations &&
          !isProcessing &&
          !isLoadingBackend && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="py-16">
                <div className="text-center text-gray-500">
                  <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <Upload className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2 text-gray-800">
                    Ready to Analyze Your Data
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Upload a NetCDF file to start visualizing your scientific
                    data with interactive charts, spatial maps, and
                    comprehensive analysis tools.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}

export default App;
