"use client";

import { forwardRef } from "react";
import SynopticCodeClient from "./SynopticCodeClient";
import type { SynopticCodeViewHandle } from "./SynopticCodeView";

type SynopticCodeTableProps = React.ComponentProps<typeof SynopticCodeClient>;

const SynopticCodeTable = forwardRef<SynopticCodeViewHandle, SynopticCodeTableProps>((props, ref) => {
  return (
    <div className="py-6">
      <SynopticCodeClient ref={ref} {...props} />
    </div>
  );
});

SynopticCodeTable.displayName = "SynopticCodeTable";

export default SynopticCodeTable;
