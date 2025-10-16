import { getSession } from "@/lib/getSession";
import { redirect } from "next/navigation";

import NetCDFCsvHeatmap from "@/components/NetCDFCsvHeatmap";
import NetCDFVisualizer from "@/components/NetCDFVisualizer";
import UploadAndVisualize from "@/components/UploadAndVisualize";
import UploadAndVisualizeCsv from "@/components/UploadAndVisualizeCsv";

export default async function NetCDFVisualizerPage() {
  const session = await getSession();

  if (session?.user?.role === "observer") {
    redirect("/dashboard");
  }

  return (
    <div className="">
      <NetCDFVisualizer />
      {/* <UploadAndVisualize />
      <NetCDFCsvHeatmap />
      <UploadAndVisualizeCsv /> */}
    </div>
  );
}
