"use client";

import moment from "moment";
import type { WeatherObservation } from "@/types/weather-observation";

interface RainRowProps {
  observation?: WeatherObservation;
}

type RainSlot = { id?: string; timeStart?: string | null; timeEnd?: string | null };

const rainCell = (hasValue?: boolean) =>
  `border border-slate-300 p-1 ${hasValue ? "text-emerald-700 font-medium" : ""}`;

const normalizeSlots = (slots: any): RainSlot[] => {
  if (!slots) return [];
  if (Array.isArray(slots)) return slots;

  // if backend sends JSON string
  if (typeof slots === "string") {
    try {
      const parsed = JSON.parse(slots);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

const getRainDateLabel = (observation?: WeatherObservation) => {
  if (!observation) return "--";

  // Prefer rainfallTimeStart/End date if available
  const candidate =
    (observation as any).rainfallTimeStart ||
    (observation as any).rainfallTimeEnd ||
    (observation as any).submittedAt;

  if (!candidate) return "--";

  // candidate may be ISO date or something parseable
  const m = moment(candidate);
  return m.isValid() ? m.format("MMMM Do YYYY") : "--";
};

const formatSingleRainDateTime = (value?: string | null) => {
  if (!value) return "--";
  const m = moment(value);
  return m.isValid() ? m.format("MMMM Do YYYY, h:mm") : "--";
};

const RainRow = ({ observation }: RainRowProps) => {
  const slots = normalizeSlots((observation as any)?.rainfallTimeSlots);
  const hasSlots = slots.length > 0;

  const dateLabel = getRainDateLabel(observation);

  return (
    <>
      {/* Start Time */}
      <td className={rainCell(hasSlots || !!(observation as any)?.rainfallTimeStart)}>
        {hasSlots ? (
          <div className="flex flex-col gap-1">
            <div className="text-xs font-semibold text-emerald-800">{dateLabel}</div>
            {slots.map((slot, i) => (
              <div key={slot.id ?? i}>
                <span className="font-semibold">Slot {i + 1}:</span>{" "}
                {slot.timeStart || "--"}
              </div>
            ))}
          </div>
        ) : (observation as any)?.rainfallTimeStart ? (
          <div className="flex flex-col">
            <div className="text-xs font-semibold text-emerald-800">{dateLabel}</div>
            <div>{formatSingleRainDateTime((observation as any).rainfallTimeStart)}</div>
          </div>
        ) : (
          "--"
        )}
      </td>

      {/* End Time */}
      <td className={rainCell(hasSlots || !!(observation as any)?.rainfallTimeEnd)}>
        {hasSlots ? (
          <div className="flex flex-col gap-1">
            <div className="text-xs font-semibold text-emerald-800">{dateLabel}</div>
            {slots.map((slot, i) => (
              <div key={slot.id ?? i}>
                <span className="font-semibold">Slot {i + 1}:</span>{" "}
                {slot.timeEnd || "--"}
              </div>
            ))}
          </div>
        ) : (observation as any)?.rainfallTimeEnd ? (
          <div className="flex flex-col">
            <div className="text-xs font-semibold text-emerald-800">{dateLabel}</div>
            <div>{formatSingleRainDateTime((observation as any).rainfallTimeEnd)}</div>
          </div>
        ) : (
          "--"
        )}
      </td>

      {/* Other Rainfall Fields */}
      <td className={rainCell(!!observation?.rainfallSincePrevious)}>
        {observation?.rainfallSincePrevious || "--"}
      </td>

      <td className={rainCell(!!observation?.rainfallDuringPrevious)}>
        {observation?.rainfallDuringPrevious || "--"}
      </td>

      <td className={rainCell(!!observation?.rainfallLast24Hours)}>
        {observation?.rainfallLast24Hours || "--"}
      </td>
    </>
  );
};

export default RainRow;
