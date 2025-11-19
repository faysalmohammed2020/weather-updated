import { differenceInDays, format } from "date-fns";

export interface DateRange {
  startDate: string;
  endDate: string;
}

export const getPreviousRange = (startDate: string, endDate: string): DateRange => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysInRange = differenceInDays(end, start);

  const newStart = new Date(start);
  newStart.setDate(start.getDate() - (daysInRange + 1));

  const newEnd = new Date(start);
  newEnd.setDate(start.getDate() - 1);

  return {
    startDate: format(newStart, "yyyy-MM-dd"),
    endDate: format(newEnd, "yyyy-MM-dd"),
  };
};

export const getNextRange = (
  startDate: string,
  endDate: string
): DateRange | null => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysInRange = differenceInDays(end, start);

  const newStart = new Date(start);
  newStart.setDate(start.getDate() + (daysInRange + 1));

  const newEnd = new Date(newStart);
  newEnd.setDate(newStart.getDate() + daysInRange);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (newEnd > today) {
    if (end >= today) {
      return null;
    }
    const adjustedEnd = new Date(today);
    const adjustedStart = new Date(adjustedEnd);
    adjustedStart.setDate(adjustedEnd.getDate() - daysInRange);

    return {
      startDate: format(adjustedStart, "yyyy-MM-dd"),
      endDate: format(adjustedEnd, "yyyy-MM-dd"),
    };
  }

  return {
    startDate: format(newStart, "yyyy-MM-dd"),
    endDate: format(newEnd, "yyyy-MM-dd"),
  };
};

