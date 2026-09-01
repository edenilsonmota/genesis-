import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useMemo, useState } from "react";

export type SelectOption = { id: number | string; label: string };
type Props = {
  label: string;
  options: SelectOption[];
  value: SelectOption | null;
  onChange: (option: SelectOption | null) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Pesquisar...",
  disabled,
}: Props) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    return normalized
      ? options.filter((option) =>
          option.label.toLocaleLowerCase("pt-BR").includes(normalized),
        )
      : options;
  }, [options, query]);
  return (
    <Combobox
      value={value}
      onChange={onChange}
      disabled={disabled}
      onClose={() => setQuery("")}
    >
      <div className="relative">
        <label className="mb-1 block text-sm font-semibold">{label}</label>
        <ComboboxInput
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
          displayValue={(option: SelectOption | null) => option?.label ?? ""}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
        />
        <ComboboxOptions
          anchor="bottom"
          className="z-50 mt-1 max-h-64 w-(--input-width) overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg empty:invisible"
        >
          {filtered.map((option) => (
            <ComboboxOption
              key={option.id}
              value={option}
              className="cursor-pointer rounded-md px-3 py-2 text-sm data-focus:bg-emerald-50 data-selected:font-semibold data-selected:text-emerald-800"
            >
              {option.label}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
