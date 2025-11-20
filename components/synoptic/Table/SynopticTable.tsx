import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Station } from "@/lib/types/station";
import type {
  SynopticHeaderInfo,
  SynopticRecord,
  SynopticUser,
} from "@/lib/types/synoptic";
import { CodeHeaderPreview } from "@/components/synoptic/Header/CodeHeaderPreview";
import { SynopticTableHeader } from "@/components/synoptic/Table/SynopticTableHeader";
import { SynopticTableRow } from "@/components/synoptic/Table/SynopticTableRow";

interface SynopticTableProps {
  data: SynopticRecord[];
  headerInfo: SynopticHeaderInfo;
  stations: Station[];
  user?: SynopticUser;
  isLoading: boolean;
  onRetry: () => void;
  onEditRecord: (record: SynopticRecord) => void;
}

export const SynopticTable = ({
  data,
  headerInfo,
  stations,
  user,
  isLoading,
  onRetry,
  onEditRecord,
}: SynopticTableProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <span className="ml-3 text-lg text-gray-700">
          Loading synoptic data...
        </span>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex justify-center items-center h-64 bg-blue-50/50 rounded-lg border-2 border-dashed border-blue-200">
        <div className="text-center p-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-5 text-blue-400"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M2 8h20" />
            <path d="M6 12h4" />
            <path d="M14 12h4" />
            <path d="M6 16h4" />
            <path d="M14 16h4" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            No Data Available
          </h3>
          <p className="text-lg text-gray-600 mb-5">
            There is no synoptic data available for the selected filters.
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
      <CodeHeaderPreview headerInfo={headerInfo} />
      <div className="border-2 border-blue-200 rounded-lg shadow-lg overflow-x-auto print:overflow-visible bg-white">
        <table className="w-full border-collapse min-w-[1800px] text-base text-gray-800">
          <SynopticTableHeader />
          <tbody className="divide-y divide-blue-100 text-center font-mono">
            {data.map((record) => (
              <SynopticTableRow
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
          Generated:{" "}
          {new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}
        </div>
      </div>
    </div>
  );
};
