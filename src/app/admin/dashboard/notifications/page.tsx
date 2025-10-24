"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle, Circle } from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: string;
  read?: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then(res => res.json())
      .then(data => {
        setNotifications(data.notifications || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-8 py-6 border-b border-gray-200 bg-white/80 shadow-sm">
        <Bell className="h-7 w-7 text-[#E84912]" />
        <h1 className="text-3xl font-bold text-[#E84912] tracking-tight">Notifications</h1>
        <span className="ml-auto text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {loading ? "Loading..." : `${notifications.length} notifications`}
        </span>
      </div>

      {/* Notifications List */}
      <div className="flex-1 flex flex-col items-center w-full py-8 px-2 md:px-10">
        <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
            <span className="font-semibold text-gray-900 text-lg">Inbox</span>
            <button
              className="text-xs text-[#E84912] font-semibold hover:underline"
              onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
            >
              Mark all as read
            </button>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No notifications found.</div>
          ) : (
            <ul>
              {notifications.map((n, idx) => (
                <li
                  key={n.id}
                  className={`flex items-start gap-4 px-6 py-5 border-b last:border-b-0 transition bg-white hover:bg-[#E84912]/5 group ${
                    !n.read ? "font-semibold" : "font-normal"
                  }`}
                >
                  <span className="mt-1">
                    {n.read ? (
                      <CheckCircle className="w-5 h-5 text-gray-300 group-hover:text-[#E84912]" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#E84912]" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-base text-gray-900 group-hover:text-[#E84912]">
                        {n.title}
                      </span>
                      {!n.read && (
                        <span className="ml-2 px-2 py-0.5 text-[10px] bg-[#E84912] text-white rounded-full font-bold">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1 truncate">{n.message}</div>
                  </div>
                  <div className="flex flex-col items-end min-w-[110px]">
                    <span className="text-xs text-gray-400">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                    {!n.read && (
                      <button
                        className="text-xs text-[#E84912] mt-2 hover:underline"
                        onClick={() =>
                          setNotifications(
                            notifications.map((notif, i) =>
                              i === idx ? { ...notif, read: true } : notif
                            )
                          )
                        }
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}