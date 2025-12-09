"use client";

import { useRef } from "react";
import SecondCardTable, { type SecondCardTableHandle } 
  from "@/components/second-card-table/SecondCardTable";

export default function SecondCardClient() {
  const ref = useRef<SecondCardTableHandle>(null);
  return <SecondCardTable ref={ref} />;
}
