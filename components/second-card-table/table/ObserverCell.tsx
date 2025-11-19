"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { WeatherObservation } from "@/types/weather-observation";

interface ObserverCellProps {
  observation?: WeatherObservation;
  canEdit: boolean;
  onEdit: () => void;
}

const ObserverCell = ({ observation, canEdit, onEdit }: ObserverCellProps) => (
  <>
    <td className="border border-slate-300 p-1">
      <Badge variant="outline" className="bg-gray-100">
        {observation?.observerInitial || "--"}
      </Badge>
    </td>
    <td className="border border-slate-300 p-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 w-8 p-0 ${
                !canEdit ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={onEdit}
              disabled={!canEdit}
              aria-label="Edit weather observation"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {canEdit ? "Edit this record" : "You do not have permission to edit"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </td>
  </>
);

export default ObserverCell;
