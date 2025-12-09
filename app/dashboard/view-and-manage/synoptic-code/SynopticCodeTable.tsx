"use client";

import { forwardRef } from "react";
import SynopticCodeClient from "./SynopticCodeClient";
import type { SynopticCodeViewHandle } from "./SynopticCodeView";

const SynopticCodeTable = forwardRef<SynopticCodeViewHandle, {}>((props: {}, ref: React.Ref<SynopticCodeViewHandle>) => {
  return (
    <div className="py-6">
      <SynopticCodeClient ref={ref} />
    </div>
  );
});

SynopticCodeTable.displayName = "SynopticCodeTable";

export default SynopticCodeTable;
