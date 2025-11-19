"use client";

import { Filter } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Station } from "@/types/station";

interface StationFilterProps {
  stations: Station[];
  value: string;
  onChange: (value: string) => void;
}

const StationFilter = ({ stations, value, onChange }: StationFilterProps) => (
  <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 w-full md:w-auto">
    <div className="flex items-center gap-2">
      <Filter size={16} className="text-sky-500 flex-shrink-0" />
      <Label
        htmlFor="stationFilter"
        className="whitespace-nowrap font-medium text-slate-700 text-sm"
      >
        Station:
      </Label>
    </div>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full xs:w-[180px] sm:w-[200px] border-slate-300 focus:ring-sky-500 text-sm">
        <SelectValue placeholder="All Stations" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Stations</SelectItem>
        {stations.map((station) => (
          <SelectItem key={station.id} value={station.id}>
            <span className="block truncate">
              {station.name} ({station.stationId})
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default StationFilter;
