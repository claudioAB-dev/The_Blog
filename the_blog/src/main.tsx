import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Navbar from "./widgets/Navbar";
import Author_info from "./widgets/Author_info";
import { LanguageProvider } from "./widgets/LanguageContext"; // Ajusta la ruta

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <Navbar />
      <Author_info />
    </LanguageProvider>
  </StrictMode>
);
