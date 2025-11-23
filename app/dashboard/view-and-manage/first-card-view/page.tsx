"use client";

import { forwardRef, type Ref } from "react";
import FirstCardTable, { type FirstCardTableHandle } from "@/components/first-card-table/FirstCardTable";

const FirstCardViewPage = forwardRef<FirstCardTableHandle>((props: unknown, ref: Ref<FirstCardTableHandle>) => {
  return (
    <div className=" py-6">
      <FirstCardTable ref={ref} />
    </div>
  );
});

FirstCardViewPage.displayName = "FirstCardViewPage";

export default FirstCardViewPage;
