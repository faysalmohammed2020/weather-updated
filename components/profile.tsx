"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState, useEffect } from "react";

const Profile = () => {
  const router = useRouter();
  const { data: session, status } = useSession(); // ✅ NextAuth
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch (optional but ok)
  useEffect(() => {
    setIsClient(true);
  }, []);

  const isLoading = status === "loading";

  if (!isClient) {
    return (
      <div className="flex items-center gap-6 h-12">
        <div className="flex flex-col">
          <span className="whitespace-nowrap text-xs md:text-md md:font-medium text-white uppercase text-shadow">
            Loading...
          </span>
          <span className="uppercase text-xs md:text-md text-white text-shadow">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 h-12 pr-4">
      {isLoading ? (
        <div className="flex flex-col">
          <span className="whitespace-nowrap text-xs md:text-md md:font-medium text-white uppercase text-shadow">
            Loading...
          </span>
          <span className="uppercase text-xs md:text-md text-white text-shadow">
            Loading...
          </span>
        </div>
      ) : (
        <div className="flex flex-col">
          <span className="whitespace-nowrap text-xs md:text-md md:font-medium text-white uppercase text-shadow">
            {session?.user?.name ?? "Unknown"} ({session?.user?.role ?? "observer"})
          </span>
          <span className="uppercase text-xs md:text-md text-white text-shadow">
            {session?.user?.station?.name ?? "N/A"} ({session?.user?.station?.stationId ?? "N/A"})
          </span>
        </div>
      )}

      <Button
        variant="secondary"
        className="h-8 w-17 md:w-24 flex items-center gap-2"
        onClick={async () => {
          // ✅ NextAuth signOut
          await signOut({ redirect: false });
          router.replace("/sign-in");
          router.refresh();
        }}
      >
        <LogOut className="text-xs md:text-md" />
        <span className="text-xs md:text-md">Logout</span>
      </Button>
    </div>
  );
};

export default Profile;
