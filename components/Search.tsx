"use client";

type SearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function Search({
  value,
  onChange,
  placeholder = "Cari...",
}: SearchProps) {
  return (
    <div className="relative w-full">
      <svg
        className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm10 2-5.5-5.5"
        />
      </svg>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-zinc-300 bg-white pl-10 pr-4 text-sm text-zinc-700 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
      />
    </div>
  );
}