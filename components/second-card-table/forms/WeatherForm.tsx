"use client";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import CloudFields from "./CloudFields";
import SignificantCloudFields from "./SignificantCloudFields";
import RainFields from "./RainFields";
import WindFields from "./WindFields";

export interface WeatherFormValues {
  totalCloudAmount: string;
  lowCloudDirection: string;
  lowCloudHeight: string;
  lowCloudForm: string;
  lowCloudAmount: string;
  mediumCloudDirection: string;
  mediumCloudHeight: string;
  mediumCloudForm: string;
  mediumCloudAmount: string;
  highCloudDirection: string;
  highCloudHeight: string;
  highCloudForm: string;
  highCloudAmount: string;
  windDirection: string;
  layer1Form: string;
  layer1Amount: string;
  layer2Form: string;
  layer2Amount: string;
  layer3Form: string;
  layer3Amount: string;
  layer4Form: string;
  layer4Amount: string;
  layer1Height: string;
  layer2Height: string;
  layer3Height: string;
  layer4Height: string;
  rainfallSincePrevious: string;
  rainfallLast24Hours: string;
  windSpeed: string;
  rainfallDuringPrevious: string;
  windFirstAnemometer: string;
  windSecondAnemometer: string;
  observerInitial: string;
  rainfallTimeStart: string;
  rainfallTimeEnd: string;
  rainfallType?: string;
  observationUtcTime?: string;
  rainfallTimeSlots: Array<{
    id: string;
    timeStart: string;
    timeEnd: string;
  }>;
}

interface WeatherFormProps {
  onSubmit: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

const WeatherForm = ({ onSubmit, onCancel, isSaving }: WeatherFormProps) => (
  <form onSubmit={onSubmit}>
    <div className="grid grid-cols-1 gap-4 py-4 max-h-[65vh] overflow-y-auto pr-2">
      <CloudFields />
      <SignificantCloudFields />
      <RainFields />
      <WindFields />
    </div>

    <DialogFooter className="mt-4 gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 bg-transparent"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isSaving}
        className="bg-linear-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-md transition-all"
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Save Changes
          </>
        )}
      </Button>
    </DialogFooter>
  </form>
);

export default WeatherForm;
