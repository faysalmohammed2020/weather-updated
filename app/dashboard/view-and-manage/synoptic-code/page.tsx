"use client";

import { forwardRef, type Ref } from "react";
import SynopticCodeView, { type SynopticCodeViewHandle } from "./SynopticCodeView";

export default forwardRef<SynopticCodeViewHandle>(function Page(props: unknown, ref: Ref<SynopticCodeViewHandle>) {
  return <SynopticCodeView ref={ref} />;
});
