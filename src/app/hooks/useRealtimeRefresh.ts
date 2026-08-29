import { useEffect, useMemo, useRef } from "react";
import Pusher from "pusher-js";
import { useUserContext } from "../contexts/UserContextProvider";
import { useRealtimeApi } from "./api/entities/realtimeApi";

export function useRealtimeRefresh(onRefresh: () => void, includeAdminChannel = false) {
  const { user } = useUserContext();
  const realtimeApi = useMemo(() => useRealtimeApi(), []);
  const refreshRef = useRef(onRefresh);

  useEffect(() => {
    refreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    if (!user?.id) return;

    let pusher: Pusher | null = null;
    let debounceId: number | null = null;
    let cancelled = false;

    void realtimeApi.config().then((config) => {
      if (cancelled || !config.key) return;

      const secure = config.scheme === "https";
      pusher = new Pusher(config.key, {
        cluster: "mt1",
        wsHost: config.host,
        wsPort: config.port,
        wssPort: config.port,
        forceTLS: secure,
        enabledTransports: secure ? ["wss"] : ["ws"],
        channelAuthorization: {
          endpoint: "/api/realtime/authorize",
          transport: "ajax",
          customHandler: (params, callback) => {
            void realtimeApi.authorize(params.socketId, params.channelName)
              .then((response) => callback(null, response))
              .catch((error) => callback(error as Error, null));
          },
        },
      });

      const refresh = () => {
        if (debounceId !== null) window.clearTimeout(debounceId);
        debounceId = window.setTimeout(() => refreshRef.current(), 250);
      };

      pusher.subscribe(`private-user.${user.id}`).bind("state.updated", refresh);
      if (includeAdminChannel && user.role === "admin") {
        pusher.subscribe("private-admin-dashboard").bind("state.updated", refresh);
      }
    }).catch(() => {
      // A interface continua funcional por HTTP quando o Reverb não está disponível.
    });

    return () => {
      cancelled = true;
      if (debounceId !== null) window.clearTimeout(debounceId);
      pusher?.disconnect();
    };
  }, [includeAdminChannel, realtimeApi, user?.id, user?.role]);
}
