"use client";

import { forwardRef } from "react";
import SecondCardTable from "@/components/second-card-table/SecondCardTable";
import type { SecondCardTableHandle } from "@/components/second-card-table/SecondCardTable";

const SecondCardTableWrapper = forwardRef<SecondCardTableHandle, {}>((props: {}, ref: React.Ref<SecondCardTableHandle>) => {
  return (
    <div className="py-6">
      <SecondCardTable ref={ref} />
    </div>
  );
});

SecondCardTableWrapper.displayName = "SecondCardTable";

export default SecondCardTableWrapper;
