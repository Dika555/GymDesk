import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddMemberMembershipButton from "@/components/members/[id]/AddMemberMembershipButton";
import {
  User,
  ArrowLeft,
  UserRound,
  Phone,
  Mail,
  UsersRound,
  MapPin,
  CalendarDays,
  CreditCard,
  History,
} from "lucide-react";

type MembershipPlan = {
  id: string;
  name: string;
  duration: number;
  price: number;
};

type MembershipWithPlan = {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  plan_id: string;
  membership_plans: MembershipPlan | null;
};

type MemberDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MemberDetailPage({
  params,
}: MemberDetailPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  // ==========================================
  // AMBIL DATA MEMBER
  // ==========================================

  const { data: member, error: memberError } =
    await supabase
      .from("members")
      .select(`
        id,
        name,
        phone,
        email,
        address,
        gender,
        membership,
        created_at,
        branch_id
      `)
      .eq("id", id)
      .single();

  if (memberError || !member) {
    notFound();
  }

  // ==========================================
  // AMBIL RIWAYAT MEMBERSHIP
  // ==========================================

  const { data: membershipData, error: membershipError } =
    await supabase
      .from("memberships")
      .select(`
        id,
        start_date,
        end_date,
        status,
        plan_id,
        membership_plans!memberships_plan_id_fkey (
          id,
          name,
          duration,
          price
        )
      `)
      .eq("member_id", id)
      .order("start_date", { ascending: false });

  if (membershipError) {
    console.error("Gagal mengambil riwayat membership.");
  }

  const memberships =
    membershipData as MembershipWithPlan[] | null;

  // ==========================================
  // AMBIL RIWAYAT KUNJUNGAN
  // ==========================================

  const { data: visits, error: visitsError } =
    await supabase
      .from("visits")
      .select(`
        id,
        visit_date,
        visit_fee,
        payment_method
      `)
      .eq("member_id", id)
      .order("visit_date", { ascending: false });

  if (visitsError) {
    console.error("Gagal mengambil riwayat kunjungan.");
  }

  // ==========================================
  // CARI MEMBERSHIP AKTIF
  // ==========================================

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Jakarta",
  });

  const activeMembership =
    memberships?.find(
      (membership) =>
        membership.status === "active" &&
        membership.end_date >= today
    ) ?? null;

  function isMembershipActive(membership: MembershipWithPlan) {
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Jakarta",
    });

    return (
      membership.status === "active" &&
      membership.end_date >= today
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-6 text-zinc-900 sm:p-8">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <User size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Detail Member
            </h1>

            <p className="mt-1 text-sm text-zinc-500 sm:text-base">
              Informasi profil, membership, dan riwayat aktivitas member.
            </p>
          </div>
        </div>

        <a
          href="/members"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          <ArrowLeft size={16} />
          Kembali ke Members
        </a>
      </div>

      {/* INFORMASI MEMBER */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        {/* Identitas Member */}
        <div className="flex flex-col gap-4 border-b border-zinc-300 pb-5 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600">
            <UserRound size={28} />
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
              {member.name}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Member sejak{" "}
              {new Date(member.created_at).toLocaleDateString("id-ID")}
            </p>
          </div>
        </div>

        {/* Informasi Member */}
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-zinc-100 p-2 text-zinc-600">
              <Phone size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-zinc-500">No. HP</p>
              <p className="mt-1 break-words text-sm font-semibold text-zinc-900">
                {member.phone || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-zinc-100 p-2 text-zinc-600">
              <Mail size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-zinc-500">Email</p>
              <p className="mt-1 break-words text-sm font-semibold text-zinc-900">
                {member.email || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-zinc-100 p-2 text-zinc-600">
              <UsersRound size={18} />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Jenis Kelamin</p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {member.gender || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-zinc-100 p-2 text-zinc-600">
              <CreditCard size={18} />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Membership</p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {activeMembership?.membership_plans?.name ?? "-"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:col-span-2">
            <div className="rounded-xl bg-zinc-100 p-2 text-zinc-600">
              <MapPin size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-zinc-500">Alamat</p>
              <p className="mt-1 break-words text-sm font-semibold text-zinc-900">
                {member.address || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MEMBERSHIP SAAT INI */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-zinc-200 bg-zinc-100 p-3 text-zinc-700">
              <CreditCard size={26} />
            </div>

            <div>
              <h2 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">
                Membership Saat Ini
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Informasi paket membership yang sedang digunakan member.
              </p>
            </div>
          </div>

          <AddMemberMembershipButton
            memberId={member.id}
            branchId={member.branch_id}
          />
        </div>

        {activeMembership ? (
          <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
                  <CreditCard size={22} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-zinc-900">
                    {activeMembership.membership_plans?.name ?? "-"}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    Rp{" "}
                    {activeMembership.membership_plans?.price?.toLocaleString("id-ID") ?? "0"}
                    {" / "}
                    {activeMembership.membership_plans?.duration ?? "-"} bulan
                  </p>
                </div>
              </div>

              <span className="inline-flex w-fit items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                Aktif
              </span>
            </div>

            <div className="mt-5 grid gap-4 border-t border-zinc-200 pt-5 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <CalendarDays size={18} className="mt-0.5 text-zinc-400" />
                <div>
                  <p className="text-sm text-zinc-500">Tanggal Mulai</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900">
                    {new Date(activeMembership.start_date).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays size={18} className="mt-0.5 text-zinc-400" />
                <div>
                  <p className="text-sm text-zinc-500">Tanggal Berakhir</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900">
                    {new Date(activeMembership.end_date).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-5 py-10 text-center">
            <CreditCard size={28} className="mx-auto text-zinc-400" />
            <p className="mt-3 text-sm font-medium text-zinc-700">
              Belum ada membership aktif
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Tambahkan membership untuk member ini melalui tombol di atas.
            </p>
          </div>
        )}
      </div>

      {/* RIWAYAT MEMBERSHIP */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        {/* Judul Section */}
        <div className="flex items-start gap-3 border-b border-zinc-200 pb-5">
          <div className="rounded-xl border border-zinc-200 bg-zinc-100 p-3 text-zinc-700">
            <History size={22} />
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">
              Riwayat Membership
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Daftar paket membership yang pernah digunakan member.
            </p>
          </div>
        </div>

        {/* Tabel Riwayat Membership */}
        <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead className="bg-zinc-100">
                <tr className="border-b-2 border-zinc-200 text-left">
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Paket
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Mulai
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Berakhir
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {memberships && memberships.length > 0 ? (
                  memberships.map((membership) => (
                    <tr
                      key={membership.id}
                      className="transition-colors hover:bg-zinc-50"
                    >
                      <td className="px-4 py-3.5 text-sm font-semibold text-zinc-900">
                        {membership.membership_plans?.name ?? "-"}
                      </td>

                      <td className="px-4 py-3.5 text-sm text-zinc-600">
                        {new Date(membership.start_date).toLocaleDateString("id-ID")}
                      </td>

                      <td className="px-4 py-3.5 text-sm text-zinc-600">
                        {new Date(membership.end_date).toLocaleDateString("id-ID")}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${isMembershipActive(membership)
                            ? "border-green-200 bg-green-50 text-green-700"
                            : membership.status === "active"
                              ? "border-red-200 bg-red-50 text-red-700"
                              : "border-zinc-200 bg-zinc-100 text-zinc-600"
                            }`}
                        >
                          {isMembershipActive(membership)
                            ? "Aktif"
                            : membership.status === "active"
                              ? "Berakhir"
                              : "Tidak Aktif"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-sm text-zinc-500"
                    >
                      Belum ada riwayat membership.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIWAYAT KUNJUNGAN */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3 border-b border-zinc-200 pb-5">
          <div className="rounded-xl border border-zinc-200 bg-zinc-100 p-3 text-zinc-700">
            <CalendarDays size={22} />
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">
              Riwayat Kunjungan
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Daftar kunjungan member ke gym.
            </p>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-zinc-100">
                <tr className="border-b-2 border-zinc-200 text-left">
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Tanggal
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Biaya
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Pembayaran
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {visits && visits.length > 0 ? (
                  visits.map((visit) => (
                    <tr
                      key={visit.id}
                      className="transition-colors hover:bg-zinc-50"
                    >
                      <td className="px-4 py-3.5 text-sm text-zinc-600">
                        {new Date(
                          `${visit.visit_date}T00:00:00`
                        ).toLocaleDateString("id-ID")}
                      </td>

                      <td className="px-4 py-3.5 text-sm font-semibold text-zinc-900">
                        Rp {visit.visit_fee.toLocaleString("id-ID")}
                      </td>

                      <td className="px-4 py-3.5 text-sm text-zinc-600">
                        {visit.payment_method === "cash"
                          ? "Cash"
                          : visit.payment_method === "qris"
                            ? "QRIS"
                            : visit.payment_method === "transfer"
                              ? "Transfer"
                              : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-10 text-center text-sm text-zinc-500"
                    >
                      Belum ada riwayat kunjungan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}