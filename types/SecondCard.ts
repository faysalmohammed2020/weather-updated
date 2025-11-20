// types/SecondCard.ts

export type WeatherObservationFormData = {
  clouds: {
    low: {
      form?: string;
      amount?: string;
      height?: string;
      direction?: string;
    };
    medium: {
      form?: string;
      amount?: string;
      height?: string;
      direction?: string;
    };
    high: {
      form?: string;
      amount?: string;
      height?: string;
      direction?: string;
    };
  };

  totalCloud: {
    "total-cloud-amount"?: string;
  };

  significantClouds: {
    layer1: { form?: string; amount?: string; height?: string };
    layer2: { form?: string; amount?: string; height?: string };
    layer3: { form?: string; amount?: string; height?: string };
    layer4: { form?: string; amount?: string; height?: string };
  };

  rainfall: {
    timeSlots?: { id: string; timeStart: string; timeEnd: string }[];
    "date-start"?: string;
    "date-end"?: string;
    "since-previous"?: string;
    "during-previous"?: string;
    "last-24-hours"?: string;
    rainfallType?: "continuous" | "intermittent" | "";
  };

  wind: {
    "first-anemometer"?: string;
    "second-anemometer"?: string;
    speed?: string;
    "wind-direction"?: string;
  };

  observer: {
    "observer-initial"?: string;
    "observation-time"?: string;
  };

  metadata: {
    stationId?: string;
    submittedAt?: string;
  };
};
