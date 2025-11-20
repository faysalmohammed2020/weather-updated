import RadiosondeAnalyzer from "@/components/radio-sond-analyzer/RadiosondeAnalyzer";
import { getSession } from "@/lib/getSession";
import { redirect } from "next/navigation";


export default async function RadioSondAnalyzerPage() {
  const session = await getSession();

  if (session?.user?.role === "observer") {
    redirect("/dashboard");
  }

  return (
    <main>
      <RadiosondeAnalyzer/>
    </main>
  );
}
