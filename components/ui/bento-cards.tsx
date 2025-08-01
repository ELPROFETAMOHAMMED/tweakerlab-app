export default function BentoCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`
        p-4 transform transition-all duration-500 ease-out
        hover:bg-background/20 rounded-lg
        ${className}
      `}
      style={{
        animationDelay: `${delay}ms`,
        animation: "fadeInUp 0.6s ease-out forwards",
      }}
    >
      {children}
    </div>
  );
}
