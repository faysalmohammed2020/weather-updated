export const getCloudColor = (amount?: string | null) => {
  if (!amount || amount === "--") return "bg-gray-400";

  const parsed = Number.parseInt(amount, 10);
  if (Number.isNaN(parsed)) return "bg-gray-400";

  if (parsed <= 2) return "bg-sky-500";
  if (parsed <= 4) return "bg-blue-500";
  if (parsed <= 6) return "bg-indigo-500";
  if (parsed <= 8) return "bg-purple-500";
  return "bg-slate-700";
};
