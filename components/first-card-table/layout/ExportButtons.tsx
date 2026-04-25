"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonsProps {
  disabled: boolean;
  onExportCsv: () => void;
  onExportTxt: () => void;
}

const ExportButtons = ({
  disabled,
  onExportCsv,
  onExportTxt,
}: ExportButtonsProps) => (
  <div className="flex items-center gap-2">
    <Button
      variant="outline"
      size="sm"
      onClick={onExportCsv}
      className="flex items-center gap-2 hover:bg-green-50 border-green-200 text-green-700 w-full sm:w-auto justify-center sm:justify-start"
      disabled={disabled}
    >
      <Download className="h-4 w-4 shrink-0" />
      <span className="whitespace-nowrap">Export CSV</span>
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={onExportTxt}
      className="flex items-center gap-2 hover:bg-blue-50 border-blue-200 text-blue-700 w-full sm:w-auto justify-center sm:justify-start"
      disabled={disabled}
    >
      <Download className="h-4 w-4 shrink-0" />
      <span className="whitespace-nowrap">Export TXT</span>
    </Button>
  </div>
);

export default ExportButtons;

