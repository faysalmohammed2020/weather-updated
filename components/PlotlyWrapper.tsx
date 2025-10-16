import React, { lazy, Suspense } from "react";
import type { Data, Layout } from "plotly.js";

const Plot = lazy(() => import("react-plotly.js"));

interface PlotlyWrapperProps {
  data: Data[];
  layout: Partial<Layout>;
  style?: React.CSSProperties;
  config?: any;
}

export const PlotlyWrapper: React.FC<PlotlyWrapperProps> = ({
  data,
  layout,
  style,
  config,
}) => (
  <Suspense
    fallback={
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading visualization...</p>
        </div>
      </div>
    }
  >
    <Plot
      data={data}
      layout={layout}
      style={style}
      config={config}
      useResizeHandler
    />
  </Suspense>
);
