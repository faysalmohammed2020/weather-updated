// app/dashboard/view-and-manage/second-card-view/page.tsx

"use client";
import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  CloudSun,
  Filter,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { format, parseISO, differenceInDays, isValid } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";
import moment from "moment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { utcToHour } from "@/lib/utils";
import { Download } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Form data type without validation constraints
interface FormData {
  totalCloudAmount: string;
  lowCloudDirection: string;
  lowCloudHeight: string;
  lowCloudForm: string;
  lowCloudAmount: string;
  mediumCloudDirection: string;
  mediumCloudHeight: string;
  mediumCloudForm: string;
  mediumCloudAmount: string;
  highCloudDirection: string;
  highCloudHeight: string;
  highCloudForm: string;
  highCloudAmount: string;
  windDirection: string;
  layer1Form: string;
  layer1Amount: string;
  layer2Form: string;
  layer2Amount: string;
  layer3Form: string;
  layer3Amount: string;
  layer4Form: string;
  layer4Amount: string;
  layer1Height: string;
  layer2Height: string;
  layer3Height: string;
  layer4Height: string;
  rainfallSincePrevious: string;
  rainfallLast24Hours: string;
  windSpeed: string;
  rainfallDuringPrevious: string;
  windFirstAnemometer: string;
  windSecondAnemometer: string;
  observerInitial: string;
  rainfallTimeStart?: string;
  rainfallTimeEnd?: string;
  rainfallTimeSlots?: Array<{ id: string; timeStart: string; timeEnd: string }>;
  rainfallType?: string;
}

// Define the structure of weather observation data
interface WeatherObservation {
  id: string;
  observingTimeId: string;
  cardIndicator: string;
  tabActive: string;
  observerInitial: string | null;
  lowCloudForm: string | null;
  lowCloudHeight: string | null;
  lowCloudAmount: string | null;
  lowCloudDirection: string | null;
  mediumCloudForm: string | null;
  mediumCloudHeight: string | null;
  mediumCloudAmount: string | null;
  mediumCloudDirection: string | null;
  highCloudForm: string | null;
  highCloudHeight: string | null;
  highCloudAmount: string | null;
  highCloudDirection: string | null;
  totalCloudAmount: string | null;
  layer1Form: string | null;
  layer1Height: string | null;
  layer1Amount: string | null;
  layer2Form: string | null;
  layer2Height: string | null;
  layer2Amount: string | null;
  layer3Form: string | null;
  layer3Height: string | null;
  layer3Amount: string | null;
  layer4Form: string | null;
  layer4Height: string | null;
  layer4Amount: string | null;
  rainfallTimeStart: string | null;
  rainfallTimeEnd: string | null;
  rainfallTimeSlots: Array<{
    id: string;
    timeStart: string;
    timeEnd: string;
  }> | null;
  rainfallSincePrevious: string | null;
  rainfallDuringPrevious: string | null;
  rainfallLast24Hours: string | null;
  rainfallType: string | null;
  isIntermittentRain: boolean | null;
  windFirstAnemometer: string | null;
  windSecondAnemometer: string | null;
  windSpeed: string | null;
  windDirection: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

interface MeteorologicalEntry {
  id: string;
  observingTimeId: string;
  dataType: string;
  subIndicator: string;
  barAsRead: string;
  heightDifference: string;
  stationLevelPressure: string;
  seaLevelReduction: string;
  correctedSeaLevelPressure: string;
  dryBulbAsRead: string;
  wetBulbAsRead: string;
  maxMinTempAsRead: string;
  Td: string;
  relativeHumidity: string;
  squallConfirmed: string;
  horizontalVisibility: string;
  miscMeteors: string;
  pastWeatherW1: string;
  pastWeatherW2: string;
  presentWeatherWW: string;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

interface ObservationData {
  id: string;
  userId: string;
  stationId: string;
  utcTime: string;
  localTime: string;
  createdAt: string;
  updatedAt: string;
  station: {
    id: string;
    stationId: string;
    name: string;
    latitude: number;
    longitude: number;
  };
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  MeteorologicalEntry: MeteorologicalEntry[];
  WeatherObservation: WeatherObservation[];
}

interface SecondCardTableProps {
  refreshTrigger?: number;
}

// UTC date format helpers
const formatUtcMDY = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(iso));

const formatUtcLong = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));

// Helper function to determine if a user can edit an observation
function canEditObservation(record: ObservationData, sessionUser: any) {
  if (!sessionUser || !record.WeatherObservation?.[0]) return false;
  try {
    const observationDate = parseISO(
      record.WeatherObservation[0].createdAt || ""
    );
    if (!isValid(observationDate)) return false;

    const now = new Date();
    const daysDifference = differenceInDays(now, observationDate);
    const role = sessionUser.role;
    const userId = sessionUser.id;
    const userStationId = sessionUser.station?.id;
    const recordStationId = record.station?.id;

    if (role === "super_admin") return daysDifference <= 365;
    if (role === "station_admin")
      return daysDifference <= 30 && userStationId === recordStationId;
    if (role === "observer")
      return daysDifference <= 2 && userId === record.userId;

    return false;
  } catch (e) {
    console.warn("Error in canEditObservation:", e);
    return false;
  }
}

// Helper function to get cloud status color
function getCloudStatusColor(amount: string | null) {
  if (!amount || amount === "--") return "bg-gray-400";
  const numAmount = Number.parseInt(amount);
  if (isNaN(numAmount)) return "bg-gray-400";
  if (numAmount <= 2) return "bg-sky-500";
  if (numAmount <= 4) return "bg-blue-500";
  if (numAmount <= 6) return "bg-indigo-500";
  if (numAmount <= 8) return "bg-purple-500";
  return "bg-slate-700";
}

const SecondCardTable = forwardRef(
  ({ refreshTrigger = 0 }: SecondCardTableProps, ref) => {
    const [data, setData] = useState<ObservationData[]>([]);
    const [loading, setLoading] = useState(true);
    const [stationFilter, setStationFilter] = useState("all");
    const [stations, setStations] = useState<
      { id: string; stationId: string; name: string }[]
    >([]);
    const { data: session } = useSession();
    const user = session?.user;

    // Edit dialog state
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] =
      useState<ObservationData | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isPermissionDeniedOpen, setIsPermissionDeniedOpen] = useState(false);

    const today = format(new Date(), "yyyy-MM-dd");
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [dateError, setDateError] = useState<string | null>(null);

    // React Hook Form setup without validation
    const { register, handleSubmit, reset, setValue } = useForm<FormData>();

    // Expose getData method via ref
    useImperativeHandle(ref, () => ({
      getData: () => {
        return data
          .filter(
            (record) =>
              record.WeatherObservation && record.WeatherObservation.length > 0
          )
          .map((record) => ({
            ...record.WeatherObservation[0],
            stationId: record.stationId,
            stationName: record.station?.name || "",
            utcTime: record.utcTime,
            localTime: record.localTime,
          }));
      },
    }));

    // Fetch data function
    const fetchData = async () => {
      try {
        setLoading(true);
        // Build the URL with query parameters
        const url = new URL("/api/save-observation", window.location.origin);
        url.searchParams.append("startDate", startDate);
        url.searchParams.append("endDate", endDate);
        if (stationFilter !== "all") {
          url.searchParams.append("stationId", stationFilter);
        }

        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error("Failed to fetch observation data");
        }
        const result = await response.json();
        setData(result.data);

        // Fetch stations if not already loaded
        if (stations.length === 0) {
          const stationsResponse = await fetch("/api/stations");
          if (!stationsResponse.ok) {
            throw new Error("Failed to fetch stations");
          }
          const stationsResult = await stationsResponse.json();
          setStations(stationsResult);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch weather observation data");
      } finally {
        setLoading(false);
      }
    };

    // Fetch data on component mount and when filters or refreshTrigger changes
    useEffect(() => {
      fetchData();
    }, [startDate, endDate, stationFilter, refreshTrigger]);

    // Handle edit click
    const handleEditClick = (record: ObservationData) => {
      if (user && canEditObservation(record, user)) {
        setSelectedRecord(record);
        const weatherObs = record.WeatherObservation[0] || {};
        // Reset form and set values
        reset();
        Object.keys(weatherObs).forEach((key) => {
          if (weatherObs[key] !== null && weatherObs[key] !== undefined) {
            setValue(key as keyof FormData, weatherObs[key]);
          }
        });
        setIsEditDialogOpen(true);
      } else {
        setIsPermissionDeniedOpen(true);
      }
    };

    // Handle form submission
    const onSubmit = async (formData: FormData) => {
      if (!selectedRecord || !selectedRecord.WeatherObservation?.[0]) return;

      setIsSaving(true);
      try {
        const response = await fetch("/api/save-observation", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: selectedRecord.WeatherObservation[0].id,
            type: "weather",
            ...formData,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update record");
        }

        // Update the data in the local state
        setData((prevData) =>
          prevData.map((item) => {
            if (item.id === selectedRecord.id) {
              return {
                ...item,
                WeatherObservation: [
                  {
                    ...item.WeatherObservation[0],
                    ...formData,
                    updatedAt: new Date().toISOString(),
                  },
                ],
              };
            }
            return item;
          })
        );

        toast.success("Weather observation updated successfully");
        setIsEditDialogOpen(false);
      } catch (error) {
        console.error("Error updating record:", error);
        toast.error("Failed to update weather observation");
      } finally {
        setIsSaving(false);
      }
    };

    // Handle form cancel
    const handleCancel = () => {
      reset();
      setIsEditDialogOpen(false);
    };

    // Filter data to only show records with WeatherObservation entries
    const filteredData = data.filter(
      (record) =>
        record.WeatherObservation && record.WeatherObservation.length > 0
    );

    const goToPreviousWeek = () => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysInRange = differenceInDays(end, start);

      // Calculate the new date range
      const newStart = new Date(start);
      newStart.setDate(start.getDate() - (daysInRange + 1));
      const newEnd = new Date(start);
      newEnd.setDate(start.getDate() - 1);

      // Always update the dates when going back
      setStartDate(format(newStart, "yyyy-MM-dd"));
      setEndDate(format(newEnd, "yyyy-MM-dd"));
      setDateError(null);
    };

    const goToNextWeek = () => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysInRange = differenceInDays(end, start);

      // Calculate the new date range
      const newStart = new Date(start);
      newStart.setDate(start.getDate() + (daysInRange + 1));
      const newEnd = new Date(newStart);
      newEnd.setDate(newStart.getDate() + daysInRange);

      // Get today's date at midnight for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // If the new range would go beyond today, adjust it
      if (newEnd > today) {
        // If we're already at or beyond today, don't go further
        if (end >= today) {
          return;
        }
        // Otherwise, set the end to today and adjust the start accordingly
        const adjustedEnd = new Date(today);
        const adjustedStart = new Date(adjustedEnd);
        adjustedStart.setDate(adjustedEnd.getDate() - daysInRange);
        setStartDate(format(adjustedStart, "yyyy-MM-dd"));
        setEndDate(format(adjustedEnd, "yyyy-MM-dd"));
      } else {
        // Update to the new range if it's valid
        setStartDate(format(newStart, "yyyy-MM-dd"));
        setEndDate(format(newEnd, "yyyy-MM-dd"));
      }
      setDateError(null);
    };

    const handleDateChange = (type: "start" | "end", newDate: string) => {
      const date = new Date(newDate);
      const otherDate =
        type === "start" ? new Date(endDate) : new Date(startDate);

      if (isNaN(date.getTime())) {
        setDateError("Invalid date format");
        return;
      }

      // Reset error if dates are valid
      setDateError(null);

      if (type === "start") {
        if (date > otherDate) {
          setDateError("Start date cannot be after end date");
          return;
        }
        setStartDate(newDate);
      } else {
        if (date < otherDate) {
          setDateError("End date cannot be before start date");
          return;
        }
        setEndDate(newDate);
      }
    };

    const exportToCSV = () => {
      const filteredData = data.filter(
        (record) =>
          record.WeatherObservation && record.WeatherObservation.length > 0
      );

      if (filteredData.length === 0) {
        toast.error("No weather observation data available to export");
        return;
      }

      // Define headers
      const headers = [
        "Time (GMT)",
        "Station Name & ID ",
        "Total Cloud Amount",
        "Low Cloud Direction",
        "Low Cloud Height",
        "Low Cloud Form",
        "Low Cloud Amount",
        "Medium Cloud Direction",
        "Medium Cloud Height",
        "Medium Cloud Form",
        "Medium Cloud Amount",
        "High Cloud Direction",
        "High Cloud Height",
        "High Cloud Form",
        "High Cloud Amount",
        "Layer1 Height",
        "Layer1 Form",
        "Layer1 Amount",
        "Layer2 Height",
        "Layer2 Form",
        "Layer2 Amount",
        "Layer3 Height",
        "Layer3 Form",
        "Layer3 Amount",
        "Layer4 Height",
        "Layer4 Form",
        "Layer4 Amount",
        "Rainfall Start Time",
        "Rainfall End Time",
        "Since Previous",
        "During Previous",
        "Last 24 Hours",
        "Wind First Anemometer",
        "Wind Second Anemometer",
        "Wind Speed",
        "Wind Direction",
        "Observer Initial",
      ];

      // Convert filteredData to CSV rows
      const rows = filteredData.map((record) => {
        const obs = record.WeatherObservation?.[0] || {};
        return [
          utcToHour(record.utcTime),
          record.station?.name + " " + record.station?.stationId || "--",
          obs.totalCloudAmount || "--",
          obs.lowCloudDirection || "--",
          obs.lowCloudHeight || "--",
          obs.lowCloudForm || "--",
          obs.lowCloudAmount || "--",
          obs.mediumCloudDirection || "--",
          obs.mediumCloudHeight || "--",
          obs.mediumCloudForm || "--",
          obs.mediumCloudAmount || "--",
          obs.highCloudDirection || "--",
          obs.highCloudHeight || "--",
          obs.highCloudForm || "--",
          obs.highCloudAmount || "--",
          obs.layer1Height || "--",
          obs.layer1Form || "--",
          obs.layer1Amount || "--",
          obs.layer2Height || "--",
          obs.layer2Form || "--",
          obs.layer2Amount || "--",
          obs.layer3Height || "--",
          obs.layer3Form || "--",
          obs.layer3Amount || "--",
          obs.layer4Height || "--",
          obs.layer4Form || "--",
          obs.layer4Amount || "--",
          obs.rainfallTimeStart || "--",
          obs.rainfallTimeEnd || "--",
          obs.rainfallSincePrevious || "--",
          obs.rainfallDuringPrevious || "--",
          obs.rainfallLast24Hours || "--",
          obs.windFirstAnemometer || "--",
          obs.windSecondAnemometer || "--",
          obs.windSpeed || "--",
          obs.windDirection || "--",
          obs.observerInitial || "--",
        ];
      });

      // Generate CSV string
      const csvContent = [headers, ...rows]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      // Create blob & download
      const blob = new Blob([csvContent], {
        type: "text/plain;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `weather_observation_${startDate}_to_${endDate}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("CSV export started");
    };

    const exportToTXT = () => {
      const filteredData = data.filter(
        (record) =>
          record.WeatherObservation && record.WeatherObservation.length > 0
      );

      if (filteredData.length === 0) {
        toast.error("No weather observation data available to export");
        return;
      }

      const currentDate = new Date().toISOString().split("T")[0];
      const currentTime =
        new Date().toISOString().split("T")[1].split(".")[0] + " UTC";

      // Create TXT header
      let txtContent = `WEATHER OBSERVATION DATA REPORT
${"=".repeat(60)}
REPORT INFORMATION:
  Date Range: ${startDate} to ${endDate}
  Station: ${stationFilter === "all" ? "All Stations" : user?.station?.name || ""}
  Report Generated: ${currentDate} at ${currentTime}
  Total Records: ${filteredData.length}

DATA VALUES:
${"=".repeat(60)}`;

      // Add data records
      filteredData.forEach((record, index) => {
        const weatherObs = record.WeatherObservation[0] || {};
        txtContent += `\nRecord ${index + 1}:\n`;
        txtContent += `${"-".repeat(30)}\n`;
        // Format each field with label and value
        txtContent += `Time (GMT)${" ".repeat(10)} ---> ${utcToHour(record.utcTime) || "--"}\n`;
        txtContent += `Station${" ".repeat(13)} ---> ${record.station?.name || "--"}\n`;
        txtContent += `Total Cloud${" ".repeat(9)} ---> ${weatherObs.totalCloudAmount || "--"}\n`;
        txtContent += `Low Cloud Form${" ".repeat(6)} ---> ${weatherObs.lowCloudForm || "--"}\n`;
        txtContent += `Low Cloud Amount${" ".repeat(4)} ---> ${weatherObs.lowCloudAmount || "--"}\n`;
        txtContent += `Low Cloud Height${" ".repeat(4)} ---> ${weatherObs.lowCloudHeight || "--"}\n`;
        txtContent += `Low Cloud Direction --> ${weatherObs.lowCloudDirection || "--"}\n`;
        txtContent += `Medium Cloud Form${" ".repeat(3)} ---> ${weatherObs.mediumCloudForm || "--"}\n`;
        txtContent += `Medium Cloud Amount --> ${weatherObs.mediumCloudAmount || "--"}\n`;
        txtContent += `Medium Cloud Height --> ${weatherObs.mediumCloudHeight || "--"}\n`;
        txtContent += `Medium Cloud Direction -> ${weatherObs.mediumCloudDirection || "--"}\n`;
        txtContent += `High Cloud Form${" ".repeat(5)} ---> ${weatherObs.highCloudForm || "--"}\n`;
        txtContent += `High Cloud Amount${" ".repeat(3)} ---> ${weatherObs.highCloudAmount || "--"}\n`;
        txtContent += `High Cloud Direction --> ${weatherObs.highCloudDirection || "--"}\n`;
        txtContent += `Layer1 Form${" ".repeat(8)} ---> ${weatherObs.layer1Form || "--"}\n`;
        txtContent += `Layer1 Amount${" ".repeat(6)} ---> ${weatherObs.layer1Amount || "--"}\n`;
        txtContent += `Layer1 Height${" ".repeat(6)} ---> ${weatherObs.layer1Height || "--"}\n`;
        txtContent += `Layer2 Form${" ".repeat(8)} ---> ${weatherObs.layer2Form || "--"}\n`;
        txtContent += `Layer2 Amount${" ".repeat(6)} ---> ${weatherObs.layer2Amount || "--"}\n`;
        txtContent += `Layer2 Height${" ".repeat(6)} ---> ${weatherObs.layer2Height || "--"}\n`;
        txtContent += `Layer3 Form${" ".repeat(8)} ---> ${weatherObs.layer3Form || "--"}\n`;
        txtContent += `Layer3 Amount${" ".repeat(6)} ---> ${weatherObs.layer3Amount || "--"}\n`;
        txtContent += `Layer3 Height${" ".repeat(6)} ---> ${weatherObs.layer3Height || "--"}\n`;
        txtContent += `Layer4 Form${" ".repeat(8)} ---> ${weatherObs.layer4Form || "--"}\n`;
        txtContent += `Layer4 Amount${" ".repeat(6)} ---> ${weatherObs.layer4Amount || "--"}\n`;
        txtContent += `Layer4 Height${" ".repeat(6)} ---> ${weatherObs.layer4Height || "--"}\n`;
        txtContent += `Rainfall Start${" ".repeat(6)} ---> ${weatherObs.rainfallTimeStart ? moment.utc(weatherObs.rainfallTimeStart).format("MM/DD HH:mm") : "--"}\n`;
        txtContent += `Rainfall End${" ".repeat(8)} ---> ${weatherObs.rainfallTimeEnd ? moment.utc(weatherObs.rainfallTimeEnd).format("MM/DD HH:mm") : "--"}\n`;
        txtContent += `Since Previous${" ".repeat(6)} ---> ${weatherObs.rainfallSincePrevious || "--"}\n`;
        txtContent += `During Previous${" ".repeat(5)} ---> ${weatherObs.rainfallDuringPrevious || "--"}\n`;
        txtContent += `Last 24 Hours${" ".repeat(6)} ---> ${weatherObs.rainfallLast24Hours || "--"}\n`;
        txtContent += `Wind 1st Anem${" ".repeat(6)} ---> ${weatherObs.windFirstAnemometer || "--"}\n`;
        txtContent += `Wind 2nd Anem${" ".repeat(6)} ---> ${weatherObs.windSecondAnemometer || "--"}\n`;
        txtContent += `Wind Speed${" ".repeat(9)} ---> ${weatherObs.windSpeed || "--"}\n`;
        txtContent += `Wind Direction${" ".repeat(6)} ---> ${weatherObs.windDirection || "--"}\n`;
        txtContent += `Observer${" ".repeat(12)} ---> ${weatherObs.observerInitial || "--"}\n`;
      });

      // Add footer
      txtContent += `\n${"=".repeat(60)}
Report End
${"=".repeat(60)}`;

      // Create and download file
      const blob = new Blob([txtContent], {
        type: "text/plain;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `weather_observation_${startDate}_to_${endDate}_${currentDate}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Weather observation data exported to TXT successfully");
    };

    return (
      <Card className="shadow-xl border-none overflow-hidden bg-gradient-to-br from-white to-slate-50">
        <div className="text-center font-bold text-xl border-b-2 border-indigo-600 pb-2 text-indigo-800">
          Second Card Data Table
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between  gap-4 mb-4 md:mb-6 bg-slate-100 p-3 sm:p-4 rounded-lg">
            {/* Date Navigation Section */}
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 md:gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousWeek}
                className="hover:bg-slate-200 flex-shrink-0 bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto max-w-sm md:max-w-none">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleDateChange("start", e.target.value)}
                  max={endDate}
                  className="text-xs sm:text-sm p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded w-full xs:w-auto min-w-0"
                />
                <span className="text-sm text-slate-600 whitespace-nowrap px-1">
                  to
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateChange("end", e.target.value)}
                  min={startDate}
                  max={format(new Date(), "yyyy-MM-dd")}
                  className="text-xs sm:text-sm p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded w-full xs:w-auto min-w-0"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextWeek}
                className="hover:bg-slate-200 flex-shrink-0 bg-transparent"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Actions and Filters Section */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200">
              {/* Export Button */}
              {session?.user?.role &&
                ["super_admin", "station_admin"].includes(
                  session?.user?.role
                ) && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToCSV}
                      className="flex items-center justify-center gap-2 hover:bg-green-50 border-green-200 text-green-700 w-full sm:w-auto bg-transparent"
                      disabled={filteredData.length === 0}
                    >
                      <Download className="h-4 w-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">Export CSV</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToTXT}
                      className="flex items-center justify-center gap-2 hover:bg-blue-50 border-blue-200 text-blue-700 w-full sm:w-auto bg-transparent"
                      disabled={filteredData.length === 0}
                    >
                      <Download className="h-4 w-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">Export TXT</span>
                    </Button>
                  </div>
                )}

              {/* Station Filter - Super Admin Only */}
              {session?.user?.role === "super_admin" && (
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-sky-500 flex-shrink-0" />
                    <Label
                      htmlFor="stationFilter"
                      className="whitespace-nowrap font-medium text-slate-700 text-sm"
                    >
                      Station:
                    </Label>
                  </div>
                  <Select
                    value={stationFilter}
                    onValueChange={setStationFilter}
                  >
                    <SelectTrigger className="w-full xs:w-[180px] sm:w-[200px] border-slate-300 focus:ring-sky-500 text-sm">
                      <SelectValue placeholder="All Stations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stations</SelectItem>
                      {stations.map((station) => (
                        <SelectItem key={station.id} value={station.id}>
                          <span className="block truncate">
                            {station.name} ({station.stationId})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Form View */}
          <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
            {/* Header Section - Responsive */}
            <div className="p-3 md:p-4 bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-300">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {/* DATA TYPE Section */}
                <div className="flex flex-col items-center">
                  <Label className="text-xs md:text-sm font-medium text-slate-900 mb-1 md:mb-2">
                    DATA TYPE
                  </Label>
                  <div className="flex gap-1">
                    {["S", "Y"].map((char, i) => (
                      <Input
                        key={`dataType-${i}`}
                        className="w-8 sm:w-10 h-8 text-center p-1 bg-slate-100 border border-slate-400 shadow-sm text-xs sm:text-sm"
                        defaultValue={char}
                        readOnly
                      />
                    ))}
                  </div>
                </div>

                {/* STATION NO Section */}
                <div className="flex flex-col items-center">
                  <div className="text-xs sm:text-sm font-bold uppercase text-slate-600 mb-1 sm:mb-2">
                    STATION NO
                  </div>
                  <div className="h-8 w-full min-w-[60px] border border-slate-400 rounded-lg p-1 flex items-center justify-center bg-white text-xs sm:text-sm font-mono truncate">
                    {user?.station?.stationId || "N/A"}
                  </div>
                </div>

                {/* YEAR Section */}
                <div className="flex flex-col items-center">
                  <div className="text-xs md:text-sm font-bold uppercase text-slate-600 mb-1 md:mb-2">
                    YEAR
                  </div>
                  <div className="flex">
                    <div className="w-8 md:w-10 h-8 border border-slate-400 flex items-center justify-center p-1 font-mono rounded-l-md bg-white text-xs md:text-sm">
                      {new Date().getFullYear().toString().slice(-2, -1)}
                    </div>
                    <div className="w-8 sm:w-10 h-8 border-t border-r border-b border-slate-400 flex items-center justify-center p-1 font-mono rounded-r-md bg-white text-xs sm:text-sm">
                      {new Date().getFullYear().toString().slice(-1)}
                    </div>
                  </div>
                </div>

                {/* STATION NAME Section */}
                <div className="flex flex-col items-center">
                  <div className="text-xs sm:text-sm font-bold uppercase text-slate-600 mb-1 sm:mb-2">
                    STATION
                  </div>
                  <div className="h-8 w-full border border-slate-400 p-1 flex items-center justify-center font-mono rounded-md bg-white text-xs sm:text-sm truncate">
                    {user?.station?.name || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Table Section */}
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  {/* Table Header */}
                  <thead>
                    {/* Top-Level Grouping */}
                    <tr>
                      <th
                        rowSpan={3}
                        className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 p-1 text-sky-800"
                      >
                        Time of Observation (UTC)
                      </th>
                      <th
                        rowSpan={3}
                        className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 p-1 text-sky-800"
                      >
                        C2 Indicator
                      </th>
                      <th
                        rowSpan={3}
                        className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 p-1 text-sky-800"
                      >
                        DATE
                      </th>
                      <th
                        rowSpan={3}
                        className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 p-1 text-sky-800"
                      >
                        STATION
                      </th>
                      <th
                        colSpan={11}
                        className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
                      >
                        CLOUD
                      </th>
                      <th
                        rowSpan={3}
                        className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 p-1 text-sky-800"
                      >
                        TOTAL CLOUD Amount (Octa)
                      </th>
                      <th
                        colSpan={12}
                        className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
                      >
                        SIGNIFICANT CLOUD
                      </th>
                      <th
                        colSpan={5}
                        rowSpan={2}
                        className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 text-emerald-800"
                      >
                        RAINFALL
                      </th>
                      <th
                        colSpan={4}
                        rowSpan={2}
                        className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 p-1 text-amber-800"
                      >
                        WIND
                      </th>
                      <th
                        rowSpan={3}
                        className="border border-slate-300 bg-gradient-to-b from-gray-50 to-gray-100 p-1 text-gray-800"
                      >
                        OBSERVER
                      </th>
                      <th
                        rowSpan={3}
                        className="border border-slate-300 bg-gradient-to-b from-gray-50 to-gray-100 p-1 text-gray-800"
                      >
                        ACTIONS
                      </th>
                    </tr>

                    {/* Sub-Grouping for CLOUD + SIGNIFICANT CLOUD */}
                    <tr>
                      <th
                        colSpan={4}
                        className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
                      >
                        LOW
                      </th>
                      <th
                        colSpan={4}
                        className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
                      >
                        MEDIUM
                      </th>
                      <th
                        colSpan={3}
                        className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
                      >
                        HIGH
                      </th>
                      <th
                        colSpan={3}
                        className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
                      >
                        1st Layer
                      </th>
                      <th
                        colSpan={3}
                        className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
                      >
                        2nd Layer
                      </th>
                      <th
                        colSpan={3}
                        className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
                      >
                        3rd Layer
                      </th>
                      <th
                        colSpan={3}
                        className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
                      >
                        4th Layer
                      </th>
                    </tr>

                    {/* Final Headers */}
                    <tr>
                      {/* LOW CLOUD */}
                      <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">
                        Form (Code)
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">
                        Amount (Octa)
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">
                        Direction (Code)
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">
                        Height Of Base (Code)
                      </th>
                      {/* MEDIUM CLOUD */}
                      <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">
                        Form (Code)
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">
                        Amount (Octa)
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">
                        Direction (Code)
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">
                        Height Of Base (Code)
                      </th>
                      {/* HIGH CLOUD */}
                      <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">
                        Form (Code)
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">
                        Amount (Octa)
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1 text-blue-800">
                        Direction (Code)
                      </th>
                      {/* SIGNIFICANT CLOUD */}
                      <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">
                        Form (Code)
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">
                        Amount (Octa)
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">
                        Height of Base (Code)
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">
                        Form (Code)
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">
                        Amount (Octa)
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">
                        Height of Base (Code)
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">
                        Form (Code)
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">
                        Amount (Octa)
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">
                        Height of Base (Code)
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">
                        Form (Code)
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">
                        Amount (Octa)
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1 text-indigo-800">
                        Height of Base (Code)
                      </th>
                      {/* RainFall */}
                      <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 font-medium text-emerald-800">
                        Time Of Start
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 font-medium text-emerald-800">
                        Time Of End
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 font-medium text-emerald-800">
                        Since Previous
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 font-medium text-emerald-800">
                        During Previous
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 font-medium text-emerald-800">
                        Last 24 Hours
                      </th>
                      {/* Wind */}
                      <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 p-1 font-medium text-amber-800">
                        First Anemometer Reading
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 p-1 font-medium text-amber-800">
                        Second Anemometer Reading
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 p-1 font-medium text-amber-800">
                        Speed (KTS)
                      </th>
                      <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 p-1 font-medium text-amber-800">
                        Direction
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={38} className="text-center py-8">
                          <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                            <span className="ml-3 text-sky-600 font-medium">
                              Loading data...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={38} className="text-center py-12">
                          <div className="flex flex-col items-center justify-center text-slate-500">
                            <CloudSun
                              size={48}
                              className="text-slate-400 mb-3"
                            />
                            <p className="text-lg font-medium">
                              No weather observations found
                            </p>
                            <p className="text-sm">
                              Try selecting a different date or station
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((record, index) => {
                        const weatherObs = record.WeatherObservation[0];
                        const totalCloudAmount =
                          weatherObs?.totalCloudAmount || "--";
                        const cloudClass =
                          getCloudStatusColor(totalCloudAmount);
                        const rowClass =
                          index % 2 === 0 ? "bg-white" : "bg-slate-50";
                        const canEdit =
                          user && canEditObservation(record, user);

                        return (
                          <tr
                            key={record.id || index}
                            className={`text-center font-mono hover:bg-blue-50 transition-colors ${rowClass}`}
                          >
                            <td className="border border-slate-300 p-1 font-medium text-sky-700">
                              <div className="flex flex-col font-bold px-2">
                                {utcToHour(record.utcTime.toString())}
                              </div>
                            </td>
                            <td className="border border-slate-300 p-1 font-medium text-sky-700">
                              <div className="flex flex-col font-bold px-2">
                                {weatherObs.cardIndicator}
                              </div>
                            </td>
                            <td className="border border-slate-300 p-1 text-sm font-bold text-sky-700">
                              {formatUtcMDY(record.utcTime)}
                            </td>
                            <td className="border border-slate-300 p-1">
                              <Badge
                                variant="outline"
                                className="font-mono text-xs font-bold"
                              >
                                {record.station?.name +
                                  " " +
                                  record.station?.stationId || "--"}
                              </Badge>
                            </td>

                            {/* Low Cloud */}
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.lowCloudForm ? "text-blue-700 font-medium" : ""}`}
                            >
                              {weatherObs?.lowCloudForm || "--"}
                            </td>
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.lowCloudAmount ? "text-blue-700 font-medium" : ""}`}
                            >
                              {weatherObs?.lowCloudAmount || "--"}
                            </td>

                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.lowCloudDirection ? "text-blue-700 font-medium" : ""}`}
                            >
                              {weatherObs?.lowCloudDirection || "--"}
                            </td>
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.lowCloudHeight ? "text-blue-700 font-medium" : ""}`}
                            >
                              {weatherObs?.lowCloudHeight || "--"}
                            </td>

                            {/* Medium Cloud */}
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.mediumCloudForm ? "text-blue-700 font-medium" : ""}`}
                            >
                              {weatherObs?.mediumCloudForm || "--"}
                            </td>
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.mediumCloudAmount ? "text-blue-700 font-medium" : ""}`}
                            >
                              {weatherObs?.mediumCloudAmount || "--"}
                            </td>
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.mediumCloudDirection ? "text-blue-700 font-medium" : ""}`}
                            >
                              {weatherObs?.mediumCloudDirection || "--"}
                            </td>
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.mediumCloudHeight ? "text-blue-700 font-medium" : ""}`}
                            >
                              {weatherObs?.mediumCloudHeight || "--"}
                            </td>

                            {/* High Cloud */}
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.highCloudForm ? "text-blue-700 font-medium" : ""}`}
                            >
                              {weatherObs?.highCloudForm || "--"}
                            </td>
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.highCloudAmount ? "text-blue-700 font-medium" : ""}`}
                            >
                              {weatherObs?.highCloudAmount || "--"}
                            </td>
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.highCloudDirection ? "text-blue-700 font-medium" : ""}`}
                            >
                              {weatherObs?.highCloudDirection || "--"}
                            </td>

                            {/*Total Cloud  */}
                            <td className="border border-slate-300 p-1">
                              <Badge
                                variant="outline"
                                className={`${cloudClass} text-white`}
                              >
                                {totalCloudAmount}
                              </Badge>
                            </td>

                            {/* Significant Clouds */}
                            {/* layer1 */}
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.layer1Form ? "text-indigo-700 font-medium" : ""}`}
                            >
                              {weatherObs?.layer1Form || "--"}
                            </td>
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.layer1Amount ? "text-indigo-700 font-medium" : ""}`}
                            >
                              {weatherObs?.layer1Amount || "--"}
                            </td>
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.layer1Height ? "text-indigo-700 font-medium" : ""}`}
                            >
                              {weatherObs?.layer1Height || "--"}
                            </td>

                            {/* layer2 */}
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.layer2Form ? "text-indigo-700 font-medium" : ""}`}
                            >
                              {weatherObs?.layer2Form || "--"}
                            </td>
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.layer2Amount ? "text-indigo-700 font-medium" : ""}`}
                            >
                              {weatherObs?.layer2Amount || "--"}
                            </td>
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.layer2Height ? "text-indigo-700 font-medium" : ""}`}
                            >
                              {weatherObs?.layer2Height || "--"}
                            </td>

                            {/* layer3 */}
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.layer3Form ? "text-indigo-700 font-medium" : ""}`}
                            >
                              {weatherObs?.layer3Form || "--"}
                            </td>
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.layer3Amount ? "text-indigo-700 font-medium" : ""}`}
                            >
                              {weatherObs?.layer3Amount || "--"}
                            </td>
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.layer3Height ? "text-indigo-700 font-medium" : ""}`}
                            >
                              {weatherObs?.layer3Height || "--"}
                            </td>

                            {/* layer4 */}
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.layer4Form ? "text-indigo-700 font-medium" : ""}`}
                            >
                              {weatherObs?.layer4Form || "--"}
                            </td>
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.layer4Amount ? "text-indigo-700 font-medium" : ""}`}
                            >
                              {weatherObs?.layer4Amount || "--"}
                            </td>
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.layer4Height ? "text-indigo-700 font-medium" : ""}`}
                            >
                              {weatherObs?.layer4Height || "--"}
                            </td>

                            {/* Rainfall */}
                            <td
                              className={` border border-slate-300 p-1 ${weatherObs?.rainfallTimeStart ? "text-emerald-700 font-medium" : ""}`}
                            >
                              {weatherObs?.rainfallTimeStart
                                ? moment
                                    .utc(weatherObs.rainfallTimeStart)
                                    .format("MM/DD HH:mm")
                                : "--"}
                            </td>
                            <td
                              className={` border border-slate-300 p-3 ${weatherObs?.rainfallTimeEnd ? "text-emerald-700 font-medium" : ""}`}
                            >
                              {weatherObs?.rainfallTimeEnd
                                ? moment
                                    .utc(weatherObs.rainfallTimeEnd)
                                    .format("MM/DD HH:mm")
                                : "--"}
                            </td>

                            <td
                              className={`border border-slate-300 p-3 ${weatherObs?.rainfallSincePrevious ? "text-emerald-700 font-medium" : ""}`}
                            >
                              {weatherObs?.rainfallSincePrevious || "--"}
                            </td>
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.rainfallDuringPrevious ? "text-emerald-700 font-medium" : ""}`}
                            >
                              {weatherObs?.rainfallDuringPrevious || "--"}
                            </td>
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.rainfallLast24Hours ? "text-emerald-700 font-medium" : ""}`}
                            >
                              {weatherObs?.rainfallLast24Hours || "--"}
                            </td>

                            {/* Wind */}
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.windFirstAnemometer ? "text-amber-700 font-medium" : ""}`}
                            >
                              {weatherObs?.windFirstAnemometer || "--"}
                            </td>
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.windSecondAnemometer ? "text-amber-700 font-medium" : ""}`}
                            >
                              {weatherObs?.windSecondAnemometer || "--"}
                            </td>
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.windSpeed ? "text-amber-700 font-medium" : ""}`}
                            >
                              {weatherObs?.windSpeed || "--"}
                            </td>
                            <td
                              className={`border border-slate-300 p-1 ${weatherObs?.windDirection ? "text-amber-700 font-medium" : ""}`}
                            >
                              {weatherObs?.windDirection || "--"}
                            </td>

                            {/* Observer */}
                            <td className="border border-slate-300 p-1">
                              <Badge variant="outline" className="bg-gray-100">
                                {weatherObs?.observerInitial || "--"}
                              </Badge>
                            </td>

                            {/* Edit Button */}
                            <td className="border border-slate-300 p-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={`h-8 w-8 p-0 ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`}
                                      onClick={() => handleEditClick(record)}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                      </svg>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {canEdit
                                      ? "Edit this record"
                                      : "You don't have permission to edit this record"}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-sky-500" />
                <span className="text-sm text-slate-600">
                  Date Range:{" "}
                  <span className="font-medium text-slate-800">
                    {`${format(new Date(startDate), "MMM d")} - ${format(new Date(endDate), "MMM d, yyyy")}`}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-sky-100 text-sky-800 hover:bg-sky-200">
                  {filteredData.length} record(s)
                </Badge>
                {stationFilter !== "all" && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    Station: {stationFilter}
                  </Badge>
                )}
              </div>
            </div> */}
            </div>
          </div>

          {/* Edit Dialog without validation */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="w-[90vw] !max-w-[95vw] rounded-xl border-0 bg-gradient-to-br from-sky-50 to-blue-50 p-6 shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-sky-800">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Weather Observation
                  </div>
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  Editing record from{" "}
                  {selectedRecord?.station?.name || "Unknown Station"} on{" "}
                  {selectedRecord?.utcTime
                    ? formatUtcLong(selectedRecord.utcTime)
                    : "Unknown Date"}
                </DialogDescription>
                <div className="h-1 w-20 rounded-full bg-gradient-to-r from-sky-400 to-blue-400 mt-2"></div>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)}>
                {selectedRecord && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 max-h-[65vh] overflow-y-auto pr-2">
                    {/* Total Cloud */}
                    <div className="space-y-1 p-3 rounded-lg bg-sky-50 border border-white shadow-sm">
                      <Label
                        htmlFor="totalCloudAmount"
                        className="text-sm font-medium text-gray-700"
                      >
                        Total Cloud Amount
                      </Label>
                      <Input
                        {...register("totalCloudAmount")}
                        className="w-full bg-white border-gray-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                      />
                    </div>

                    {/* Low Cloud */}
                    <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Low Cloud Direction
                      </Label>
                      <Input
                        {...register("lowCloudDirection")}
                        className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Low Cloud Height
                      </Label>
                      <Input
                        {...register("lowCloudHeight")}
                        className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Low Cloud Form
                      </Label>
                      <Input
                        {...register("lowCloudForm")}
                        className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Low Cloud Amount
                      </Label>
                      <Input
                        {...register("lowCloudAmount")}
                        className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    {/* Medium Cloud */}
                    <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Medium Cloud Direction
                      </Label>
                      <Input
                        {...register("mediumCloudDirection")}
                        className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Medium Cloud Height
                      </Label>
                      <Input
                        {...register("mediumCloudHeight")}
                        className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Medium Cloud Form
                      </Label>
                      <Input
                        {...register("mediumCloudForm")}
                        className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Medium Cloud Amount
                      </Label>
                      <Input
                        {...register("mediumCloudAmount")}
                        className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    {/* High Cloud */}
                    <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        High Cloud Direction
                      </Label>
                      <Input
                        {...register("highCloudDirection")}
                        className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        High Cloud Height
                      </Label>
                      <Input
                        {...register("highCloudHeight")}
                        className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        High Cloud Form
                      </Label>
                      <Input
                        {...register("highCloudForm")}
                        className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        High Cloud Amount
                      </Label>
                      <Input
                        {...register("highCloudAmount")}
                        className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    {/* Rainfall */}
                    <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Rainfall Start Time
                      </Label>
                      <Input
                        {...register("rainfallTimeStart")}
                        className="w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Rainfall End Time
                      </Label>
                      <Input
                        {...register("rainfallTimeEnd")}
                        className="w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Rainfall Since Previous
                      </Label>
                      <Input
                        {...register("rainfallSincePrevious")}
                        className="w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Rainfall During Previous
                      </Label>
                      <Input
                        {...register("rainfallDuringPrevious")}
                        className="w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Rainfall Last 24 Hours
                      </Label>
                      <Input
                        {...register("rainfallLast24Hours")}
                        className="w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                      />
                    </div>

                    {/* Wind */}
                    <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        First Anemometer
                      </Label>
                      <Input
                        {...register("windFirstAnemometer")}
                        className="w-full bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Second Anemometer
                      </Label>
                      <Input
                        {...register("windSecondAnemometer")}
                        className="w-full bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Wind Speed
                      </Label>
                      <Input
                        {...register("windSpeed")}
                        className="w-full bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Wind Direction
                      </Label>
                      <Input
                        {...register("windDirection")}
                        className="w-full bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                      />
                    </div>

                    {/* Observer */}
                    <div className="space-y-1 p-3 rounded-lg bg-gray-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Observer Initial (Readonly)
                      </Label>
                      <Input
                        {...register("observerInitial")}
                        readOnly
                        className="w-full bg-gray-100 border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 cursor-not-allowed"
                      />
                    </div>

                    {/* Significant Clouds */}
                    <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Layer 1 Height
                      </Label>
                      <Input
                        {...register("layer1Height")}
                        className="w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Layer 1 Form
                      </Label>
                      <Input
                        {...register("layer1Form")}
                        className="w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Layer 1 Amount
                      </Label>
                      <Input
                        {...register("layer1Amount")}
                        className="w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Layer 2 Height
                      </Label>
                      <Input
                        {...register("layer2Height")}
                        className="w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Layer 2 Form
                      </Label>
                      <Input
                        {...register("layer2Form")}
                        className="w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Layer 2 Amount
                      </Label>
                      <Input
                        {...register("layer2Amount")}
                        className="w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Layer 3 Height
                      </Label>
                      <Input
                        {...register("layer3Height")}
                        className="w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Layer 3 Form
                      </Label>
                      <Input
                        {...register("layer3Form")}
                        className="w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Layer 3 Amount
                      </Label>
                      <Input
                        {...register("layer3Amount")}
                        className="w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Layer 4 Height
                      </Label>
                      <Input
                        {...register("layer4Height")}
                        className="w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Layer 4 Form
                      </Label>
                      <Input
                        {...register("layer4Form")}
                        className="w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                      <Label className="text-sm font-medium text-gray-700">
                        Layer 4 Amount
                      </Label>
                      <Input
                        {...register("layer4Amount")}
                        className="w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>
                  </div>
                )}

                <DialogFooter className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-md transition-all"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-2 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Permission Denied Dialog */}
          <Dialog
            open={isPermissionDeniedOpen}
            onOpenChange={setIsPermissionDeniedOpen}
          >
            <DialogContent className="max-w-md rounded-xl border-0 bg-white p-6 shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Permission Denied
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-slate-700">
                  You don't have permission to edit this record. This could be
                  because:
                </p>
                <ul className="mt-2 list-disc pl-5 text-sm text-slate-600 space-y-1">
                  <li>The record is too old to edit</li>
                  <li>The record belongs to a different station</li>
                  <li>You don't have the required role permissions</li>
                </ul>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => setIsPermissionDeniedOpen(false)}
                  className="bg-slate-200 text-slate-800 hover:bg-slate-300"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }
);

SecondCardTable.displayName = "SecondCardTable";

export default SecondCardTable;
