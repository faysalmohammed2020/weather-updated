// app/dashboard/data-entry/second-card/page.tsx

export const dynamic = "force-dynamic";

import { getTimeData } from "@/app/actions/time-check";
import SecondCardForm from "@/components/SecondCard/SecondCard";

export default async function Home() {
  let timeInformation = await getTimeData();

  if (!Array.isArray(timeInformation)) {
    timeInformation = [];
  }

  return (
    <main className="w-full py-4 px-4">
      <SecondCardForm timeInfo={timeInformation} />
    </main>
  );
}