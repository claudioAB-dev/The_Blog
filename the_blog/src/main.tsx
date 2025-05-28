import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // Estilos globales
import App from "./app"; // Importa el nuevo componente App

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error(
    "Failed to find the root element. Ensure an element with id 'root' exists in your HTML."
  );
}
