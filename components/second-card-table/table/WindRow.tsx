"use client";

import type { WeatherObservation } from "@/types/weather-observation";

interface WindRowProps {
  observation?: WeatherObservation;
}

const windCell = (value?: string | null) =>
  `border border-slate-300 p-1 ${
    value ? "text-amber-700 font-medium" : ""
  }`;

const WindRow = ({ observation }: WindRowProps) => (
  <>
    <td className={windCell(observation?.windFirstAnemometer)}>
      {observation?.windFirstAnemometer || "--"}
    </td>
    <td className={windCell(observation?.windSecondAnemometer)}>
      {observation?.windSecondAnemometer || "--"}
    </td>
    <td className={windCell(observation?.windSpeed)}>
      {observation?.windSpeed || "--"}
    </td>
    <td className={windCell(observation?.windDirection)}>
      {observation?.windDirection || "--"}
    </td>
  </>
);

export default WindRow;
