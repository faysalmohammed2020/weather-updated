"use client";

import { forwardRef } from "react";
import FirstCardTable, {
  type FirstCardTableHandle,
} from "@/components/first-card-table/FirstCardTable";

type FirstCardClientProps = React.ComponentProps<typeof FirstCardTable>;

const FirstCardClient = forwardRef<FirstCardTableHandle, FirstCardClientProps>((props, ref) => {
  return <FirstCardTable ref={ref} {...props} />;
});

FirstCardClient.displayName = "FirstCardClient";

export default FirstCardClient;
