// src/usePush.js
// Gerencia subscription de Web Push para o usuário logado

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

/**
 * Solicita permissão e registra subscription de push.
 * Salva a subscription no Supabase associada ao clientId.
 */
export async function registerPush(clientId, supabase) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
  if (!VAPID_PUBLIC_KEY) { console.warn("VAPID_PUBLIC_KEY não configurada"); return null; }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // Salva subscription no Supabase
    const subJSON = subscription.toJSON();
    await supabase.from("push_subscriptions").upsert({
      client_id: clientId,
      endpoint:  subJSON.endpoint,
      p256dh:    subJSON.keys?.p256dh,
      auth:      subJSON.keys?.auth,
      updated_at: new Date().toISOString(),
    }, { onConflict: "client_id" });

    return subscription;
  } catch (e) {
    console.error("Erro ao registrar push:", e);
    return null;
  }
}

/**
 * Envia push para um ou mais clientes via Netlify Function.
 * clientIds: array de UUIDs
 */
export async function sendPushToClients(clientIds, title, body, supabase) {
  if (!clientIds || clientIds.length === 0) return;

  try {
    // Busca subscriptions dos clientes
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("*")
      .in("client_id", clientIds);

    if (!subs || subs.length === 0) return;

    // Envia para cada subscription
    const results = await Promise.allSettled(
      subs.map(sub =>
        fetch("/.netlify/functions/send-push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription: {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            title,
            body,
            url: "/",
          }),
        })
      )
    );

    const sent = results.filter(r => r.status === "fulfilled").length;
    console.log(`Push enviado para ${sent}/${subs.length} dispositivos`);
    return sent;
  } catch (e) {
    console.error("Erro ao enviar push:", e);
  }
}
