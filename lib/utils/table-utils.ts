import { utcToHour as baseUtcToHour } from "@/lib/utils";

export const formatUtcDate = (iso: string) =>
  new Date(iso).toISOString().slice(0, 10);

export const getWeatherStatusColor = (humidity: string) => {
  const humidityValue = Number.parseInt(humidity || "0", 10);
  if (humidityValue >= 80) return "bg-blue-500";
  if (humidityValue >= 60) return "bg-green-500";
  if (humidityValue >= 40) return "bg-yellow-500";
  if (humidityValue >= 20) return "bg-orange-500";
  return "bg-gray-500";
};

export const utcToHour = (iso: string) => baseUtcToHour(iso);

