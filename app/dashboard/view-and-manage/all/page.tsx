"use client";

import { useEffect, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FirstCardTable from "../first-card-view/FirstCardTable";
import SecondCardTable from "../second-card-view/SecondCardTable";
import SynopticCodeTable from "../synoptic-code/SynopticCodeTable";
import ExcelJS from "exceljs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, Filter } from "lucide-react";
// ✅ CHANGED: useSession now from next-auth
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import DailySummaryTable from "../daily-summery";
import MargeTable from "@/components/margeTable";
import type { DailySummaryRecord } from "@/lib/types/dailySummary";
import type { WeatherObservationRecord } from "@/types/weather-observation";
import type { SynopticRecord } from "@/lib/types/synoptic";
import type { Station } from "@/types/station";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getNextRange,
  getPreviousRange,
  todayISO,
  validateDateChange,
} from "@/lib/utils/date-utils";
import { exportAllToTXT } from "@/lib/export/exportAllTXT";

// ✅ CHANGED: keep only one dynamic import (no redeclare inside component)
const CompactPDFExportButton = dynamic(() => import("../PdfExportComponent"), {
  ssr: false,
  loading: () => (
    <Button disabled className="flex items-center gap-2 bg-red-600 text-white">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      Loading PDF...
    </Button>
  ),
});

export default function AllViewAndManagePage() {
  const [activeTab, setActiveTab] = useState("full-table");
  const { data: session } = useSession();
  const [globalFilters, setGlobalFilters] = useState({
    startDate: todayISO(),
    endDate: todayISO(),
    stationFilter: "all",
  });
  const [dateError, setDateError] = useState<string | null>(null);
  const [stations, setStations] = useState<Station[]>([]);

  const firstCardRef = useRef<any>(null);
  const secondCardRef = useRef<any>(null);
  const synopticRef = useRef<any>(null);
  const dailySummeryRef = useRef<any>(null);
  const isGlobalStationFilterVisible =
    session?.user?.role === "super_admin" ||
    session?.user?.role === "root_admin";

  useEffect(() => {
    if (!isGlobalStationFilterVisible) {
      setStations([]);
      return;
    }

    let active = true;

    const loadStations = async () => {
      try {
        const response = await fetch("/api/stations");
        if (!response.ok) {
          throw new Error("Failed to fetch stations");
        }
        const data = await response.json();
        if (active) {
          setStations(data);
        }
      } catch (error) {
        console.error("Failed to fetch stations:", error);
      }
    };

    loadStations();

    return () => {
      active = false;
    };
  }, [isGlobalStationFilterVisible]);

  const handleGlobalDateChange = (type: "start" | "end", value: string) => {
    const { range, error } = validateDateChange(type, value, {
      startDate: globalFilters.startDate,
      endDate: globalFilters.endDate,
    });

    if (error) {
      setDateError(error);
      return;
    }

    setDateError(null);
    setGlobalFilters((prev) => ({ ...prev, ...range }));
  };

  const handlePreviousRange = () => {
    setGlobalFilters((prev) => ({
      ...prev,
      ...getPreviousRange(prev.startDate, prev.endDate),
    }));
    setDateError(null);
  };

  const handleNextRange = () => {
    const range = getNextRange(globalFilters.startDate, globalFilters.endDate);
    if (!range) return;

    setGlobalFilters((prev) => ({ ...prev, ...range }));
    setDateError(null);
  };

  const exportToExcel = async () => {
    const wb = new ExcelJS.Workbook();

    const firstCardData = firstCardRef.current?.getData?.() || [];
    const secondCardData = secondCardRef.current?.getData?.() || [];
    const synopticData = synopticRef.current?.getData?.() || [];
    const dailySummaryData = dailySummeryRef.current?.getData?.() || [];

    const excludedKeys = [
      "id",
      "stationId",
      "submittedAt",
      "createdAt",
      "updatedAt",
      "tabActive",
      "observingTime",
      "observingTimeId",
      "localTime",
      "utcTime",
      "date",
      "c2Indicator",
    ];

    const getDateTimeParts = (value: unknown) => {
      if (!value) {
        return { date: "", time: "" };
      }

      const parsed = value instanceof Date ? value : new Date(String(value));
      if (Number.isNaN(parsed.getTime())) {
        return { date: String(value), time: "" };
      }

      const isoValue = parsed.toISOString().slice(0, 19);
      return {
        date: isoValue.slice(0, 10),
        time: isoValue.slice(11, 19),
      };
    };

    const getObservationDateTime = (item: any) =>
      getDateTimeParts(
        item.localTime ||
          item.utcTime ||
          item.date ||
          item.ObservingTime?.utcTime ||
          item.createdAt,
      );

    const orderExportKeys = (keys: string[]) => {
      const leadingKeys = ["stationName", "stationCode", "date", "time"];
      return [
        ...leadingKeys.filter((key) => keys.includes(key)),
        ...keys.filter((key) => !leadingKeys.includes(key)),
      ];
    };

    // Helper function to add station info to data
    const addStationInfo = (data: any[]) => {
      return data.map((item: any) => {
        // Handle different data structures:
        // 1. FlattenedWeatherObservation (direct stationName, stationId)
        // 2. WeatherObservationRecord (nested station object)
        // 3. SynopticRecord & DailySummaryRecord (nested ObservingTime.station)
        const observationDateTime = getObservationDateTime(item);
        const stationInfo = {
          stationName:
            item.stationName ||
            item.station?.name ||
            item.ObservingTime?.station?.name ||
            "",
          stationCode:
            item.stationId ||
            item.station?.stationId ||
            item.ObservingTime?.station?.stationId ||
            "",
          date: observationDateTime.date,
          time: observationDateTime.time,
        };

        const cleaned: any = { ...stationInfo };
        Object.keys(item).forEach((key: string) => {
          if (
            !excludedKeys.includes(key) &&
            key !== "station" &&
            key !== "user" &&
            key !== "stationName" &&
            key !== "stationId" &&
            key !== "ObservingTime"
          ) {
            cleaned[key] = item[key];
          }
        });
        return cleaned;
      });
    };

    const cleanFirst = addStationInfo(firstCardData);
    const cleanSecond = addStationInfo(secondCardData);

    const firstKeys = Object.keys(cleanFirst[0] || {});
    const secondKeys = Object.keys(cleanSecond[0] || {});

    const orderedFirstKeys = orderExportKeys(firstKeys);
    const orderedSecondKeys = orderExportKeys(secondKeys);

    const firstHeader = Array(orderedFirstKeys.length).fill("First Card");
    const secondHeader = Array(orderedSecondKeys.length).fill("Second Card");

    const fullHeaderRow = [...firstHeader, ...secondHeader];
    const subHeaderRow = [...orderedFirstKeys, ...orderedSecondKeys];

    const maxLength = Math.max(cleanFirst.length, cleanSecond.length);
    const mergedRows: any[] = [];

    for (let i = 0; i < maxLength; i++) {
      const firstRow = cleanFirst[i] || {};
      const secondRow = cleanSecond[i] || {};

      mergedRows.push([
        ...orderedFirstKeys.map((k) => firstRow[k] || ""),
        ...orderedSecondKeys.map((k) => secondRow[k] || ""),
      ]);
    }

    // Create First+Second Card sheet
    const mergedSheet = wb.addWorksheet("First+Second Card");
    mergedSheet.addRow(fullHeaderRow);
    mergedSheet.addRow(subHeaderRow);
    mergedRows.forEach((row) => mergedSheet.addRow(row));

    // Merge header cells only when a section spans multiple columns.
    const firstColEnd = orderedFirstKeys.length;
    const secondColStart = firstColEnd + 1;
    const secondColEnd = firstColEnd + orderedSecondKeys.length;

    if (orderedFirstKeys.length > 1) {
      mergedSheet.mergeCells(1, 1, 1, firstColEnd);
    }

    if (orderedSecondKeys.length > 1) {
      mergedSheet.mergeCells(1, secondColStart, 1, secondColEnd);
    }

    // Synoptic
    const cleanSynoptic = addStationInfo(synopticData);
    const synopticSheet = wb.addWorksheet("Synoptic");
    if (cleanSynoptic.length > 0) {
      const synopticKeys = Object.keys(cleanSynoptic[0]);
      const orderedSynopticKeys = orderExportKeys(synopticKeys);
      synopticSheet.addRow(orderedSynopticKeys);
      cleanSynoptic.forEach((item: any) => {
        synopticSheet.addRow(orderedSynopticKeys.map((k) => item[k]));
      });
    }

    // Daily Summary
    const cleanSummary = addStationInfo(dailySummaryData);
    const summarySheet = wb.addWorksheet("Daily Summary");
    if (cleanSummary.length > 0) {
      const summaryKeys = Object.keys(cleanSummary[0]);
      const orderedSummaryKeys = orderExportKeys(summaryKeys);
      summarySheet.addRow(orderedSummaryKeys);
      cleanSummary.forEach((item: any) => {
        summarySheet.addRow(orderedSummaryKeys.map((k) => item[k]));
      });
    }

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Weather_Data_All_Tabs.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToTXT = () => {
    const firstCardData = firstCardRef.current?.getData?.() || [];
    const secondCardData = secondCardRef.current?.getData?.() || [];
    const synopticData = synopticRef.current?.getData?.() || [];
    const dailySummaryData = dailySummeryRef.current?.getData?.() || [];

    exportAllToTXT({
      firstCardData,
      secondCardData,
      synopticData,
      dailySummaryData,
      stationInfo,
    });
  };

  const MargeTableRef = useRef<any>(null);

  // Prepare station info for PDF
  const stationInfo = {
    stationId: session?.user?.station?.stationId || "41953",
    stationName: session?.user?.station?.name || "Weather Station",
    stationCode: session?.user?.station?.stationCode || "41953",
    date: new Date().toLocaleDateString(),
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 min-h-screen">
      {/* Header Section - Responsive */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 break-words">
          All View & Manage
        </h1>

        {/* Export Buttons - Responsive Layout */}
        {(session?.user?.role === "super_admin" ||
          session?.user?.role === "root_admin" ||
          session?.user?.role === "station_admin") && (
          <div className="flex items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Excel Export Button */}
            <Button
              onClick={() => exportToExcel()}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 w-1/3 sm:w-auto text-sm sm:text-base px-3 py-2"
            >
              <Download className="h-4 w-4 shrink-0" />
              <span className="truncate">Export All to Excel</span>
            </Button>

            {/* TXT Export Button */}
            <Button
              onClick={() => exportToTXT()}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 w-1/3 sm:w-auto text-sm sm:text-base px-3 py-2"
            >
              <Download className="h-4 w-4 shrink-0" />
              <span className="truncate">Export All to TXT</span>
            </Button>

            {/* Compact PDF Export Button */}
            <div className="w-1/3 sm:w-auto">
              <CompactPDFExportButton
                firstCardRef={firstCardRef}
                secondCardRef={secondCardRef}
                synopticRef={synopticRef}
                dailySummeryRef={dailySummeryRef}
                stationInfo={stationInfo}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-100 p-3 sm:p-4 rounded-lg print:hidden">
        <div className="flex flex-col gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-2 w-full">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousRange}
              className="hover:bg-slate-200 shrink-0 bg-transparent"
              aria-label="Go to previous range"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={globalFilters.startDate}
                onChange={(event) =>
                  handleGlobalDateChange("start", event.currentTarget.value)
                }
                max={globalFilters.endDate}
                className="text-xs sm:text-sm p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded w-full sm:w-auto min-w-[120px]"
              />
              <span className="text-sm text-slate-600 whitespace-nowrap">
                to
              </span>
              <input
                type="date"
                value={globalFilters.endDate}
                onChange={(event) =>
                  handleGlobalDateChange("end", event.currentTarget.value)
                }
                min={globalFilters.startDate}
                max={todayISO()}
                className="text-xs sm:text-sm p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded w-full sm:w-auto min-w-[120px]"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextRange}
              className="hover:bg-slate-200 shrink-0 bg-transparent"
              aria-label="Go to next range"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {dateError && <p className="text-sm text-red-600">{dateError}</p>}
        </div>

        {isGlobalStationFilterVisible && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-purple-500 shrink-0" />
              <Label
                htmlFor="globalStationFilter"
                className="whitespace-nowrap font-medium text-slate-700 text-sm"
              >
                Station:
              </Label>
            </div>
            <Select
              value={globalFilters.stationFilter}
              onValueChange={(stationFilter) =>
                setGlobalFilters((prev) => ({ ...prev, stationFilter }))
              }
            >
              <SelectTrigger
                id="globalStationFilter"
                className="w-full sm:w-[220px] border-slate-300 focus:ring-purple-500 text-sm bg-white"
              >
                <SelectValue placeholder="All Stations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stations</SelectItem>
                {stations.map((station) => (
                  <SelectItem key={station.id} value={station.id}>
                    {station.name} ({station.stationId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Tabs Section - Responsive */}
      <Tabs
        defaultValue="full-table"
        onValueChange={(value) => setActiveTab(value)}
        className="w-full"
      >
        {/* Tab Navigation - Responsive with Horizontal Scroll */}
        <div className="w-full overflow-x-auto">
          <TabsList className="min-w-max w-full sm:w-auto">
            <TabsTrigger
              value="full-table"
              className="whitespace-nowrap text-sm"
            >
              Full Table
            </TabsTrigger>
            <TabsTrigger
              value="first-card"
              className="whitespace-nowrap text-sm"
            >
              First Card
            </TabsTrigger>
            <TabsTrigger
              value="second-card"
              className="whitespace-nowrap text-sm"
            >
              Second Card
            </TabsTrigger>
            <TabsTrigger
              value="synoptic-code"
              className="whitespace-nowrap text-sm"
            >
              Synoptic Code
            </TabsTrigger>
            <TabsTrigger
              value="daily-summery"
              className="whitespace-nowrap text-sm"
            >
              Daily Summary
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content Area - Responsive */}
        <div className="mt-4 md:mt-6 rounded-lg border bg-white shadow overflow-hidden">
          <div className="p-2 sm:p-4 overflow-x-auto">
            <div hidden={activeTab !== "full-table"}>
              <MargeTable
                ref={MargeTableRef}
                filters={globalFilters}
                hideFilters
              />
            </div>
            <div hidden={activeTab !== "first-card"}>
              <FirstCardTable
                ref={firstCardRef}
                filters={globalFilters}
                hideFilters
              />
            </div>
            <div hidden={activeTab !== "second-card"}>
              <SecondCardTable
                ref={secondCardRef}
                filters={globalFilters}
                hideFilters
              />
            </div>
            <div hidden={activeTab !== "synoptic-code"}>
              <SynopticCodeTable
                ref={synopticRef}
                filters={globalFilters}
                hideFilters
              />
            </div>
            <div hidden={activeTab !== "daily-summery"}>
              <DailySummaryTable
                ref={dailySummeryRef}
                filters={globalFilters}
                hideFilters
              />
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
