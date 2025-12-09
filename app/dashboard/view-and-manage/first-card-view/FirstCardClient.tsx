"use client";

import { forwardRef } from "react";
import FirstCardTable, {
  type FirstCardTableHandle,
} from "@/components/first-card-table/FirstCardTable";

const FirstCardClient = forwardRef<FirstCardTableHandle, {}>((props: {}, ref: React.Ref<FirstCardTableHandle>) => {
  return <FirstCardTable ref={ref} />;
});

FirstCardClient.displayName = "FirstCardClient";

export default FirstCardClient;
