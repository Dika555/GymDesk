type StatCardProps = {
  title: string;
  value: number;
  description?: string;
  icon?: React.ReactNode;
};

export default function StatCard({
  title,
  value,
  description,
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-600">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            {value}
          </p>
        </div>

        {icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
            {icon}
          </div>
        )}
      </div>

      {description && (
        <p className="mt-4 text-sm leading-5 text-zinc-600">
          {description}
        </p>
      )}
    </div>
  );
}