import { utcToHour as baseUtcToHour } from "@/lib/utils";

export const utcToHour = (iso?: string | null) => {
  if (!iso) return "--";
  return baseUtcToHour(iso);
};
