import { useEffect } from "react";
import { supabase } from "./supabase";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribePush(clientId) {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push não suportado neste navegador");
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Permissão de notificação negada");
      return false;
    }

    const registration = await navigator.serviceWorker.ready;

    const existing = await registration.pushManager.getSubscription();
    if (existing) await existing.unsubscribe();

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const { endpoint, keys } = subscription.toJSON();

    await supabase.from("push_subscriptions").upsert(
      {
        client_id: clientId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "client_id" }
    );

    console.log("Push subscription salva com sucesso");
    return true;
  } catch (err) {
    console.error("Erro ao subscrever push:", err);
    return false;
  }
}

export async function sendPushNotification(clientId, title, body) {
  try {
    const response = await fetch("/.netlify/functions/send-push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, title, body }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Erro ao enviar push");
    console.log("Push enviado:", data);
    return true;
  } catch (err) {
    console.error("Erro ao enviar push:", err);
    return false;
  }
}

export function usePush(clientId) {
  useEffect(() => {
    if (!clientId) return;
    subscribePush(clientId);
  }, [clientId]);
}
