// src/usePWA.js
// Hook que:
// 1. Registra o Service Worker
// 2. Detecta quando há nova versão disponível
// 3. Retorna { needsUpdate, applyUpdate } para exibir banner no App

import { useEffect, useState } from "react";

export default function usePWA() {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [reg, setReg]                 = useState(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").then(registration => {
      setReg(registration);

      // Já existe um SW aguardando? (ex: página não foi recarregada)
      if (registration.waiting) {
        setNeedsUpdate(true);
      }

      // Detecta quando uma atualização começa a instalar
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker?.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setNeedsUpdate(true);
          }
        });
      });
    });

    // Quando o SW toma controle, recarrega a página para aplicar a nova versão
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  function applyUpdate() {
    reg?.waiting?.postMessage({ type: "SKIP_WAITING" });
  }

  return { needsUpdate, applyUpdate };
}
