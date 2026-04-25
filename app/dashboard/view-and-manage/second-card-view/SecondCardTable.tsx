"use client";

import { forwardRef } from "react";
import SecondCardTable from "@/components/second-card-table/SecondCardTable";
import type { SecondCardTableHandle } from "@/components/second-card-table/SecondCardTable";

type SecondCardTableWrapperProps = React.ComponentProps<typeof SecondCardTable>;

const SecondCardTableWrapper = forwardRef<SecondCardTableHandle, SecondCardTableWrapperProps>((props, ref) => {
  return (
    <div className="py-6">
      <SecondCardTable ref={ref} {...props} />
    </div>
  );
});

SecondCardTableWrapper.displayName = "SecondCardTable";

export default SecondCardTableWrapper;
