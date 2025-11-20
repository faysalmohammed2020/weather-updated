export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/getSession";
import { UserTable } from "./user-table";

const UserPage = async () => {
  const session = await getSession();

  // ?? Block access if user role is observer
  if (session?.user?.role === "observer") {
    redirect("/dashboard"); // optional: show 403 page instead
  }

  return (
    <>
      <UserTable />
    </>
  );
};

export default UserPage;
