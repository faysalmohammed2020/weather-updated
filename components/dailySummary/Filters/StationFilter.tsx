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
  <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
    <div className="flex items-center gap-2">
      <Filter size={16} className="text-purple-500 flex-shrink-0" />
      <Label
        htmlFor="stationFilter"
        className="whitespace-nowrap font-medium text-slate-700 text-xs md:text-sm"
      >
        Station:
      </Label>
    </div>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full md:w-[200px] border-slate-300 focus:ring-purple-500 text-xs md:text-sm h-9">
        <SelectValue placeholder="All Stations" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Stations</SelectItem>
        {stations.map((station) => (
          <SelectItem key={station.id} value={station.id}>
            <span className="block truncate text-xs md:text-sm">
              {station.name} ({station.stationId})
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
