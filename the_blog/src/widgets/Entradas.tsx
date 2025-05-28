import React, { useMemo } from "react";
import { useLanguage } from "../widgets/LanguageContext";
import type { LanguageCode } from "../widgets/LanguageContext";

import "./Entradas.css"; // Asegúrate que este archivo CSS exista y esté bien configurado

// --- Definición de Traducciones ---
// Se han renombrado algunas claves para mayor claridad y se han añadido las que faltaban.
const BlogTranslations: Record<
  string,
  Partial<Record<LanguageCode, string>>
> = {
  // Para la página principal del blog
  blogPageTitle: {
    ES: "Entradas del Blog",
    EN: "Blog Entries",
    DE: "Blog-Einträge",
  },
  blogPageDescription: {
    ES: "Explora las últimas entradas del blog.",
    EN: "Explore the latest blog entries.",
    DE: "Entdecken Sie die neuesten Blog-Einträge.",
  },
  noEntriesMessage: {
    ES: "No hay entradas disponibles en este momento.",
    EN: "No entries available at this time.",
    DE: "Derzeit sind keine Einträge verfügbar.",
  },
  // Claves para contenido dinámico con variables (interpolación)
  // Originalmente 'photoAltTextPrefix', ahora es una plantilla completa.
  authorPhotoAltText: {
    ES: "Foto de {name}",
    EN: "Photo of {name}",
    DE: "Foto von {name}",
  },
  // Originalmente 'linkedInAriaLabelPattern'
  authorLinkedInAriaLabel: {
    ES: "Perfil de LinkedIn de {name}",
    EN: "LinkedIn profile of {name}",
    DE: "LinkedIn-Profil von {name}",
  },
  // Originalmente 'githubAriaLabelPattern'
  authorGithubAriaLabel: {
    ES: "Perfil de GitHub de {name}",
    EN: "GitHub profile of {name}",
    DE: "GitHub-Profil von {name}",
  },
  // Si necesitaras traducciones específicas para "título del autor" o "biografía del autor",
  // se definirían aquí. Por ejemplo:
  // authorTitle: { ES: "Autor del Artículo", EN: "Article Author" },
  // authorBio: { ES: "Acerca del autor...", EN: "About the author..." },
};

// --- Función de Traducción Mejorada ---
// Renombrada de getEntradarWidgetLabel a getTranslation para mayor generalidad.
// Ahora maneja la interpolación de variables de forma más genérica.
const getTranslation = (
  key: string,
  lang: LanguageCode,
  // Objeto opcional para interpolar valores. Ej: { name: "Juan", count: 5 }
  interpolations?: Record<string, string | number>
): string => {
  // Lógica de fallback: idioma actual -> Español (como en el original) -> la clave misma.
  const translationTemplate =
    BlogTranslations[key]?.[lang] || BlogTranslations[key]?.["ES"] || key;

  if (interpolations) {
    let result = translationTemplate;
    for (const placeholder in interpolations) {
      // Reemplaza todas las ocurrencias del placeholder, ej: {name}
      result = result.replace(
        new RegExp(`{${placeholder}}`, "g"),
        String(interpolations[placeholder])
      );
    }
    return result;
  }
  return translationTemplate;
};

// --- Componente Entradas ---

// Define la estructura de los datos que el componente mostrará.
// Renombrada de BlogDisplayData a BlogPageDetails para reflejar mejor su propósito.
interface BlogPageDetails {
  pageTitle: string;
  pageDescription: string;
  // Aquí podrían ir otros campos, como una lista de las entradas del blog.
}

const Entradas: React.FC = () => {
  const { currentLanguage } = useLanguage();

  // useMemo para calcular los datos a mostrar.
  // Se recalcula SÓLO cuando currentLanguage cambia, gracias a la dependencia correcta.
  const blogDetails: BlogPageDetails = useMemo(() => {
    return {
      // Se usan las claves de traducción correctas y descriptivas.
      pageTitle: getTranslation("blogPageTitle", currentLanguage),
      pageDescription: getTranslation("blogPageDescription", currentLanguage),
    };
  }, [currentLanguage]); // ¡Dependencia crítica para la actualización con el idioma!

  // Aquí iría la lógica para obtener las entradas del blog.
  // Por ejemplo, podrían venir de props, un estado, o un custom hook.
  const blogEntries: any[] = []; // Placeholder

  return (
    <div className="entradas-page-container">
      {" "}
      {/* Clase CSS más descriptiva */}
      <header className="entradas-header">
        {/* Es semánticamente mejor usar <h1> para el título principal de la página */}
        <h1 className="entradas-main-title">{blogDetails.pageTitle}</h1>
        <p className="entradas-main-description">
          {blogDetails.pageDescription}
        </p>
      </header>
      <section className="entradas-list-section">
        {/* Aquí se mostrarían las entradas o el mensaje de "no hay entradas" */}
        {blogEntries.length > 0 ? (
          <ul>
            {/* TODO: Mapear blogEntries a componentes de item de entrada */}
            {/* Ejemplo: blogEntries.map(entry => <BlogEntryItem key={entry.id} entry={entry} />) */}
          </ul>
        ) : (
          <p className="entradas-no-entries-message">
            {getTranslation("noEntriesMessage", currentLanguage)}
          </p>
        )}
      </section>
      {/*
        Ejemplo de cómo usar la función de traducción con interpolación (si fuera necesario):
        const authorName = "Ana Pérez"; // Nombre del autor (ejemplo)
        const altTextForAuthorImage = getTranslation("authorPhotoAltText", currentLanguage, { name: authorName });
        // <img src="ruta/a/imagen.jpg" alt={altTextForAuthorImage} />
      */}
    </div>
  );
};

export default Entradas;
