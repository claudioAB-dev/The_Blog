import React, { useMemo, useEffect, useState } from "react";
import { useLanguage } from "../widgets/LanguageContext"; // Asegúrate que esta ruta sea correcta
import type { LanguageCode } from "../widgets/LanguageContext"; // Asegúrate que esta ruta sea correcta

import "./Entradas.css"; // Asegúrate que esta ruta sea correcta

// --- Definición de Traducciones Estáticas de la Página ---
const BlogTranslations: Record<
  string,
  Partial<Record<LanguageCode, string>>
> = {
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
  loadingMessage: {
    ES: "Cargando entradas...",
    EN: "Loading entries...",
    DE: "Lade Einträge...",
  },
  readMore: {
    ES: "Leer más",
    EN: "Read more",
    DE: "Weiterlesen",
  },
};

// --- Función de Traducción ---
const getTranslation = (
  key: string,
  lang: LanguageCode,
  interpolations?: Record<string, string | number>
): string => {
  const translationTemplate =
    BlogTranslations[key]?.[lang] || BlogTranslations[key]?.["ES"] || key;

  if (interpolations) {
    let result = translationTemplate;
    for (const placeholder in interpolations) {
      result = result.replace(
        new RegExp(`{${placeholder}}`, "g"),
        String(interpolations[placeholder])
      );
    }
    return result;
  }
  return translationTemplate;
};

// --- Interfaces ---

// Define la estructura de una entrada de blog individual
interface BlogPost {
  id: number;
  autor_id: number;
  categoria_id: number;
  slug: string;
  imagen_destacada: string;
  estado: string; // e.g., 'publicado', 'borrador'
  fecha_publicacion: string; // Formato ISO 8601 recomendado: "YYYY-MM-DDTHH:mm:ssZ"
  fecha_creacion: string;
  fecha_actualizacion: string;
  // Campos traducibles
  titulo_es: string;
  resumen_es: string;
  contenido_es: string;
  titulo_en?: string; // Opcional si no todas las entradas tienen todas las traducciones
  resumen_en?: string;
  contenido_en?: string;
  titulo_de?: string;
  resumen_de?: string;
  contenido_de?: string;
}

// El API devuelve un array de BlogPost
type ApiResponse = BlogPost[];

// Helper para obtener el campo traducido de una entrada
const getPostTranslatedField = (
  post: BlogPost,
  fieldName: "titulo" | "resumen" | "contenido",
  lang: LanguageCode
): string => {
  const targetLangField =
    `${fieldName}_${lang.toLowerCase()}` as keyof BlogPost;
  const fallbackEsField = `${fieldName}_es` as keyof BlogPost;

  return (
    (post[targetLangField] as string) ||
    (post[fallbackEsField] as string) ||
    `[${fieldName} no disponible]`
  );
};

// --- Componente Entradas ---
const Entradas: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const [blogPosts, setBlogPosts] = useState<BlogPost[] | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // URL del backend (Idealmente desde una variable de entorno)
  const API_URL = "http://127.0.0.1:5000/entradas";
  // Efecto para cargar las entradas del blog
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setCargando(true);
      setError(null);
      try {
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) {
          throw new Error(
            `Error HTTP: ${respuesta.status} ${respuesta.statusText}`
          );
        }
        const json = (await respuesta.json()) as ApiResponse; // Asumimos que la API devuelve directamente el array
        setBlogPosts(json);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Ocurrió un error desconocido al cargar las entradas.");
        }
        setBlogPosts(null); // Limpiar datos en caso de error
      } finally {
        setCargando(false);
      }
    };

    fetchData();
  }, [API_URL]); // Dependencia API_URL por si cambia (aunque generalmente es constante)

  // Textos de la página memoizados para eficiencia
  const pageTitle = useMemo(
    () => getTranslation("blogPageTitle", currentLanguage),
    [currentLanguage]
  );
  const pageDescription = useMemo(
    () => getTranslation("blogPageDescription", currentLanguage),
    [currentLanguage]
  );
  const noEntriesMessage = useMemo(
    () => getTranslation("noEntriesMessage", currentLanguage),
    [currentLanguage]
  );
  const loadingMessage = useMemo(
    () => getTranslation("loadingMessage", currentLanguage),
    [currentLanguage]
  );
  const readMoreText = useMemo(
    () => getTranslation("readMore", currentLanguage),
    [currentLanguage]
  );

  if (cargando) {
    return <div className="entradas-status">{loadingMessage}</div>;
  }

  if (error) {
    return (
      <div className="entradas-status entradas-error">
        Error al cargar las entradas: {error}
      </div>
    );
  }

  if (!blogPosts || blogPosts.length === 0) {
    return (
      <div className="entradas-page-container">
        <header className="entradas-header">
          <h1 className="entradas-main-title">{pageTitle}</h1>
          <p className="entradas-description">{pageDescription}</p>
        </header>
        <section className="entradas-list-section">
          <p className="entradas-no-entries">{noEntriesMessage}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="entradas-page-container">
      <header className="entradas-header">
        <h1 className="entradas-main-title">{pageTitle}</h1>
        <p className="entradas-description">{pageDescription}</p>
      </header>

      <section className="entradas-list-section">
        {blogPosts.map((entry) => {
          const titulo = getPostTranslatedField(
            entry,
            "titulo",
            currentLanguage
          );
          const resumen = getPostTranslatedField(
            entry,
            "resumen",
            currentLanguage
          );
          // const contenido = getPostTranslatedField(entry, "contenido", currentLanguage); // Lo usarías en una vista de detalle

          return (
            <article key={entry.id} className="entrada-item">
              {entry.imagen_destacada && (
                <img
                  src={entry.imagen_destacada}
                  alt={`Imagen para ${titulo}`}
                  className="entrada-imagen"
                />
              )}
              <div className="entrada-contenido">
                <h2 className="entrada-titulo">{titulo}</h2>
                <p className="entrada-meta">
                  <span>
                    Publicado:{" "}
                    {new Date(entry.fecha_publicacion).toLocaleDateString(
                      currentLanguage.toLowerCase() +
                        "-" +
                        currentLanguage.toUpperCase()
                    )}
                  </span>
                  {/* Podrías añadir más metadatos como autor o categoría aquí */}
                </p>
                <p className="entrada-resumen">{resumen}</p>
                {/* En un listado, usualmente enlazas a la página de detalle de la entrada */}
                {/* Ejemplo: <a href={`/blog/${entry.slug}`}>{readMoreText}</a> */}
                {/* O si usas React Router: <Link to={`/blog/${entry.slug}`}>{readMoreText}</Link> */}
                <a href={`/blog/${entry.slug}`} className="entrada-leer-mas">
                  {readMoreText}
                </a>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};

export default Entradas;
