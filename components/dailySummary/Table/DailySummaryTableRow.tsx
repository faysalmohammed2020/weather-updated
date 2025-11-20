import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DailySummaryRecord, DailySummaryUser } from "@/lib/types/dailySummary";
import type { Station } from "@/lib/types/station";
import { formatDailyDate, formatDailyValue, resolveDailyStationName } from "@/lib/utils/format-utils";
import { canEditRecord } from "@/lib/utils/role-utils";
import { Edit } from "lucide-react";

interface DailySummaryTableRowProps {
  record: DailySummaryRecord;
  stations: Station[];
  user?: DailySummaryUser;
  onEdit: (record: DailySummaryRecord) => void;
}

export const DailySummaryTableRow = ({
  record,
  stations,
  user,
  onEdit,
}: DailySummaryTableRowProps) => {
  const canEdit = canEditRecord(record, user);
  const stationName = resolveDailyStationName(record, stations);
  const observationDate = formatDailyDate(record.ObservingTime?.utcTime);

  return (
    <tr className="bg-white hover:bg-blue-50 print:hover:bg-white">
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap font-semibold text-blue-700">
        {observationDate}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {stationName}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatDailyValue(record.avStationPressure)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatDailyValue(record.avSeaLevelPressure)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatDailyValue(record.avDryBulbTemperature)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatDailyValue(record.avWetBulbTemperature)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatDailyValue(record.maxTemperature)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatDailyValue(record.minTemperature)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatDailyValue(record.totalPrecipitation)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatDailyValue(record.avDewPointTemperature)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatDailyValue(record.avRelativeHumidity)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatDailyValue(record.windSpeed)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatDailyValue(record.windDirectionCode)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatDailyValue(record.maxWindSpeed)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatDailyValue(record.maxWindDirection)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatDailyValue(record.avTotalCloud)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatDailyValue(record.lowestVisibility)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatDailyValue(record.totalRainDuration)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`h-8 w-8 p-0 ${
                  !canEdit ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => onEdit(record)}
                aria-label="Edit record"
                disabled={!canEdit}
              >
                <Edit size={16} />
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
