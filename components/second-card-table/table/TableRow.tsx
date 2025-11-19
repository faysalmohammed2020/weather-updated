"use client";

import { Badge } from "@/components/ui/badge";
import { formatUtcMDY } from "@/lib/utils/formatUtcDate";
import { utcToHour } from "@/lib/utils/utcToHour";
import type { WeatherObservationRecord } from "@/types/weather-observation";
import { CloudSun } from "lucide-react";
import CloudRow from "./CloudRow";
import RainRow from "./RainRow";
import WindRow from "./WindRow";
import ObserverCell from "./ObserverCell";

interface TableRowProps {
  record: WeatherObservationRecord;
  rowIndex: number;
  canEdit: boolean;
  onEdit: (record: WeatherObservationRecord) => void;
}

const TableRow = ({ record, rowIndex, canEdit, onEdit }: TableRowProps) => {
  const observation = record.WeatherObservation[0];
  const rowClass = rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50";

  if (!observation) {
    return (
      <tr>
        <td colSpan={36} className="py-6 text-center text-slate-500">
          <div className="flex flex-col items-center gap-2">
            <CloudSun className="text-slate-400" />
            <p>No data found for this observing time</p>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr
      className={`text-center font-mono hover:bg-blue-50 transition-colors ${rowClass}`}
    >
      <td className="border border-slate-300 p-1 font-medium text-sky-700">
        <div className="flex flex-col font-bold px-2">
          {utcToHour(record.utcTime)}
        </div>
      </td>
      <td className="border border-slate-300 p-1 font-medium text-sky-700">
        <div className="flex flex-col font-bold px-2">
          {observation.cardIndicator || "--"}
        </div>
      </td>
      <td className="border border-slate-300 p-1 text-sm font-bold text-sky-700">
        {formatUtcMDY(record.utcTime)}
      </td>
      <td className="border border-slate-300 p-1">
        <Badge variant="outline" className="font-mono text-xs font-bold">
          {record.station
            ? `${record.station.name} ${record.station.stationId}`
            : "--"}
        </Badge>
      </td>

      <CloudRow observation={observation} />
      <RainRow observation={observation} />
      <WindRow observation={observation} />
      <ObserverCell observation={observation} canEdit={canEdit} onEdit={() => onEdit(record)} />
    </tr>
  );
};

export default TableRow;
