import Sidebar from "./../../components/sidebar";
import { LocationProvider } from "@/contexts/divisionContext";
import { HourProvider } from "@/contexts/hourContext";
import Profile from "@/components/profile";
import { ImpersonationBanner } from "@/components/impersonation-banner";
import AuthSessionProvider from "@/lib/session-provider"; // ✅ add this

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthSessionProvider>
      <div className="flex fixed size-full bg-gray-50">
        <Sidebar />
        <div className="flex w-full flex-col overflow-hidden">
          <div className="bg-blue-400 flex flex-col p-2 items-end">
            <Profile />
          </div>

          <div className="grow overflow-y-auto relative">
            <ImpersonationBanner />
            <LocationProvider>
              <HourProvider>{children}</HourProvider>
            </LocationProvider>
          </div>
        </div>
      </div>
    </AuthSessionProvider>
  );
};

export default DashboardLayout;
