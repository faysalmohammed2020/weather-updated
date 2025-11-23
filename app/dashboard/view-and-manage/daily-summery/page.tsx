"use client";

import { forwardRef, type ForwardedRef } from "react";
import DailySummaryView from "./DailySummaryView";
import type { DailySummaryViewHandle } from "./DailySummaryView";

export default forwardRef(function DailySummeryPage(props: unknown, ref: ForwardedRef<DailySummaryViewHandle>) {
  return <DailySummaryView ref={ref} />;
});
