"use client";

import { forwardRef } from "react";
import FirstCardClient from "./FirstCardClient";
import type { FirstCardTableHandle } from "@/components/first-card-table/FirstCardTable";

const FirstCardTable = forwardRef<FirstCardTableHandle, {}>((props: {}, ref: React.Ref<FirstCardTableHandle>) => {
  return (
    <div className="py-6">
      <FirstCardClient ref={ref} />
    </div>
  );
});

FirstCardTable.displayName = "FirstCardTable";

export default FirstCardTable;
