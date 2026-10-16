type ExpiringMembership = {
  id: string;
  end_date: string;
  members: {
    name: string;
  } | null;
  membership_plans: {
    name: string;
  } | null;
};

type Props = {
  memberships: ExpiringMembership[];
};

export default function ExpiringMemberships({
  memberships,
}: Props) {
  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    });
  }

  function getRemainingDays(date: string) {
    const today = new Date();
    const endDate = new Date(date);

    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const difference = endDate.getTime() - today.getTime();

    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  }


  return (
    <div className="mt-6 min-w-0 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-zinc-900">
          Membership Akan Berakhir
        </h2>

        <p className="mt-1 text-sm text-zinc-600">
          Member dengan masa membership yang akan segera berakhir.
        </p>
      </div>

      {memberships.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          Tidak ada membership yang akan berakhir dalam waktu dekat.
        </p>
      ) : (
        <div className="max-h-56 w-full min-w-0 overflow-auto rounded-xl border border-zinc-200">
          <table className="w-full min-w-[650px] table-fixed">
            <colgroup>
              <col className="w-[8%]" />
              <col className="w-[27%]" />
              <col className="w-[23%]" />
              <col className="w-[22%]" />
              <col className="w-[20%]" />
            </colgroup>

            <thead className="sticky top-0 z-10 border-b border-zinc-300 bg-zinc-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-700">
                  No.
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-700">
                  Member
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-700">
                  Paket
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-700">
                  Berakhir
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-700">
                  Sisa
                </th>
              </tr>
            </thead>

            <tbody>
              {memberships.map((membership, index) => {
                const remainingDays = getRemainingDays(
                  membership.end_date
                );

                return (
                  <tr
                    key={membership.id}
                    className="border-b border-zinc-200 last:border-b-0 hover:bg-zinc-50"
                  >
                    <td className="px-4 py-4 text-sm font-medium text-zinc-900">
                      {index + 1}
                    </td>

                    <td className="break-words px-4 py-4 text-sm font-medium text-zinc-900">
                      {membership.members?.name ?? "—"}
                    </td>

                    <td className="break-words px-4 py-4 text-sm text-zinc-700">
                      {membership.membership_plans?.name ?? "—"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-700">
                      {formatDate(membership.end_date)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={
                          remainingDays <= 0
                            ? "rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800"
                            : remainingDays <= 7
                              ? "rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800"
                              : "rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800"
                        }
                      >
                        {remainingDays <= 0
                          ? "Berakhir"
                          : `${remainingDays} hari`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}