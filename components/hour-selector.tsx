"use client";

import { useHour } from "@/contexts/hourContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Circle, CircleCheck, Clock } from "lucide-react";
import { cn, utcToHour } from "@/lib/utils";
import { TimeInfo } from "@/lib/data-type";



const HourSelector = ({
  type,
  timeInfo,
}: {
  type: "first" | "second";
  timeInfo: TimeInfo[];
}) => {
  const {
    selectedHour,
    setSelectedHour,
    firstCardError,
    secondCardError,
    isLoading,
    clearError,
  } = useHour();

  const getHourEntry = (hour: string) => {
    return timeInfo.find((item) => utcToHour(item.utcTime.toString()) === hour);
  };

  // Function to check if a specific hour exists in timeInfo
  const hasTimeEntry = (hour: string) => {
    if(type == "second") {
      return timeInfo.some((item) => {
        const utcHour = utcToHour(item.utcTime.toString());
        return utcHour === hour && item.hasWeatherObservation;
      });
    }

    if(type == "first") {
      return timeInfo.some((item) => {
        const utcHour = utcToHour(item.utcTime.toString());
        return utcHour === hour && item.hasMeteorologicalEntry;
      });
    }
  };

  const getPendingLabels = (hour: string) => {
    const entry = getHourEntry(hour);
    if (!entry) {
      return { first: true, second: true, synoptic: true };
    }

    return {
      first: !entry.hasMeteorologicalEntry,
      second: !entry.hasWeatherObservation,
      synoptic: !entry.hasSynopticCode,
    };
  };

  const handleHourChange = (value: string) => {
    if (!value) {
      return;
    }
    clearError();
    setSelectedHour(value);
  };

  return (
    <div className="bg-white p-6 rounded-lg border ring-2 ring-blue-500 ring-offset-4 border-blue-500/20 mb-6 flex flex-col gap-4 shadow-lg w-full items-center justify-center min-h-[200px] max-w-lg">
      <div className="flex-col flex gap-4 justify-center items-center">
        <label className="flex items-center text-lg font-bold text-blue-500">
          <Clock className="size-5 mr-2" />
          <span>UTC HOUR</span>
        </label>
        <Select
          onValueChange={handleHourChange}
          disabled={isLoading}
          value={selectedHour}
        >
          <SelectTrigger
            className={cn(
              "text-lg font-medium py-6 px-8 shadow-xs shadow-blue-500 border border-blue-500",
              {
                "border-red-500": firstCardError || secondCardError,
              }
            )}
          >
            <SelectValue
              placeholder={isLoading ? "Loading..." : "Observing Time"}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="00" className="text-lg">
              {(() => {
                const pending = getPendingLabels("00");
                const showPending =
                  !pending.first && (pending.second || pending.synoptic);
                return (
                  <>
                    {hasTimeEntry("00") ? (
                      <CircleCheck
                        className={cn("size-5 stroke-1.5", {
                          "text-yellow-600": showPending && pending.synoptic,
                          "text-blue-500": !(showPending && pending.synoptic),
                        })}
                      />
                    ) : (
                      <Circle className="size-5 stroke-1.5 text-slate-200" />
                    )}
                    <span
                      className={cn({
                        "text-yellow-600": showPending && pending.synoptic,
                      })}
                    >
                      00
                    </span>
                    &nbsp;
                    {showPending ? (
                      <span className="ml-2 text-xs font-medium text-yellow-600">
                        {pending.second && "SecondCard pending"}
                        {pending.second && pending.synoptic && " • "}
                        {pending.synoptic && "Synoptic pending"}
                      </span>
                    ) : null}
                  </>
                );
              })()}
            </SelectItem>
            <SelectItem value="03" className="text-lg">
              {(() => {
                const pending = getPendingLabels("03");
                const showPending =
                  !pending.first && (pending.second || pending.synoptic);
                return (
                  <>
                    {hasTimeEntry("03") ? (
                      <CircleCheck
                        className={cn("size-5 stroke-1.5", {
                          "text-yellow-600": showPending && pending.synoptic,
                          "text-blue-500": !(showPending && pending.synoptic),
                        })}
                      />
                    ) : (
                      <Circle className="size-5 stroke-1.5 text-slate-200" />
                    )}
                    <span
                      className={cn({
                        "text-yellow-600": showPending && pending.synoptic,
                      })}
                    >
                      03
                    </span>
                    &nbsp;
                    {showPending ? (
                      <span className="ml-2 text-xs font-medium text-yellow-600">
                        {pending.second && "SecondCard pending"}
                        {pending.second && pending.synoptic && " • "}
                        {pending.synoptic && "Synoptic pending"}
                      </span>
                    ) : null}
                  </>
                );
              })()}
            </SelectItem>
            <SelectItem value="06" className="text-lg">
              {(() => {
                const pending = getPendingLabels("06");
                const showPending =
                  !pending.first && (pending.second || pending.synoptic);
                return (
                  <>
                    {hasTimeEntry("06") ? (
                      <CircleCheck
                        className={cn("size-5 stroke-1.5", {
                          "text-yellow-600": showPending && pending.synoptic,
                          "text-blue-500": !(showPending && pending.synoptic),
                        })}
                      />
                    ) : (
                      <Circle className="size-5 stroke-1.5 text-slate-200" />
                    )}
                    <span
                      className={cn({
                        "text-yellow-600": showPending && pending.synoptic,
                      })}
                    >
                      06
                    </span>
                    &nbsp;
                    {showPending ? (
                      <span className="ml-2 text-xs font-medium text-yellow-600">
                        {pending.second && "SecondCard pending"}
                        {pending.second && pending.synoptic && " • "}
                        {pending.synoptic && "Synoptic pending"}
                      </span>
                    ) : null}
                  </>
                );
              })()}
            </SelectItem>
            <SelectItem value="09" className="text-lg">
              {(() => {
                const pending = getPendingLabels("09");
                const showPending =
                  !pending.first && (pending.second || pending.synoptic);
                return (
                  <>
                    {hasTimeEntry("09") ? (
                      <CircleCheck
                        className={cn("size-5 stroke-1.5", {
                          "text-yellow-600": showPending && pending.synoptic,
                          "text-blue-500": !(showPending && pending.synoptic),
                        })}
                      />
                    ) : (
                      <Circle className="size-5 stroke-1.5 text-slate-200" />
                    )}
                    <span
                      className={cn({
                        "text-yellow-600": showPending && pending.synoptic,
                      })}
                    >
                      09
                    </span>
                    &nbsp;
                    {showPending ? (
                      <span className="ml-2 text-xs font-medium text-yellow-600">
                        {pending.second && "SecondCard pending"}
                        {pending.second && pending.synoptic && " • "}
                        {pending.synoptic && "Synoptic pending"}
                      </span>
                    ) : null}
                  </>
                );
              })()}
            </SelectItem>
            <SelectItem value="12" className="text-lg">
              {(() => {
                const pending = getPendingLabels("12");
                const showPending =
                  !pending.first && (pending.second || pending.synoptic);
                return (
                  <>
                    {hasTimeEntry("12") ? (
                      <CircleCheck
                        className={cn("size-5 stroke-1.5", {
                          "text-yellow-600": showPending && pending.synoptic,
                          "text-blue-500": !(showPending && pending.synoptic),
                        })}
                      />
                    ) : (
                      <Circle className="size-5 stroke-1.5 text-slate-200" />
                    )}
                    <span
                      className={cn({
                        "text-yellow-600": showPending && pending.synoptic,
                      })}
                    >
                      12
                    </span>
                    &nbsp;
                    {showPending ? (
                      <span className="ml-2 text-xs font-medium text-yellow-600">
                        {pending.second && "SecondCard pending"}
                        {pending.second && pending.synoptic && " • "}
                        {pending.synoptic && "Synoptic pending"}
                      </span>
                    ) : null}
                  </>
                );
              })()}
            </SelectItem>
            <SelectItem value="15" className="text-lg">
              {(() => {
                const pending = getPendingLabels("15");
                const showPending =
                  !pending.first && (pending.second || pending.synoptic);
                return (
                  <>
                    {hasTimeEntry("15") ? (
                      <CircleCheck
                        className={cn("size-5 stroke-1.5", {
                          "text-yellow-600": showPending && pending.synoptic,
                          "text-blue-500": !(showPending && pending.synoptic),
                        })}
                      />
                    ) : (
                      <Circle className="size-5 stroke-1.5 text-slate-200" />
                    )}
                    <span
                      className={cn({
                        "text-yellow-600": showPending && pending.synoptic,
                      })}
                    >
                      15
                    </span>
                    &nbsp;
                    {showPending ? (
                      <span className="ml-2 text-xs font-medium text-yellow-600">
                        {pending.second && "SecondCard pending"}
                        {pending.second && pending.synoptic && " • "}
                        {pending.synoptic && "Synoptic pending"}
                      </span>
                    ) : null}
                  </>
                );
              })()}
            </SelectItem>
            <SelectItem value="18" className="text-lg">
              {(() => {
                const pending = getPendingLabels("18");
                const showPending =
                  !pending.first && (pending.second || pending.synoptic);
                return (
                  <>
                    {hasTimeEntry("18") ? (
                      <CircleCheck
                        className={cn("size-5 stroke-1.5", {
                          "text-yellow-600": showPending && pending.synoptic,
                          "text-blue-500": !(showPending && pending.synoptic),
                        })}
                      />
                    ) : (
                      <Circle className="size-5 stroke-1.5 text-slate-200" />
                    )}
                    <span
                      className={cn({
                        "text-yellow-600": showPending && pending.synoptic,
                      })}
                    >
                      18
                    </span>
                    &nbsp;
                    {showPending ? (
                      <span className="ml-2 text-xs font-medium text-yellow-600">
                        {pending.second && "SecondCard pending"}
                        {pending.second && pending.synoptic && " • "}
                        {pending.synoptic && "Synoptic pending"}
                      </span>
                    ) : null}
                  </>
                );
              })()}
            </SelectItem>
            <SelectItem value="21" className="text-lg">
              {(() => {
                const pending = getPendingLabels("21");
                const showPending =
                  !pending.first && (pending.second || pending.synoptic);
                return (
                  <>
                    {hasTimeEntry("21") ? (
                      <CircleCheck
                        className={cn("size-5 stroke-1.5", {
                          "text-yellow-600": showPending && pending.synoptic,
                          "text-blue-500": !(showPending && pending.synoptic),
                        })}
                      />
                    ) : (
                      <Circle className="size-5 stroke-1.5 text-slate-200" />
                    )}
                    <span
                      className={cn({
                        "text-yellow-600": showPending && pending.synoptic,
                      })}
                    >
                      21
                    </span>
                    &nbsp;
                    {showPending ? (
                      <span className="ml-2 text-xs font-medium text-yellow-600">
                        {pending.second && "SecondCard pending"}
                        {pending.second && pending.synoptic && " • "}
                        {pending.synoptic && "Synoptic pending"}
                      </span>
                    ) : null}
                  </>
                );
              })()}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type === "first" && firstCardError && (
        <p className="text-red-500 font-medium text-lg">{firstCardError}</p>
      )}
      {type === "second" && secondCardError && (
        <p className="text-red-500 font-medium text-lg">{secondCardError}</p>
      )}
    </div>
  );
};

export default HourSelector;
