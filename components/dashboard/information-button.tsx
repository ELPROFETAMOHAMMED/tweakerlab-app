"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TvMinimal,
} from "lucide-react";
import { Separator } from "../ui/separator";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { PCInfo } from "@/types/pc-info";
import InformationDialog from "./dialog-tabs/information-dialog";

interface InformationButtonProps {
  variant:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";

  className?: string;
  pcInfo: PCInfo | null;
}

export default function InformationButton({
  variant,
  className,
  pcInfo,
}: InformationButtonProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          className={cn("flex items-center ", className)}
        >
          <TvMinimal className="w-4 h-4 ml-2" />
          <Separator orientation="vertical" className="h-2" />
          <span>My Pc</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-6xl h-[85vh] p-0">
        <DialogTitle className="sr-only">System Information</DialogTitle>
        <InformationDialog pcInfo={pcInfo} />
      </DialogContent>
    </Dialog>
  );
}
