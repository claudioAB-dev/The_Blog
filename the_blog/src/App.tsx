import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // <-- Importaciones de React Router
import "./LayoutStyles.css"; // Importa los estilos para el layout responsivo
import { LanguageProvider } from "./widgets/LanguageContext";
import Navbar from "./widgets/Navbar";
import Author_info from "./widgets/Author_info";
import Entradas from "./widgets/Entradas";
import EntradaDetalle from "./widgets/EntradaDetalle";
import Footer from "./widgets/footer";

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <BrowserRouter>
        {" "}
        {/* <-- Envolver con BrowserRouter */}
        <Navbar />
        <div className="page-layout">
          <main className="main-page-content">
            {/* El contenido principal ahora es manejado por Routes */}
            <Routes>
              {/* Redirige la ruta raíz ("/") a "/blog" */}
              <Route path="/" element={<Navigate to="/blog" replace />} />

              {/* Ruta para la lista de entradas */}
              <Route path="/blog" element={<Entradas />} />

              {/* Ruta para el detalle de una entrada específica, usando un parámetro dinámico "slug" */}
              <Route path="/blog/:slug" element={<EntradaDetalle />} />

              {/* Puedes agregar más rutas aquí si tu aplicación crece. Ej:
              <Route path="/acerca-de" element={<PaginaAcercaDe />} />
              <Route path="*" element={<NotFoundPage />} /> // Para manejar rutas no encontradas
              */}
            </Routes>
          </main>
          {/* Author_info se mantiene como parte del layout general */}
          <Author_info />
        </div>
        <Footer />
      </BrowserRouter>
    </LanguageProvider>
  );
};

export default App;
