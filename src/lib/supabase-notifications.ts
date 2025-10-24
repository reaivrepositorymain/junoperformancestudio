import { supabase } from "@/lib/supabase";

export function subscribeToNotifications(
  onInsert: (notification: any) => void,
  receiver_id: string
) {
  // Listen for new notifications for the current admin (receiver)
  const channel = supabase
    .channel("notifications")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `receiver_id=eq.${receiver_id}`,
      },
      (payload) => {
        onInsert(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}