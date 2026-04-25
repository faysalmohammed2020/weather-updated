"use client";

import { forwardRef } from "react";
import FirstCardClient from "./FirstCardClient";
import type { FirstCardTableHandle } from "@/components/first-card-table/FirstCardTable";

interface FirstCardTableProps {
  filters?: {
    startDate: string;
    endDate: string;
    stationFilter: string;
  };
  hideFilters?: boolean;
}

const FirstCardTable = forwardRef<FirstCardTableHandle, FirstCardTableProps>((props, ref) => {
  return (
    <div className="py-6">
      <FirstCardClient ref={ref} {...props} />
    </div>
  );
});

FirstCardTable.displayName = "FirstCardTable";

export default FirstCardTable;
