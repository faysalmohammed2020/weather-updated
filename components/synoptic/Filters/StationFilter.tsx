import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Station } from "@/lib/types/station";
import { Filter } from "lucide-react";

interface StationFilterProps {
  value: string;
  stations: Station[];
  onChange: (value: string) => void;
}

export const StationFilter = ({
  value,
  stations,
  onChange,
}: StationFilterProps) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
    <div className="flex items-center gap-2">
      <Filter size={16} className="text-purple-500 shrink-0" />
      <Label
        htmlFor="stationFilter"
        className="whitespace-nowrap font-medium text-slate-700 text-sm sm:text-base"
      >
        Station:
      </Label>
    </div>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-[180px] md:w-[200px] border-slate-300 focus:ring-purple-500 text-sm sm:text-base">
        <SelectValue placeholder="All Stations" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Stations</SelectItem>
        {stations.map((station) => (
          <SelectItem key={station.id} value={station.id}>
            {station.name} ({station.stationId})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
