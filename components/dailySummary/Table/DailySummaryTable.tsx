import { Button } from "@/components/ui/button";
import { ReportHeaderPreview } from "@/components/dailySummary/Header/ReportHeaderPreview";
import { DailySummaryTableHeader } from "@/components/dailySummary/Table/DailySummaryTableHeader";
import { DailySummaryTableRow } from "@/components/dailySummary/Table/DailySummaryTableRow";
import type {
  DailySummaryHeaderInfo,
  DailySummaryRecord,
  DailySummaryUser,
} from "@/lib/types/dailySummary";
import type { Station } from "@/lib/types/station";
import { LineChart, Loader2 } from "lucide-react";

interface DailySummaryTableProps {
  data: DailySummaryRecord[];
  headerInfo: DailySummaryHeaderInfo;
  stations: Station[];
  user?: DailySummaryUser;
  isLoading: boolean;
  onRetry: () => void;
  onEditRecord: (record: DailySummaryRecord) => void;
}

export const DailySummaryTable = ({
  data,
  headerInfo,
  stations,
  user,
  isLoading,
  onRetry,
  onEditRecord,
}: DailySummaryTableProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <span className="ml-3 text-lg text-gray-700">
          Loading daily summary data...
        </span>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex justify-center items-center h-64 bg-blue-50/50 rounded-lg border-2 border-dashed border-blue-200">
        <div className="text-center p-8">
          <LineChart className="mx-auto mb-5 text-blue-400" size={56} />
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            No Data Available
          </h3>
          <p className="text-lg text-gray-600 mb-5">
            There is no daily summary data available for the selected filters.
          </p>
          <Button
            variant="outline"
            className="bg-white text-blue-700 border-blue-300 hover:bg-blue-50 text-base"
            onClick={onRetry}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto print:overflow-visible">
      <ReportHeaderPreview headerInfo={headerInfo} />
      <div className="border-2 border-blue-200 rounded-lg shadow-lg overflow-x-auto print:overflow-visible bg-white">
        <table className="w-full border-collapse min-w-[1800px] text-base text-gray-800">
          <DailySummaryTableHeader />
          <tbody className="divide-y divide-blue-100 text-center font-mono">
            {data.map((record) => (
              <DailySummaryTableRow
                key={record.id}
                record={record}
                stations={stations}
                user={user}
                onEdit={onEditRecord}
              />
            ))}
          </tbody>
        </table>
        <div className="text-right text-sm text-blue-600 mt-2 pr-4 pb-2 print:hidden">
          Generated: {new Date().toISOString()}
        </div>
      </div>
    </div>
  );
};
