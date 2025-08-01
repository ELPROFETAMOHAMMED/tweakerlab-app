export default function InfoRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value?: string | number | boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border last:border-b-0">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <span
        className={`text-sm font-mono ${
          highlight ? "text-foreground font-medium" : "text-muted-foreground"
        }`}
      >
        {value?.toString() || "N/A"}
      </span>
    </div>
  );
}
