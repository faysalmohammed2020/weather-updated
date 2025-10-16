"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DebugPanelProps {
  ncData: any;
  selectedVariable: string;
}

export function DebugPanel({ ncData, selectedVariable }: DebugPanelProps) {
  if (!ncData || !selectedVariable) return null;

  const variable = ncData.variables[selectedVariable];
  const dims = variable.dimensions;

  // Check for coordinate variables
  const coordVars = Object.keys(ncData.variables).filter((name) =>
    [
      "lat",
      "latitude",
      "LAT",
      "LATITUDE",
      "lon",
      "longitude",
      "LON",
      "LONGITUDE",
      "x",
      "X",
      "y",
      "Y",
    ].includes(name)
  );

  return (
    <Card className="backdrop-blur-sm bg-white/10 border border-white/20 mt-4">
      <CardHeader>
        <CardTitle className="text-black text-sm">Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <span className="text-black/80 text-sm font-medium">Variable: </span>
          <Badge variant="outline">{selectedVariable}</Badge>
        </div>
        <div>
          <span className="text-black/80 text-sm font-medium">
            Dimensions:{" "}
          </span>
          {dims.map((dim) => (
            <Badge key={dim} variant="secondary" className="mr-1">
              {dim} ({ncData.metadata.dimensions[dim]})
            </Badge>
          ))}
        </div>
        <div>
          <span className="text-black/80 text-sm font-medium">
            Data Length:{" "}
          </span>
          <Badge variant="outline">{variable.data.length}</Badge>
        </div>
        <div>
          <span className="text-black/80 text-sm font-medium">
            Available Coordinates:{" "}
          </span>
          {coordVars.length > 0 ? (
            coordVars.map((coord) => (
              <Badge key={coord} variant="default" className="mr-1">
                {coord} ({ncData.variables[coord].data.length})
              </Badge>
            ))
          ) : (
            <Badge variant="destructive">None found</Badge>
          )}
        </div>
        <div>
          <span className="text-black/80 text-sm font-medium">
            Data Range:{" "}
          </span>
          <Badge variant="outline">
            {Math.min(...variable.data).toFixed(2)} to{" "}
            {Math.max(...variable.data).toFixed(2)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
