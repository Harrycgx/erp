import { useEffect, useState } from "react";

import useAuth from "../../features/auth/useAuth";

import supabase from "../../lib/supabase";

import {
  fetchNotifications,
} from "../../services/notifications/notificationService";

export default function NotificationBell() {
  const { user } = useAuth();

  const [notifications,
    setNotifications] =
    useState([]);

  const [open, setOpen] =
    useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    loadNotifications();

    const channel =
      supabase
        .channel(
          "notifications-realtime"
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",

            schema: "public",

            table:
              "notifications",
          },
          (payload) => {
            const notification =
              payload.new;

            if (
              notification.user_id ===
              user.id
            ) {
              setNotifications(
                (prev) => [
                  notification,
                  ...prev,
                ]
              );
            }
          }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [user]);

  async function loadNotifications() {
    const data =
      await fetchNotifications(
        user.id
      );

    setNotifications(data);
  }

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;

  return (
    <div className="relative">
      <button
        onClick={() =>
          setOpen(!open)
        }
        className="
          relative rounded-full
          bg-white/10
          px-4 py-2
          text-white
        "
      >
        🔔

        {unreadCount > 0 && (
          <span
            className="
              absolute -right-1 -top-1
              flex h-5 w-5
              items-center justify-center
              rounded-full
              bg-red-500
              text-xs font-bold text-white
            "
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open &&
        notifications.length >
          0 && (
          <div
            className="
              absolute right-0 top-14
              z-50
              w-80 rounded-2xl
              border border-white/10
              bg-[#111827]
              p-4 shadow-2xl
            "
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Notifications
              </h3>

              <span className="text-xs text-slate-400">
                {notifications.length}
              </span>
            </div>

            <div className="space-y-3">
              {notifications.map(
                (
                  notification
                ) => (
                  <div
                    key={
                      notification.id
                    }
                    className="
                      rounded-xl
                      bg-white/5
                      p-3
                    "
                  >
                    <p className="font-semibold text-white">
                      {
                        notification.title
                      }
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {
                        notification.message
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
    </div>
  );
}