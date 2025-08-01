import { User } from "@/types/auth";
import InformationButton from "../information-button";
import { formatShortDate } from "@/lib/helper/format-date";
import { PCInfo } from "@/types/pc-info";
import { LogOutIcon } from "lucide-react";
import DiagnosticPcButton from "../dignostic-pc-button";

interface DashboardHeaderProps {
  profile: User;
  lastScanPc: string | null;
  pcInfo: PCInfo | null;
}

export default function DashboardHeader({
  profile,
  lastScanPc,
  pcInfo,
}: DashboardHeaderProps) {
  return (
    <div className="flex min-w-screen h-20 backdrop-blur-sm justify-between">
      <div className="flex flex-col justify-start">
        <h1 className="text-2xl font-semibold">
          Welcome back{profile?.full_name ? `, ${profile?.full_name}` : ""}!
        </h1>
        <p className="text-xs text-muted-foreground">
          Last scan pc:{" "}
          <span className="font-semibold">
            {lastScanPc ? formatShortDate(lastScanPc) : "Never scanned"}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <InformationButton variant={"outline"} pcInfo={pcInfo} />
        <DiagnosticPcButton variant={"outline"} />
      </div>
    </div>
  );
}
