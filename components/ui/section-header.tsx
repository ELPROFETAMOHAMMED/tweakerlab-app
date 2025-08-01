import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { Info, LucideProps } from "lucide-react";
import { ComponentType } from "react";

interface SectionHeaderProps {
  icon?: ComponentType<LucideProps>;
  title: string;
  tooltip: string;
  className?: string;
}

export default function SectionHeader({
  icon: IconComponent,
  title,
  tooltip,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center gap-3 mb-4 ${className}`}>
      {IconComponent && (
        <IconComponent className="w-5 h-5 text-muted-foreground" />
      )}
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="w-4 h-4 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </div>
  );
}
