import type { SynopticHeaderInfo } from "@/lib/types/synoptic";

interface CodeHeaderPreviewProps {
  headerInfo: SynopticHeaderInfo;
}

const renderDigits = (value: string) =>
  value.split("").map((char, index) => (
    <div
      key={`${char}-${index}`}
      className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-base sm:text-lg font-bold text-blue-700 rounded"
    >
      {char}
    </div>
  ));

export const CodeHeaderPreview = ({ headerInfo }: CodeHeaderPreviewProps) => (
  <div className="mb-4 print:mb-2">
    <div className="text-center border-b-2 border-blue-200 bg-gradient-to-b from-blue-50 to-white py-4 sm:py-6 print:py-3 rounded-t-lg">
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 print:gap-6 max-w-full sm:max-w-lg md:max-w-2xl lg:max-w-5xl mx-auto px-3 sm:px-4">
        <div className="text-left">
          <div className="font-bold text-sm sm:text-base mb-2 text-gray-600">
            DATA TYPE
          </div>
          <div className="flex gap-1 sm:gap-2">{renderDigits(headerInfo.dataType)}</div>
        </div>
        <div className="text-left">
          <div className="font-bold text-sm sm:text-base mb-2 text-gray-600">
            STATION NO.
          </div>
          <div className="flex gap-1 sm:gap-2">
            {renderDigits(headerInfo.stationNo)}
          </div>
        </div>
        <div className="text-left">
          <div className="font-bold text-sm sm:text-base mb-2 text-gray-600">
            YEAR
          </div>
          <div className="flex gap-1 sm:gap-2">{renderDigits(headerInfo.year)}</div>
        </div>
        <div className="text-left">
          <div className="font-bold text-sm sm:text-base mb-2 text-gray-600">
            MONTH
          </div>
          <div className="flex gap-1 sm:gap-2">
            {renderDigits(headerInfo.month)}
          </div>
        </div>
        <div className="text-left">
          <div className="font-bold text-sm sm:text-base mb-2 text-gray-600">
            DAY
          </div>
          <div className="flex gap-1 sm:gap-2">{renderDigits(headerInfo.day)}</div>
        </div>
      </div>
    </div>
  </div>
);
