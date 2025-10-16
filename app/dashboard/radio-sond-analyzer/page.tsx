import { getSession } from "@/lib/getSession";
import { redirect } from "next/navigation";
import RadiosondeAnalyzer from "@/components/RadiosondeAnalyzer";

export default async function RadioSondAnalyzerPage() {
  const session = await getSession();

  if (session?.user?.role === "observer") {
    redirect("/dashboard");
  }

  return (
    <main>
      <RadiosondeAnalyzer />
    </main>
  );
}
