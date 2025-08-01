"use client"
import { Wrench } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface DiagnosticPCButtonProps {
  variant:
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
  className?: string;

}


export default function DiagnosticPcButton({ variant, className }: DiagnosticPCButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button className={cn(className)} variant={variant}>
            <Wrench className="h-4 w-4 mr-2" />
            Diagnostic PC
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            This will scan your PC and show recommended tweaks based on your PC configuration.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
