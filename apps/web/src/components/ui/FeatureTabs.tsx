export type FeatureTab<T extends string> = {
  id: T;
  label: string;
  disabled?: boolean;
};
export function FeatureTabs<T extends string>({
  tabs,
  value,
  onChange,
  label = "Seções",
}: {
  tabs: FeatureTab<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
}) {
  return (
    <div
      className="flex gap-2 overflow-x-auto border-b"
      role="tablist"
      aria-label={label}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          disabled={tab.disabled}
          className={`min-h-11 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-semibold transition disabled:opacity-40 ${value === tab.id ? "border-emerald-700 text-emerald-800" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
