
import { createClient } from "@/lib/supabase/client";

export type ActivityAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "VIEW"
  | "EXPORT"
  | "ACTIVATE"
  | "DEACTIVATE";

type LogActivityParams = {
  action: ActivityAction;
  description: string;
  branchId?: string | null;
};

export async function logActivity({
  action,
  description,
  branchId = null,
}: LogActivityParams) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error(
      "Gagal mencatat aktivitas: pengguna tidak ditemukan."
    );
    return;
  }

  const { error } = await supabase
    .from("activity_logs")
    .insert({
      user_id: user.id,
      branch_id: branchId,
      action,
      description: description.trim(),
    });

  if (error) {
    console.error("Gagal mencatat aktivitas:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
  }
}
