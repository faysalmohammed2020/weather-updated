"use client";

import { forwardRef } from "react";
import SynopticCodeView, {
  type SynopticCodeViewHandle,
} from "./SynopticCodeView";

const SynopticCodeClient = forwardRef<SynopticCodeViewHandle, {}>((props: {}, ref: React.Ref<SynopticCodeViewHandle>) => {
  return <SynopticCodeView ref={ref} />;
});

SynopticCodeClient.displayName = "SynopticCodeClient";

export default SynopticCodeClient;
