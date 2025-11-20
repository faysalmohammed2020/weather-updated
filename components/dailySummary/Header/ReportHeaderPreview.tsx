import type { DailySummaryHeaderInfo } from "@/lib/types/dailySummary";

interface ReportHeaderPreviewProps {
  headerInfo: DailySummaryHeaderInfo;
}

export const ReportHeaderPreview = ({
  headerInfo,
}: ReportHeaderPreviewProps) => (
  <div className="mb-4 print:mb-2">
    <div className="text-center border-b-2 border-blue-200 bg-gradient-to-b from-blue-50 to-white py-6 print:py-3 rounded-t-lg">
      <div className="flex flex-wrap justify-center gap-6 sm:gap-10 max-w-5xl mx-auto">
        <div className="text-left">
          <div className="font-bold text-base mb-2 text-gray-600">DATA TYPE</div>
          <div className="text-3xl font-black tracking-widest text-blue-700">
            {headerInfo.dataType}
          </div>
        </div>
        <div className="text-left">
          <div className="font-bold text-base mb-2 text-gray-600">STATION</div>
          <div className="text-3xl font-black tracking-widest text-blue-700">
            {headerInfo.stationNo}
          </div>
        </div>
        <div className="text-left">
          <div className="font-bold text-base mb-2 text-gray-600">YEAR</div>
          <div className="text-3xl font-black tracking-widest text-blue-700">
            {headerInfo.year}
          </div>
        </div>
        <div className="text-left">
          <div className="font-bold text-base mb-2 text-gray-600">MONTH</div>
          <div className="text-3xl font-black tracking-widest text-blue-700">
            {headerInfo.month}
          </div>
        </div>
        <div className="text-left">
          <div className="font-bold text-base mb-2 text-gray-600">DAY</div>
          <div className="text-3xl font-black tracking-widest text-blue-700">
            {headerInfo.day}
          </div>
        </div>
      </div>
    </div>
  </div>
);
