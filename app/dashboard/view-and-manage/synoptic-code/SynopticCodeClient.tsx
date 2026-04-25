"use client";

import { forwardRef } from "react";
import SynopticCodeView, {
  type SynopticCodeViewHandle,
} from "./SynopticCodeView";

type SynopticCodeClientProps = React.ComponentProps<typeof SynopticCodeView>;

const SynopticCodeClient = forwardRef<SynopticCodeViewHandle, SynopticCodeClientProps>((props, ref) => {
  return <SynopticCodeView ref={ref} {...props} />;
});

SynopticCodeClient.displayName = "SynopticCodeClient";

export default SynopticCodeClient;
