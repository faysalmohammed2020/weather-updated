"use client";

import moment from "moment";
import type { WeatherObservation } from "@/types/weather-observation";

interface RainRowProps {
  observation?: WeatherObservation;
}

const rainCell = (value?: string | null) =>
  `border border-slate-300 p-1 ${
    value ? "text-emerald-700 font-medium" : ""
  }`;

const formatRainTime = (value?: string | null) => {
  if (!value) return "--";
  try {
    return moment.utc(value).format("MM/DD HH:mm");
  } catch {
    return "--";
  }
};

const RainRow = ({ observation }: RainRowProps) => (
  <>
    <td className={rainCell(observation?.rainfallTimeStart)}>
      {formatRainTime(observation?.rainfallTimeStart)}
    </td>
    <td className={rainCell(observation?.rainfallTimeEnd)}>
      {formatRainTime(observation?.rainfallTimeEnd)}
    </td>
    <td className={rainCell(observation?.rainfallSincePrevious)}>
      {observation?.rainfallSincePrevious || "--"}
    </td>
    <td className={rainCell(observation?.rainfallDuringPrevious)}>
      {observation?.rainfallDuringPrevious || "--"}
    </td>
    <td className={rainCell(observation?.rainfallLast24Hours)}>
      {observation?.rainfallLast24Hours || "--"}
    </td>
  </>
);

export default RainRow;
