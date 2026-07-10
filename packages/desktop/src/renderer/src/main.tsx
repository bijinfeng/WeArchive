import { initApiAdapter } from "@we-archive/ui-shared/hooks";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@astryxdesign/core/reset.css";
import "../../../node_modules/@astryxdesign/core/dist/astryx.css";

import { electronAdapter } from "./api/adapter";
import { QueryProvider } from "./providers/QueryProvider";
import { Router } from "./router";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found");
}

initApiAdapter(electronAdapter);

createRoot(rootElement).render(
  <StrictMode>
    <QueryProvider>
      <Router />
    </QueryProvider>
  </StrictMode>,
);
