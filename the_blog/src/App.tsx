import React from "react";
import "./LayoutStyles.css"; // Importa los estilos para el layout responsivo
import { LanguageProvider } from "./widgets/LanguageContext";
import Navbar from "./widgets/Navbar";
import Author_info from "./widgets/Author_info"; // Tu componente de información de autor
import Entradas from "./widgets/Entradas"; // Tu componente de entradas o contenido principal

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <Navbar />
      <div className="page-layout">
        {" "}
        {/* Contenedor principal para el layout responsivo */}
        <main className="main-page-content">
          {/* Aquí es donde va tu contenido principal, como las entradas del blog */}
          <Entradas />
        </main>
        {/* Author_info se renderiza aquí para que los estilos de page-layout lo posicionen */}
        {/* La clase 'page-container-author-widget' ya está en tu componente Author_info */}
        <Author_info />
      </div>
    </LanguageProvider>
  );
};

export default App;
