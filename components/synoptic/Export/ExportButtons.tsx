import { Button } from "@/components/ui/button";
import { Download, Radio } from "lucide-react";

interface ExportButtonsProps {
  disabled: boolean;
  onExportCSV: () => void;
  onExportTXT: () => void;
  onExportTAC: () => void;
}

export const ExportButtons = ({
  disabled,
  onExportCSV,
  onExportTXT,
  onExportTAC,
}: ExportButtonsProps) => (
  <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
    <Button
      variant="outline"
      className="flex items-center justify-center gap-2 text-blue-700 border-blue-300 hover:bg-blue-50 px-3 py-2 bg-transparent"
      onClick={onExportCSV}
      disabled={disabled}
    >
      <Download size={18} className="shrink-0" />
      <span className="text-sm sm:text-base whitespace-nowrap">Export CSV</span>
    </Button>
    <Button
      variant="outline"
      className="flex items-center justify-center gap-2 text-green-700 border-green-300 hover:bg-green-50 px-3 py-2 bg-transparent"
      onClick={onExportTXT}
      disabled={disabled}
    >
      <Download size={18} className="shrink-0" />
      <span className="text-sm sm:text-base whitespace-nowrap">Export TXT</span>
    </Button>
    <Button
      variant="outline"
      className="flex items-center justify-center gap-2 text-orange-700 border-orange-300 hover:bg-orange-50 px-3 py-2 bg-transparent"
      onClick={onExportTAC}
      disabled={disabled}
    >
      <Radio size={18} className="shrink-0" />
      <span className="text-sm sm:text-base whitespace-nowrap">Export TAC</span>
    </Button>
  </div>
);
