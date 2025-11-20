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

export const validateDateChange = (
  type: "start" | "end",
  value: string,
  range: DateRange
): { range: DateRange; error: string | null } => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { range, error: "Invalid date format" };
  }

  const otherDate =
    type === "start" ? new Date(range.endDate) : new Date(range.startDate);

  if (type === "start" && date > otherDate) {
    return { range, error: "Start date cannot be after end date" };
  }

  if (type === "end") {
    if (date < otherDate) {
      return { range, error: "End date cannot be before start date" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date > today) {
      return {
        range,
        error: "End date cannot be in the future",
      };
    }
  }

  return {
    range: {
      ...range,
      startDate: type === "start" ? value : range.startDate,
      endDate: type === "end" ? value : range.endDate,
    },
    error: null,
  };
};

export const todayISO = () => format(new Date(), "yyyy-MM-dd");

