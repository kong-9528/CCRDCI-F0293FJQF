import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "@/App";
import { AuthProvider } from "@/lib/auth";
import { OPS_PUBLIC_URL } from "@/lib/publicEnv";
import "@/styles/ops.css";

document.documentElement.dataset.publicOrigin = new URL(OPS_PUBLIC_URL).origin;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
