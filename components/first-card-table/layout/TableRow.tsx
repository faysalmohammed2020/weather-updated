"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatUtcDate,
  getWeatherStatusColor,
  utcToHour,
} from "@/lib/utils/table-utils";
import type {
  MeteorologicalEntry,
  ObservingTimeEntry,
} from "@/types/meteorological";
import { memo } from "react";

interface TableRowProps {
  record: MeteorologicalEntry;
  observingTime: ObservingTimeEntry;
  rowIndex: number;
  onEdit: (
    record: MeteorologicalEntry,
    observingTime: ObservingTimeEntry
  ) => void;
  canEdit: boolean;
}

const TableRow = ({
  record,
  observingTime,
  rowIndex,
  onEdit,
  canEdit,
}: TableRowProps) => {
  const humidityClass = getWeatherStatusColor(record.relativeHumidity);
  
  const stationLabel = `${observingTime.station?.name ?? "--"} ${
    observingTime.station?.stationId ?? ""
  }`.trim();
  const visibilityValue = record.horizontalVisibility

  return (
    <tr
      className={`text-center font-mono hover:bg-slate-50 transition-colors ${
        rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50"
      }`}
    >
      <td className="border border-slate-300 p-1 font-medium text-indigo-700">
        {utcToHour(observingTime.utcTime.toString())}
      </td>
      <td className="border border-slate-300 p-1">
        {record.subIndicator || "--"}
      </td>
      <td className="border border-slate-300 p-1 font-medium text-indigo-700 whitespace-nowrap">
        {formatUtcDate(observingTime.utcTime)}
      </td>
      <td className="border border-slate-300 p-1">
        <Badge variant="outline" className="font-mono">
          {stationLabel}
        </Badge>
      </td>
      <td className="border border-slate-300 p-1">
        {record.alteredThermometer || "--"}
      </td>
      <td className="border border-slate-300 p-1 font-medium text-purple-700">
        {record.barAsRead || "--"}
      </td>
      <td className="border border-slate-300 p-1">
        {record.correctedForIndex || "--"}
      </td>
      <td className="border border-slate-300 p-1">
        {record.heightDifference || "--"}
      </td>
      <td className="border border-slate-300 p-1 font-medium text-purple-700">
        {record.stationLevelPressure || "--"}
      </td>
      <td className="border border-slate-300 p-1">
        {record.seaLevelReduction || "--"}
      </td>
      <td className="border border-slate-300 p-1 font-medium text-purple-700">
        {record.correctedSeaLevelPressure || "--"}
      </td>
      <td className="border border-slate-300 p-1">
        {record.afternoonReading || "--"}
      </td>
      <td className="border border-slate-300 p-1 font-medium text-purple-700">
        {record.pressureChange24h || "--"}
      </td>
      <td className="border border-slate-300 p-1 font-medium text-cyan-700">
        {record.dryBulbAsRead || "--"}
      </td>
      <td className="border border-slate-300 p-1">{record.wetBulbAsRead || "--"}</td>
      <td className="border border-slate-300 p-1">
        {record.maxMinTempAsRead || "--"}
      </td>
      <td className="border border-slate-300 p-1 font-medium text-cyan-700">
        {record.dryBulbCorrected || "--"}
      </td>
      <td className="border border-slate-300 p-1">
        {record.wetBulbCorrected || "--"}
      </td>
      <td className="border border-slate-300 p-1">
        {record.maxMinTempCorrected || "--"}
      </td>
      <td className="border border-slate-300 p-1 font-medium text-teal-700">
        {record.Td || "--"}
      </td>
      <td className="border border-slate-300 p-1">
        <Badge variant="outline" className={`${humidityClass} text-white`}>
          {record.relativeHumidity || "--"}
        </Badge>
      </td>
      <td className="border border-slate-300 p-1 font-medium text-amber-700">
        {record.squallForce || "--"}
      </td>
      <td className="border border-slate-300 p-1">
        {record.squallDirection || "--"}
      </td>
      <td className="border border-slate-300 p-1">
        {record.squallTime || "--"}
      </td>
      <td className="border border-slate-300 p-1 font-medium text-blue-700">
        {visibilityValue}
      </td>
      <td className="border border-slate-300 p-1">
        {record.miscMeteors || "--"}
      </td>
      <td className="border border-slate-300 p-1">
        {record.pastWeatherW1 || "--"}
      </td>
      <td className="border border-slate-300 p-1">
        {record.pastWeatherW2 || "--"}
      </td>
      <td className="border border-slate-300 p-1 font-medium text-emerald-700">
        {record.presentWeatherWW || "--"}
      </td>
      <td className="border border-slate-300 p-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => canEdit && onEdit(record, observingTime)}
                disabled={!canEdit}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {canEdit
                ? "Edit this record"
                : "You don't have permission to edit this record"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </td>
    </tr>
  );
};

export default memo(TableRow);

