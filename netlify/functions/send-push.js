// netlify/functions/send-push.js
// Função serverless para enviar Web Push Notifications

const webpush = require("web-push");

webpush.setVapidDetails(
  "mailto:y.facundo@yahoo.com.br",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

exports.handler = async (event) => {
  // Só aceita POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { subscription, title, body, url } = JSON.parse(event.body);

    if (!subscription || !title) {
      return { statusCode: 400, body: "subscription e title são obrigatórios" };
    }

    const payload = JSON.stringify({
      title: title || "YF Contabilidade",
      body:  body  || "",
      url:   url   || "/",
      tag:   "yfcont-" + Date.now(),
    });

    await webpush.sendNotification(subscription, payload);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error("Push error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message }),
    };
  }
};
