import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Station } from "@/lib/types/station";
import type { SynopticRecord, SynopticUser } from "@/lib/types/synoptic";
import {
  formatObservationDate,
  formatSynopticValue,
  formatTimeSlot,
  getWeatherRemarkParts,
  resolveStationName,
} from "@/lib/utils/formatter";
import { canEditRecord } from "@/lib/utils/role-utils";
import { Edit } from "lucide-react";

interface SynopticTableRowProps {
  record: SynopticRecord;
  stations: Station[];
  user?: SynopticUser;
  onEdit: (record: SynopticRecord) => void;
}

export const SynopticTableRow = ({
  record,
  stations,
  user,
  onEdit,
}: SynopticTableRowProps) => {
  const timeSlot = formatTimeSlot(record.ObservingTime?.utcTime);
  const canEdit = canEditRecord(record, user);
  const stationName = resolveStationName(record, stations);
  const { icon, text } = getWeatherRemarkParts(record.weatherRemark);

  return (
    <tr className="bg-white hover:bg-blue-50 print:hover:bg-white">
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap font-semibold text-blue-700">
        {timeSlot}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatObservationDate(record.ObservingTime?.utcTime)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {stationName}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatSynopticValue(record.C1)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatSynopticValue(record.Iliii)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatSynopticValue(record.iRiXhvv)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatSynopticValue(record.Nddff)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatSynopticValue(record.S1nTTT)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatSynopticValue(record.S2nTddTddTdd)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatSynopticValue(record.P3PPP4PPPP)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatSynopticValue(record.RRRtR6)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatSynopticValue(record.wwW1W2)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatSynopticValue(record.NhClCmCh)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatSynopticValue(record.S2nTnTnTnInInInIn)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatSynopticValue(record.D56DLDMDH)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatSynopticValue(record.CD57DaEc)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatSynopticValue(record.C2)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatSynopticValue(record.GG)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatSynopticValue(record.P24Group58_59)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatSynopticValue(record.R24Group6_7)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatSynopticValue(record.NsChshs)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatSynopticValue(record.dqqqt90)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
        {formatSynopticValue(record.fqfqfq91)}
      </td>
      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap text-left text-gray-700">
        {text ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center p-1 shadow-inner">
              {icon ? (
                <img
                  src={icon}
                  alt="Weather Symbol"
                  className="h-6 w-6 object-contain"
                />
              ) : (
                <span className="text-gray-500 text-xs">--</span>
              )}
            </div>
            <span className="text-sm font-medium text-gray-800">{text}</span>
          </div>
        ) : (
          <span className="text-gray-400 italic">--</span>
        )}
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
