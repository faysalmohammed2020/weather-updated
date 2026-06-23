"use client";

import React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";

interface BasicInfoTabProps {
  onFieldChange?: (name: string, value: string) => void;
  isLoading?: boolean; // ✅ skeleton trigger
}

type ValuesState = {
  dataType: string;
  stationNo: string;
  year: string;
  month: string;
  day: string;
};

type SegmentedInputRefs = React.MutableRefObject<
  Array<HTMLInputElement | null>
>;

export default function BasicInfoTab({
  onFieldChange,
  isLoading,
}: BasicInfoTabProps) {
  const { data: session } = useSession();

  const dataTypeRefs = useRef<Array<HTMLInputElement | null>>([]);
  const stationNoRefs = useRef<Array<HTMLInputElement | null>>([]);
  const yearRefs = useRef<Array<HTMLInputElement | null>>([]);
  const monthRefs = useRef<Array<HTMLInputElement | null>>([]);
  const dayRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [values, setValues] = useState<ValuesState>(() => {
    const today = new Date();
    return {
      dataType: "SY",
      stationNo: "",
      year: today.getFullYear().toString().slice(-2),
      month: (today.getMonth() + 1).toString().padStart(2, "0"),
      day: today.getDate().toString().padStart(2, "0"),
    };
  });

  // ✅ push updates to parent, stable callback
  const pushUpdates = useCallback(
    (updates: Partial<ValuesState>) => {
      if (!onFieldChange) return;
      Object.entries(updates).forEach(([name, value]) => {
        onFieldChange(name, value as string);
      });
    },
    [onFieldChange]
  );

  // ✅ avoid double push in StrictMode
  const didInitStation = useRef(false);

  // ✅ set stationNo once session arrives
  useEffect(() => {
    if (didInitStation.current) return;
    const stationId = session?.user?.station?.stationId;
    if (!stationId) return;
    if (values.stationNo) return;

    didInitStation.current = true;

    const newStationNo = stationId.toString().padStart(5, "0");

    // ✅ pure state update only
    setValues((prev) => ({ ...prev, stationNo: newStationNo }));

    // ✅ side-effect outside updater (fixes warning)
    pushUpdates({ stationNo: newStationNo });
  }, [session, values.stationNo, pushUpdates]);

  const handleChange = useCallback(
    (
      name: keyof ValuesState,
      value: string,
      index?: number,
      refs?: SegmentedInputRefs,
      totalSegments?: number
    ) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      pushUpdates({ [name]: value });

      if (
        index !== undefined &&
        refs &&
        totalSegments !== undefined &&
        index < totalSegments - 1 &&
        value.length === 1
      ) {
        refs.current?.[index + 1]?.focus();
      }
    },
    [pushUpdates]
  );

  const handleSegmentedInput = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      index: number,
      refs: SegmentedInputRefs,
      fieldName: keyof ValuesState,
      totalSegments: number
    ) => {
      const val = e.target.value.slice(0, 1);
      const validationPattern = fieldName === "dataType" ? /^[A-Z]?$/ : /^\d?$/;
      if (!validationPattern.test(val) && val !== "") return;

      const updated = (values[fieldName] || "").split("");
      updated[index] = val;
      const newValue = updated.join("");

      handleChange(fieldName, newValue, index, refs, totalSegments);
    },
    [values, handleChange]
  );

  if (isLoading) {
    return <BasicInfoSkeleton />;
  }

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-lg font-semibold text-slate-700 flex items-center">
        <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 4h6v6h-6z" />
            <path d="M4 14h6v6H4z" />
            <path d="M17 17h3v3h-3z" />
            <path d="M4 4h6v6H4z" />
          </svg>
        </span>
        Basic Information
      </h2>

      <Card className="bg-blue-50 rounded-xl border border-blue-200">
        <CardContent className="p-6">
          <div className="flex flex-wrap justify-between gap-8">
            {/* Data Type */}
            <div className="flex flex-col">
              <Label className="text-sm font-medium text-blue-500 mb-2">
                DATA TYPE
              </Label>
              <div className="flex gap-1">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Input
                    key={`dataType-${i}`}
                    maxLength={1}
                    readOnly
                    ref={(node) => {
                      dataTypeRefs.current[i] = node;
                    }}
                    className="w-12 bg-white text-center"
                    value={values.dataType?.[i] || ""}
                    onChange={(e) =>
                      handleSegmentedInput(e, i, dataTypeRefs, "dataType", 2)
                    }
                  />
                ))}
              </div>
            </div>

            {/* Station No */}
            <div className="flex flex-col">
              <Label className="text-sm font-medium text-blue-500 mb-2">
                STATION NO.
              </Label>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Input
                    key={`stationNo-${i}`}
                    maxLength={1}
                    readOnly
                    ref={(node) => {
                      stationNoRefs.current[i] = node;
                    }}
                    className="w-12 bg-white text-center"
                    value={values.stationNo?.[i] || ""}
                    onChange={(e) =>
                      handleSegmentedInput(e, i, stationNoRefs, "stationNo", 5)
                    }
                  />
                ))}
              </div>
            </div>

            {/* Station Name */}
            <div className="flex flex-col flex-1 min-w-[180px]">
              <Label className="text-sm font-medium text-blue-500 mb-2">
                STATION NAME
              </Label>
              <Input
                id="stationName"
                name="stationName"
                value={session?.user?.station?.name || ""}
                className="bg-white"
                readOnly
              />
            </div>

            {/* Year */}
            <div className="flex flex-col">
              <Label className="text-sm font-medium text-blue-500 mb-2">
                YEAR
              </Label>
              <div className="flex gap-1">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Input
                    key={`year-${i}`}
                    maxLength={1}
                    readOnly
                    ref={(node) => {
                      yearRefs.current[i] = node;
                    }}
                    className="w-12 bg-white text-center"
                    value={values.year?.[i] || ""}
                    onChange={(e) =>
                      handleSegmentedInput(e, i, yearRefs, "year", 2)
                    }
                  />
                ))}
              </div>
            </div>

            {/* Month */}
            <div className="flex flex-col">
              <Label className="text-sm font-medium text-blue-500 mb-2">
                MONTH
              </Label>
              <div className="flex gap-1">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Input
                    key={`month-${i}`}
                    maxLength={1}
                    readOnly
                    ref={(node) => {
                      monthRefs.current[i] = node;
                    }}
                    className="w-12 bg-white text-center"
                    value={values.month?.[i] || ""}
                    onChange={(e) =>
                      handleSegmentedInput(e, i, monthRefs, "month", 2)
                    }
                  />
                ))}
              </div>
            </div>

            {/* Day */}
            <div className="flex flex-col">
              <Label className="text-sm font-medium text-blue-500 mb-2">
                DAY
              </Label>
              <div className="flex gap-1">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Input
                    key={`day-${i}`}
                    maxLength={1}
                    readOnly
                    ref={(node) => {
                      dayRefs.current[i] = node;
                    }}
                    className="w-12 bg-white text-center"
                    value={values.day?.[i] || ""}
                    onChange={(e) =>
                      handleSegmentedInput(e, i, dayRefs, "day", 2)
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ================= Skeleton ================= */

function BasicInfoSkeleton() {
  const pill = "h-10 w-12 bg-gray-200 rounded-md";
  return (
    <div className="space-y-4 mb-6 animate-pulse">
      {/* header skeleton */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200" />
        <div className="h-5 w-48 bg-gray-200 rounded-md" />
      </div>

      <Card className="bg-blue-50 rounded-xl border border-blue-200">
        <CardContent className="p-6">
          <div className="flex flex-wrap justify-between gap-8">
            {/* Data Type skeleton */}
            <div className="flex flex-col gap-2">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="flex gap-1">
                <div className={pill} />
                <div className={pill} />
              </div>
            </div>

            {/* Station No skeleton */}
            <div className="flex flex-col gap-2">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={pill} />
                ))}
              </div>
            </div>

            {/* Station name skeleton */}
            <div className="flex flex-col flex-1 min-w-[180px] gap-2">
              <div className="h-4 w-28 bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded-md" />
            </div>

            {/* Year skeleton */}
            <div className="flex flex-col gap-2">
              <div className="h-4 w-12 bg-gray-200 rounded" />
              <div className="flex gap-1">
                <div className={pill} />
                <div className={pill} />
              </div>
            </div>

            {/* Month skeleton */}
            <div className="flex flex-col gap-2">
              <div className="h-4 w-14 bg-gray-200 rounded" />
              <div className="flex gap-1">
                <div className={pill} />
                <div className={pill} />
              </div>
            </div>

            {/* Day skeleton */}
            <div className="flex flex-col gap-2">
              <div className="h-4 w-10 bg-gray-200 rounded" />
              <div className="flex gap-1">
                <div className={pill} />
                <div className={pill} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
