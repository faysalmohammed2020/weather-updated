const baseFormatter = (
  iso: string,
  options: Intl.DateTimeFormatOptions
): string => {
  if (!iso) return "--";
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      ...options,
    }).format(new Date(iso));
  } catch {
    return "--";
  }
};

export const formatUtcMDY = (iso: string) =>
  baseFormatter(iso, { month: "2-digit", day: "2-digit", year: "numeric" });

export const formatUtcLong = (iso: string) =>
  baseFormatter(iso, { month: "long", day: "numeric", year: "numeric" });

export const formatUtcDate = (iso: string) =>
  baseFormatter(iso, { year: "numeric", month: "2-digit", day: "2-digit" });
