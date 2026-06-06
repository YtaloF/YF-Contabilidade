// src/UpdateBanner.jsx
// Componente que exibe o banner de "nova versão disponível" quando o SW atualiza.
// Importe e coloque no topo do seu App.jsx.

import React from "react";

export default function UpdateBanner({ onUpdate }) {
  return (
    <div style={{
      position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)",
      zIndex: 9999, background: "#1A1A1A", color: "#fff",
      borderRadius: 12, padding: "12px 20px",
      display: "flex", alignItems: "center", gap: 16,
      boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
      maxWidth: "calc(100vw - 32px)", width: 380,
    }}>
      <span style={{ fontSize: 20 }}>🔄</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>Nova versão disponível</div>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>Clique para atualizar o portal</div>
      </div>
      <button onClick={onUpdate}
        style={{
          padding: "8px 16px", borderRadius: 8, border: "none",
          background: "linear-gradient(135deg,#D4AA45,#8B6914)",
          color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
        }}>
        Atualizar
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMO USAR NO App.jsx — adicione estes trechos ao arquivo principal:
// ─────────────────────────────────────────────────────────────────────────────
//
// 1. Imports no topo:
//    import usePWA       from "./usePWA";
//    import UpdateBanner from "./UpdateBanner";
//
// 2. Dentro do componente App():
//    const { needsUpdate, applyUpdate } = usePWA();
//
// 3. No JSX, antes do fechamento do </div> principal:
//    {needsUpdate && <UpdateBanner onUpdate={applyUpdate} />}
//
// Resultado: quando você fizer deploy de uma nova versão, o banner aparece
// automaticamente para todos os usuários com o app aberto.
// ─────────────────────────────────────────────────────────────────────────────
