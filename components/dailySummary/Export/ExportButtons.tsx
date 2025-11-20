import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonsProps {
  disabled: boolean;
  onExportCSV: () => void;
  onExportTXT: () => void;
}

export const ExportButtons = ({
  disabled,
  onExportCSV,
  onExportTXT,
}: ExportButtonsProps) => (
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
    <Button
      variant="outline"
      size="sm"
      onClick={onExportCSV}
      className="flex items-center justify-center gap-2 hover:bg-blue-50 border-blue-300 text-blue-700 w-full sm:w-auto"
      disabled={disabled}
    >
      <Download className="h-4 w-4" />
      <span className="whitespace-nowrap text-xs sm:text-sm">Export CSV</span>
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={onExportTXT}
      className="flex items-center justify-center gap-2 hover:bg-blue-50 border-blue-300 text-blue-700 w-full sm:w-auto"
      disabled={disabled}
    >
      <Download className="h-4 w-4" />
      <span className="whitespace-nowrap text-xs sm:text-sm">Export TXT</span>
    </Button>
  </div>
);
