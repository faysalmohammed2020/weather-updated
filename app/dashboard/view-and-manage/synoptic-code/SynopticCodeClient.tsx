"use client";

import { useRef } from "react";
import SynopticCodeView, {
  type SynopticCodeViewHandle,
} from "./SynopticCodeView";

export default function SynopticCodeClient() {
  const ref = useRef<SynopticCodeViewHandle>(null);

  return <SynopticCodeView ref={ref} />;
}
