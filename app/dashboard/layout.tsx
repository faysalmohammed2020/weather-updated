import Sidebar from "./../../components/sidebar";
import { LocationProvider } from "@/contexts/divisionContext";
import { HourProvider } from "@/contexts/hourContext";
import Profile from "@/components/profile";
import { ImpersonationBanner } from "@/components/impersonation-banner";
import { PasswordAgeWarning } from "@/components/password-age-warning";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex fixed size-full bg-gray-50">
      <Sidebar />
      <div className="flex w-full flex-col overflow-hidden">
        <div className="bg-blue-400 flex items-center justify-between gap-4 py-2">
          <div className="w-full max-w-5xl mx-auto rounded-md p-2"></div>
          <Profile />
        </div>

        <div className="grow overflow-y-auto relative">
          <ImpersonationBanner />
          <PasswordAgeWarning />
          <LocationProvider>
            <HourProvider>{children}</HourProvider>
          </LocationProvider>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
