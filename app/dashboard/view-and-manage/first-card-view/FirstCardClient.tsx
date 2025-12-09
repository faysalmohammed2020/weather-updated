"use client";

import { useRef } from "react";
import FirstCardTable, {
  type FirstCardTableHandle,
} from "@/components/first-card-table/FirstCardTable";

export default function FirstCardClient() {
  const ref = useRef<FirstCardTableHandle>(null);

  return <FirstCardTable ref={ref} />;
}
