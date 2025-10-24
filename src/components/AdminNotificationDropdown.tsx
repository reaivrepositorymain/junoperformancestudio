"use client";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { subscribeToNotifications } from "@/lib/supabase-notifications";

interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: string;
  read?: boolean;
}

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState<string | null>(null);

  // Fetch current admin user id from API
  useEffect(() => {
    async function fetchAdminId() {
      const res = await fetch("/api/admin/dashboard", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAdminId(data.id);
      }
    }
    fetchAdminId();
  }, []);

  // Fetch notifications for this admin
  useEffect(() => {
    if (!adminId) return;
    setLoading(true);
    fetch(`/api/notifications?limit=5&receiver_id=${adminId}`)
      .then(res => res.json())
      .then(data => {
        setNotifications(data.notifications || []);
        setLoading(false);
      });
  }, [adminId]);

  // Subscribe to realtime notifications for this admin
  useEffect(() => {
    if (!adminId) return;
    const unsubscribe = subscribeToNotifications((notif) => {
      setNotifications((prev) => [notif, ...prev].slice(0, 5));
    }, adminId);

    return () => {
      unsubscribe();
    };
  }, [adminId]);

  return (
    <div className="relative">
      <button
        type="button"
        className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#E84912] transition-all duration-200"
        onClick={() => setOpen((v) => !v)}
        aria-label="Show notifications"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">{notifications.length}</span>
        </span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b font-semibold text-gray-900 flex items-center justify-between">
            Notifications
            <button className="text-xs text-gray-400 hover:text-[#E84912]" onClick={() => setOpen(false)}>×</button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-gray-500 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm">No notifications.</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`px-4 py-3 border-b last:border-b-0 ${n.read ? "bg-gray-50" : "bg-[#E84912]/10"}`}>
                  <div className="font-medium text-gray-900">{n.title}</div>
                  <div className="text-xs text-gray-600">{n.message}</div>
                  <div className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
          <div className="p-2 border-t text-center">
            <Link
              href="/admin/dashboard/notifications"
              className="text-[#E84912] text-xs font-semibold hover:underline"
              onClick={() => setOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}