"use client";

import { Badge } from "@/components/ui/badge";
import { getCloudColor } from "@/lib/utils/getCloudColor";
import type { WeatherObservation } from "@/types/weather-observation";

interface CloudRowProps {
  observation?: WeatherObservation;
}

const cellClass = (
  value?: string | null,
  accent = "text-blue-700"
) => `border border-slate-300 p-1 ${value ? `${accent} font-medium` : ""}`;

const significantClass = (value?: string | null) =>
  cellClass(value, "text-indigo-700");

const CloudRow = ({ observation }: CloudRowProps) => {
  const totalCloudAmount = observation?.totalCloudAmount || "--";
  const cloudClass = getCloudColor(totalCloudAmount);

  return (
    <>
      {/* Low Cloud */}
      <td className={cellClass(observation?.lowCloudForm)}>
        {observation?.lowCloudForm || "--"}
      </td>
      <td className={cellClass(observation?.lowCloudAmount)}>
        {observation?.lowCloudAmount || "--"}
      </td>
      <td className={cellClass(observation?.lowCloudDirection)}>
        {observation?.lowCloudDirection || "--"}
      </td>
      <td className={cellClass(observation?.lowCloudHeight)}>
        {observation?.lowCloudHeight || "--"}
      </td>

      {/* Medium Cloud */}
      <td className={cellClass(observation?.mediumCloudForm)}>
        {observation?.mediumCloudForm || "--"}
      </td>
      <td className={cellClass(observation?.mediumCloudAmount)}>
        {observation?.mediumCloudAmount || "--"}
      </td>
      <td className={cellClass(observation?.mediumCloudDirection)}>
        {observation?.mediumCloudDirection || "--"}
      </td>
      <td className={cellClass(observation?.mediumCloudHeight)}>
        {observation?.mediumCloudHeight || "--"}
      </td>

      {/* High Cloud */}
      <td className={cellClass(observation?.highCloudForm)}>
        {observation?.highCloudForm || "--"}
      </td>
      <td className={cellClass(observation?.highCloudAmount)}>
        {observation?.highCloudAmount || "--"}
      </td>
      <td className={cellClass(observation?.highCloudDirection)}>
        {observation?.highCloudDirection || "--"}
      </td>

      {/* Total Cloud */}
      <td className="border border-slate-300 p-1">
        <Badge variant="outline" className={`${cloudClass} text-white`}>
          {totalCloudAmount}
        </Badge>
      </td>

      {/* Significant Cloud Layers */}
      {[
        ["layer1Form", "layer1Amount", "layer1Height"],
        ["layer2Form", "layer2Amount", "layer2Height"],
        ["layer3Form", "layer3Amount", "layer3Height"],
        ["layer4Form", "layer4Amount", "layer4Height"],
      ].map((layer, index) =>
        layer.map((field) => (
          <td
            key={`${field}-${index}`}
            className={significantClass(observation?.[field] as string | null)}
          >
            {Array.isArray(observation?.[field]) 
              ? JSON.stringify(observation?.[field]) 
              : observation?.[field] || "--"}
          </td>
        ))
      )}
    </>
  );
};

export default CloudRow;
