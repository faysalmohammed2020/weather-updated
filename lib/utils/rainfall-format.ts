export const parseRainfallAmountMm = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;

  const raw = String(value).trim();
  if (!raw || raw === "--") return null;

  const lowered = raw.toLowerCase();
  if (["trace", "tr", "t"].includes(lowered)) {
    return 0;
  }

  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) return null;

  if (raw.includes(".")) {
    return numeric;
  }

  return raw.length >= 4 ? numeric / 10 : numeric;
};

export const formatCl17RainfallAmount = (value: unknown): string => {
  if (value === null || value === undefined) return "--";

  const raw = String(value).trim();
  if (!raw || raw === "--") return "--";

  const lowered = raw.toLowerCase();
  if (["trace", "tr", "t"].includes(lowered)) {
    return "TR";
  }

  const amountMm = parseRainfallAmountMm(value);
  if (amountMm === null) return raw;

  const roundedWholeMm = Math.min(999, Math.round(Math.max(0, amountMm)));
  return String(roundedWholeMm).padStart(3, "0");
};
