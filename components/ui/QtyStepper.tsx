import { cn } from "@/lib/utils";

export function QtyStepper({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 bg-surface-container rounded-full px-2 py-1", className)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-8 h-8 rounded-full bg-surface-container-lowest text-on-surface flex items-center justify-center shadow-sm active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined text-[16px]">remove</span>
      </button>
      <span className="font-label-lg text-label-lg text-on-surface min-w-[16px] text-center">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-8 h-8 rounded-full bg-surface-container-lowest text-on-surface flex items-center justify-center shadow-sm active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
      </button>
    </div>
  );
}
